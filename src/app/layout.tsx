import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import { GeistMono } from "geist/font/mono";
import { GeistPixelCircle } from "geist/font/pixel";

export const metadata: Metadata = {
  title: "LensPaper — Research Paper Visualizer",
  description:
    "Upload any research paper and explore its concepts through interactive 3Blue1Brown-style visualizations. Choose your depth — from intuitive analogies to rigorous proofs.",
  keywords: ["research paper", "visualization", "AI", "machine learning", "academic"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${GeistMono.variable} ${GeistPixelCircle.variable}`}>
      <body className="antialiased min-h-screen" style={{ background: "#0b0b0b", color: "#f0ece4" }}>
        <Navigation />
        <main className="pt-12">{children}</main>
      </body>
    </html>
  );
}
