import "./globals.css";
import type { Metadata } from "next";
import { UIModeProvider } from "@/components/UIModeProvider";

export const metadata: Metadata = { title: "24h Stock Wall", description: "QR/BMC paywall + 24h unlock" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans" data-ui="glass">
      <body><UIModeProvider>{children}</UIModeProvider></body>
    </html>
  );
}
