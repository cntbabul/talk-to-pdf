import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@clerk/nextjs/server";
import { MAX_FILE_SIZE } from "@/lib/constants";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const filename = formData.get('filename') as string | null;

        if (!file || !filename) {
            return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File exceeds maximum allowed size' }, { status: 400 });
        }

        const blob = await put(filename, file, {
            access: 'public',
            token: process.env.talk_to_pdf_READ_WRITE_TOKEN,
            addRandomSuffix: true,
        });

        return NextResponse.json({ url: blob.url, pathname: blob.pathname });
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unknown error occurred";
        console.error('Upload error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
