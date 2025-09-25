import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <section className="h-screen w-screen flex flex-col items-center justify-center bg-background">
      <h1 className="text-6xl font-black tracking-tight text-foreground text-center">Page not found</h1>
      <Link href="/">
        <div className="mt-16 bg-card text-card-foreground text-xl font-medium flex items-center justify-center px-6 py-3 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors">
          <span>Home</span>
          <ArrowRight className="ml-2" />
        </div>
      </Link>
    </section>
  );
}
