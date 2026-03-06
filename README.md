# Bookified - Talk to PDF 📚🎙️

An interactive "Next.js" application that allows users to upload PDF books and have real-time voice conversations with them using AI.

## 🚀 Step-by-Step Development Process

### 1. Project Initialization & Auth
- **Bootstrap**: Created the project using `Next.js 15` with `create-next-app` for the App Router architecture.
- **Authentication**: Integrated `Clerk` for secure user authentication, multi-session management, and user metadata.
- **Styling**: Configured `Tailwind CSS` for a premium, responsive design system.

### 2. Database & Storage Setup
- **Database**: Integrated `MongoDB` via `Mongoose` to store book metadata, text segments, and user session logs.
- **File Storage**: Set up `Vercel Blob` for cloud storage of uploaded PDFs and book cover images.

### 3. Book Processing Pipeline
- **PDF Parsing**: Implemented `pdfjs-dist` on the client-side to extract raw text and auto-generate cover images from the first page of uploaded files.
- **Text Chunking**: Developed a `splitIntoSegments` utility to break down long PDF text into manageable chunks (500 words with overlap) to facilitate efficient searching.
- **Search Infrastructure**: Configured MongoDB Text Indexes and regex fallbacks to enable "Semantic-lite" searching within book contents.

### 4. Voice & Interactive Layer
- **Vapi Integration**: Integrated the `@vapi-ai/web` SDK to handle low-latency, full-duplex voice conversations.
- **Persona Customization**: Built a selector for different AI "Voices" using `ElevenLabs` integration via Vapi.
- **Real-time Transcripts**: Developed a dynamic UI to show live speech-to-text and AI responses.

### 5. Subscription & Limits
- **Plan Management**: Created a utility to handle multi-tier plans (Free vs. Pro) with specific limits on book uploads and session duration.
- **Stripe Integration**: Added payment processing for premium tier upgrades.

---

## 🛠️ Functions Workflow

### Book Upload Flow
1. **User Input**: User provides Title, Author, and selects a Voice.
2. **Processing**: `parsePDFFile` extracts text and generating a thumbnail.
3. **Storage**: PDF is uploaded to `Vercel Blob`.
4. **Database Insertion**: `createBook` saves metabolic data to MongoDB.
5. **Segmenting**: `saveBookSegments` stores text chunks for future retrieval.

### Voice Conversation Flow
1. **Initialization**: `useVapi` hook initializes the Vapi client with the selected book persona.
2. **Session Start**: `startVoiceSession` validates user limits and logs the start time.
3. **Context Injection**: When a user asks a question, Vapi calls our `/api/vapi/search-book` webhook.
4. **RAG (Retrieval Augmented Generation)**:
   - Webhook calls `searchBookSegments`.
   - Relevant text is returned to the AI Assistant.
5. **AI Response**: Assistant synthesizes the text into a natural response delivered via audio and transcript.
6. **Session Termination**: `endVoiceSession` calculates duration and updates user limits.

---

## 🏗️ Tech Stack & Implementation Details

| Functionality | Technology | Service/Library |
| :--- | :--- | :--- |
| **Frontend Framework** | React / Next.js 15 | App Router, Server Actions |
| **Styling & UI** | Tailwind CSS | Lucide Icons, Sonner (Toasts) |
| **Authentication** | Clerk | middleware, @clerk/nextjs |
| **Real-time Voice** | Vapi.ai | @vapi-ai/web SDK |
| **AI Voice Synthesis**| ElevenLabs | Integrated via Vapi |
| **Database** | MongoDB | Mongoose ORM |
| **Object Storage** | Vercel Blob | PDF & Image hosting |
| **PDF Processing** | PDF.js | pdfjs-dist |
| **Search (RAG)** | MongoDB Text Search | Regex Fallback |
| **Payments** | Stripe | Subscription Management |

---

## 🛠️ Getting Started

First, install dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
