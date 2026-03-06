'use client';

import React, { useRef } from 'react';
import { FieldValues } from 'react-hook-form';
import { X } from 'lucide-react';
import { FileUploadFieldProps } from '@/types';
import { cn } from '@/lib/utils';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const FileUploader = <T extends FieldValues>({
    control, name, label, acceptTypes, disabled, icon: Icon, placeholder, hint
}: FileUploadFieldProps<T>) => {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => {
                const isUploaded = !!value;

                const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        onChange(file);
                    }
                };

                const onRemove = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    onChange(null);
                    if (inputRef.current) {
                        inputRef.current.value = '';
                    }
                };

                return (
                    <FormItem className="w-full">
                        <FormLabel className="form-label">{label}</FormLabel>
                        <FormControl>
                            <div
                                className={cn(
                                    'upload-dropzone border-2 border-dashed border-[#8B7355]/20 focus-visible:ring-2 focus-visible:ring-[#8B7355] outline-none cursor-pointer',
                                    isUploaded && 'upload-dropzone-uploaded',
                                    disabled && 'opacity-50 cursor-not-allowed'
                                )}
                                onClick={() => !disabled && inputRef.current?.click()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        if (!disabled && inputRef.current) {
                                            inputRef.current.click();
                                        }
                                    }
                                }}
                                tabIndex={disabled ? -1 : 0}
                                role="button"
                                aria-label={`Upload ${label}`}
                            >
                                <input
                                    id={name}
                                    type="file"
                                    accept={acceptTypes.join(',')}
                                    className="sr-only"
                                    ref={inputRef}
                                    onChange={handleFileChange}
                                    disabled={disabled}
                                />

                                {isUploaded ? (
                                    <div className="flex flex-col items-center relative w-full px-4">
                                        <p className="upload-dropzone-text line-clamp-1">{(value as File).name}</p>
                                        <button
                                            type="button"
                                            onClick={onRemove}
                                            aria-label="Remove selected file"
                                            className="upload-dropzone-remove mt-2"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Icon className="upload-dropzone-icon" />
                                        <p className="upload-dropzone-text">{placeholder}</p>
                                        <p className="upload-dropzone-hint">{hint}</p>
                                    </>
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
};

export default FileUploader;