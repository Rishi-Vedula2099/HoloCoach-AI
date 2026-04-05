import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HoloCoach AI — Real-time AI Sports Coaching",
  description:
    "Real-time AI + AR sports coaching platform with pose detection, biomechanics analysis, and personalized feedback across 10+ sports.",
  keywords: [
    "AI coaching",
    "sports training",
    "pose detection",
    "biomechanics",
    "AR overlay",
    "MediaPipe",
    "motion analysis",
  ],
  openGraph: {
    title: "HoloCoach AI — Your AI Coach, Everywhere",
    description:
      "Real-time pose detection, multi-sport biomechanics analysis, and AI-powered coaching feedback.",
    type: "website",
    siteName: "HoloCoach AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "HoloCoach AI — AI + AR Sports Coaching",
    description:
      "Real-time pose detection & AI coaching for 10+ sports.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="theme-color" content="#4A90E2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
