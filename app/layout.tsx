import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google"; // Import font mới
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

// Cấu hình font Be Vietnam Pro
const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese"], // Bắt buộc phải có "vietnamese"
  weight: ["400", "500", "600", "700"], // Chọn các độ đậm cần thiết
  variable: "--font-be-vietnam",
});

export const metadata: Metadata = {
  title: "Góc Học Liệu Văn Học",
  description: "Hệ thống học liệu phi ngôn ngữ thời gian thực",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi"
      className="h-full scroll-smooth"
      data-scroll-behavior="smooth"
    >
      <body className={`${beVietnamPro.className} antialiased min-h-full flex flex-col bg-white text-slate-900`}>
        <main className="flex-grow">
          {children}
        </main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}