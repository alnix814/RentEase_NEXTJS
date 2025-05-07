import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/shared/header";
import ClientSessionProvider from "@/components/ui/ClientSessionProvider";
import { Toaster } from "sonner";
import Footer from "@/components/shared/footer";

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
          <Footer/>
          <Toaster/>
        </ClientSessionProvider>

      </body>
    </html>
  );
}
