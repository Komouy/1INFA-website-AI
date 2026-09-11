import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "1INFA Class AI - WhatsApp Bot & Academic Dashboard",
  description: "Smart WhatsApp Class Automation powered by Gemini AI, FastAPI & Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col md:flex-row">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-slate-950/40">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
