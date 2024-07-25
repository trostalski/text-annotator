import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/ui/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Text Annotator",
  description: "A simple tool for creating text annotations.",
  keywords: "text, annotations, tool, PDF, annotate",
  authors: [
    {
      name: "Till Rostalski",
    },
  ],
  openGraph: {
    title: "Text Annotator",
    description: "A simple tool for creating text annotations.",
    type: "website",
    url: "https://text-json-annotator.vercel.app/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Till Rostalski" />
        <meta
          name="keywords"
          content="text, annotations, tool, PDF, annotate"
        />
        <meta property="og:title" content="Text Annotator" />
        <meta
          property="og:description"
          content="A simple tool for creating text annotations."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://text-json-annotator.vercel.app/"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Text Annotator" />
        <meta
          name="twitter:description"
          content="A simple tool for creating text annotations."
        />
        <meta
          name="twitter:image"
          content="https://text-json-annotator.vercel.app/twitter-image.png"
        />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Inter&display=swap"
        />
        <title>Text Annotator</title>
      </head>
      <body
        className={cn(
          inter.className,
          "h-screen overflow-hidden flex flex-col"
        )}
      >
        <Header />
        <div className="min-h-0 grow">{children}</div>
      </body>
    </html>
  );
}
