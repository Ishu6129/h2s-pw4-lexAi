import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LexAI — AI-Powered Legal Document Assistant',
  description:
    'Understand, analyze, and compare legal documents with AI. Get plain-English summaries, risk assessments, and actionable guidance — instantly.',
  keywords: ['legal AI', 'contract analysis', 'legal document review', 'AI lawyer assistant'],
  authors: [{ name: 'LexAI' }],
  openGraph: {
    title: 'LexAI — AI-Powered Legal Document Assistant',
    description: 'Understand legal documents instantly with Groq-powered AI analysis.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
