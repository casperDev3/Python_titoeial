import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6 text-center">
      <div className="glass max-w-md p-10">
        <span className="icon-tile mx-auto size-16 !rounded-[18px]"><SearchX className="size-8" strokeWidth={1.5} /></span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">404: KeyError</h1>
        <p className="mt-2 text-label-2">Цієї сторінки немає в словнику. Навіть Ґоджьо не знайшов.</p>
        <Link href="/" className="pill pill-accent mt-6">На головну</Link>
      </div>
    </div>
  );
}
