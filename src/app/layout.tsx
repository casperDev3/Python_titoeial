import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { navItems } from "@/content/nav";
import { Sidebar } from "@/components/shell/Sidebar";
import { ThemeSync } from "@/components/shell/ThemeSync";
import { MobileBar } from "@/components/shell/MobileBar";
import { sidebarInitScript } from "@/lib/sidebar";
import { Credit } from "@/components/shell/Credit";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "cyrillic"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: {
    default: "Python-hero / ITstep — основи Python з героями",
    template: "%s · Python-hero / ITstep",
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
      <head>
        <script dangerouslySetInnerHTML={{ __html: sidebarInitScript }} />
      </head>
      <body className="min-h-full">
        <ThemeSync items={navItems} />
        <Sidebar items={navItems} />
        <MobileBar items={navItems} />
        <div className="content-shell lg:pl-[calc(var(--sidebar-w)+24px)]">
          {children}
          <footer className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 border-t border-separator px-4 py-6 text-[13px] text-label-2 sm:px-8">
            <span>
              <span className="font-semibold text-label">Python-hero</span> / ITstep
            </span>
            <Credit />
          </footer>
        </div>
      </body>
    </html>
  );
}
