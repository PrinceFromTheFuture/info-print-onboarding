import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Provider as TRPCProvider } from "@/Providers/trpc";
import { ReduxProvider } from "@/Providers/redux-provider";
import DAL from "@/components/DAL";
import { Toaster } from "sonner";
import { VisitReporter } from "@/components/VisitReporter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InfoFloPrint OnBoarding",
  
  description:
    "Streamline your workflow with our comprehensive form management system. Manage templates, assignments, and submissions efficiently.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",

  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCProvider>
          <ReduxProvider>
            <VisitReporter />
            {children}
          </ReduxProvider>
        </TRPCProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
