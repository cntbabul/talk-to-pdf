import type { Metadata } from "next";
import { IBM_Plex_Serif, Mona_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from 'sonner';
import { CLERK_AUTH_APPEARANCE_OVERRIDE } from "@/lib/constants";

const ibmPlexSerif = IBM_Plex_Serif({
  variable: "--font-ibm-plex-serif",
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

const monaSans = Mona_Sans({
  variable: '--font-mona-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
  display: 'swap',
})


export const metadata: Metadata = {
  title: "Talk To PDF",
  description: "Chat with your PDF documents using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ elements: CLERK_AUTH_APPEARANCE_OVERRIDE }}>
      <html lang="en">
        <body
          className={`${ibmPlexSerif.variable} ${monaSans.variable} antialiased`}
        >
          <Navbar />
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
