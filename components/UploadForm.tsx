'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, ImageIcon } from 'lucide-react';
import { UploadSchema } from '@/lib/zod';
import { BookUploadFormValues } from '@/types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ACCEPTED_PDF_TYPES, ACCEPTED_IMAGE_TYPES } from '@/lib/constants';
import FileUploader from './FileUploader';
import VoiceSelector from './VoiceSelector';
import LoadingOverlay from './LoadingOverlay';
import { useAuth } from "@clerk/nextjs";
import { toast } from 'sonner';
import { checkBookExists, createBook, saveBookSegments } from "@/lib/actions/book.actions";
import { useRouter } from "next/navigation";
import { parsePDFFile } from "@/lib/utils";

// Upload a file to Vercel Blob via our server-side API route — no client SDK needed
const uploadToBlob = async (
    filename: string,
    file: File | Blob,
    contentType: string
): Promise<{ url: string; pathname: string }> => {
    const formData = new FormData();
    const fileObj = file instanceof File ? file : new File([file], filename, { type: contentType });
    formData.append('file', fileObj, filename);
    formData.append('filename', filename);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
    }
    return res.json();
};

const UploadForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const { userId } = useAuth();
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<BookUploadFormValues>({
        resolver: zodResolver(UploadSchema),
        defaultValues: {
            title: '',
            author: '',
            persona: '',
            pdfFile: undefined,
            coverImage: undefined,
        },
    });

    const onSubmit = async (data: BookUploadFormValues) => {
        if (!userId) {
            return toast.error("Please login to upload books");
        }

        setIsSubmitting(true);
        // console.log('[Upload] Starting upload for:', data.title);

        // PostHog -> Track Book Uploads...

        try {
            // console.log('[Upload] Step 1: Checking if book already exists...');
            const existsCheck = await checkBookExists(data.title);

            if (existsCheck.exists && existsCheck.book) {
                // console.log('[Upload] Book already exists, redirecting...');
                toast.info("Book with same title already exists.");
                form.reset()
                router.push(`/books/${existsCheck.book.slug}`)
                return;
            }

            const fileTitle = data.title.replace(/\s+/g, '-').toLowerCase();
            const pdfFile = data.pdfFile;

            // console.log('[Upload] Step 2: Parsing PDF...', { fileTitle, fileSize: pdfFile.size });
            const parsedPDF = await parsePDFFile(pdfFile);
            // console.log('[Upload] PDF parsed:', { pages: parsedPDF.content.length });

            if (parsedPDF.content.length === 0) {
                toast.error("Failed to parse PDF. Please try again with a different file.");
                return;
            }

            // console.log('[Upload] Step 3: Uploading PDF to blob storage...');
            const uploadedPdfBlob = await uploadToBlob(fileTitle, pdfFile, 'application/pdf');
            // console.log('[Upload] PDF uploaded:', uploadedPdfBlob.url);

            let coverUrl: string;

            if (data.coverImage) {
                // console.log('[Upload] Step 4a: Uploading provided cover image...');
                const uploadedCoverBlob = await uploadToBlob(`${fileTitle}_cover.png`, data.coverImage, data.coverImage.type);
                coverUrl = uploadedCoverBlob.url;
            } else {
                // console.log('[Upload] Step 4b: Uploading auto-generated cover from PDF...');
                const response = await fetch(parsedPDF.cover);
                const blob = await response.blob();
                const uploadedCoverBlob = await uploadToBlob(`${fileTitle}_cover.png`, blob, 'image/png');
                coverUrl = uploadedCoverBlob.url;
            }
            // console.log('[Upload] Cover uploaded:', coverUrl);

            // console.log('[Upload] Step 5: Creating book record in database...');
            const book = await createBook({
                clerkId: userId,
                title: data.title,
                author: data.author,
                persona: data.persona,
                fileURL: uploadedPdfBlob.url,
                fileBlobKey: uploadedPdfBlob.pathname,
                coverURL: coverUrl,
                fileSize: pdfFile.size,
            });
            // console.log('[Upload] createBook result:', book);

            if (!book.success) {
                console.error('[Upload] Book creation failed:', book.error);
                if (book.isBillingError) {
                    toast.error('Upload limit reached', {
                        description: `You've used all your book slots on the free plan. Upgrade to add more books.`,
                        duration: 5000,
                    });
                    setTimeout(() => router.push('/'), 2000);
                } else {
                    toast.error(book.error as string || 'Failed to create book');
                }
                return;
            }

            if (book.alreadyExists) {
                // console.log('[Upload] Duplicate book detected, redirecting...');
                toast.info("Book with same title already exists.");
                form.reset()
                router.push(`/books/${book.data.slug}`)
                return;
            }

            // console.log('[Upload] Step 6: Saving book segments...', { bookId: book.data._id, segments: parsedPDF.content.length });
            const segments = await saveBookSegments(book.data._id, userId, parsedPDF.content);
            // console.log('[Upload] Segments saved:', segments);

            if (!segments.success) {
                toast.error("Failed to save book segments");
                return;
            }

            toast.success('Book uploaded successfully!', {
                description: `"${data.title}" is ready in your library.`,
                duration: 3000,
            });
            form.reset();
            setTimeout(() => router.push('/'), 1500);
        } catch (error) {
            console.error('[Upload] ❌ Uncaught error:', error);
            toast.error("Failed to upload book. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isMounted) return null;

    return (
        <>
            {isSubmitting && <LoadingOverlay />}

            <div className="new-book-wrapper">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* 1. PDF File Upload */}
                        <FileUploader
                            control={form.control}
                            name="pdfFile"
                            label="Book PDF File"
                            acceptTypes={ACCEPTED_PDF_TYPES}
                            icon={Upload}
                            placeholder="Click to upload PDF"
                            hint="PDF file (max 50MB)"
                            disabled={isSubmitting}
                        />

                        {/* 2. Cover Image Upload */}
                        <FileUploader
                            control={form.control}
                            name="coverImage"
                            label="Cover Image (Optional)"
                            acceptTypes={ACCEPTED_IMAGE_TYPES}
                            icon={ImageIcon}
                            placeholder="Click to upload cover image"
                            hint="Leave empty to auto-generate from PDF"
                            disabled={isSubmitting}
                        />

                        {/* 3. Title Input */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="form-input"
                                            placeholder="ex: Rich Dad Poor Dad"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 4. Author Input */}
                        <FormField
                            control={form.control}
                            name="author"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Author Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            className="form-input"
                                            placeholder="ex: Robert Kiyosaki"
                                            {...field}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 5. Voice Selector */}
                        <FormField
                            control={form.control}
                            name="persona"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                                    <FormControl>
                                        <VoiceSelector
                                            value={field.value}
                                            onChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* 6. Submit Button */}
                        <Button type="submit" className="form-btn" disabled={isSubmitting}>
                            Begin Synthesis
                        </Button>
                    </form>
                </Form>
            </div>
        </>
    );
};

export default UploadForm;