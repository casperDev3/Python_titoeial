import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { navItems } from "@/content/nav";
import { Sidebar } from "@/components/shell/Sidebar";
import { ThemeSync } from "@/components/shell/ThemeSync";
import { MobileBar } from "@/components/shell/MobileBar";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "Python Hero Academy — основи Python з героями аніме",
    template: "%s · Python Hero Academy",
  },
  description:
    "Інтерактивний курс основ Python: 3D-візуалізації, живий код у браузері, лайфхаки та жарти від супергероїв і героїв аніме.",
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" data-scroll-behavior="smooth" className={`${inter.variable} ${mono.variable} h-full`}>
      <body className="min-h-full">
        <ThemeSync items={navItems} />
        <Sidebar items={navItems} />
        <MobileBar items={navItems} />
        <div className="lg:pl-[calc(var(--sidebar-w)+24px)]">{children}</div>
      </body>
    </html>
  );
}
