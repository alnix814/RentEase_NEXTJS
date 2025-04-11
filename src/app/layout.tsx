import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/header";
import ClientSessionProvider from "@/components/ui/ClientSessionProvider";
import { Toaster } from "sonner";

const InterSans = Inter({
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "RentEase",
  description: "Найдите удобное и комфортное жилье для себя!",
  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${InterSans.className} antialiased`}
      >
        <ClientSessionProvider>
          <Header/>
          {children}
          <Toaster/>
        </ClientSessionProvider>

      </body>
    </html>
  );
}
