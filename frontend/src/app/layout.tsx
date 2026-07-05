import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import OnboardingTour from "@/components/OnboardingTour";

import { AuthProvider } from "@/context/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tra cứu Luật Xây Dựng AI",
  description: "Hệ thống tra cứu văn bản pháp lý ngành xây dựng tích hợp AI Chatbot RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "mock-client-id.apps.googleusercontent.com"}>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <div className="flex flex-col h-screen overflow-hidden">
                <Header />
                <main className="flex-1 overflow-hidden">
                  {children}
                  <OnboardingTour />
                </main>
              </div>
            </ThemeProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
