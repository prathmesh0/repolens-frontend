'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FolderTree, MessageSquare, Sparkles } from 'lucide-react';
import DemoButton from '@/components/landing/DemoButton';
import DemoVideo from '@/components/landing/DemoVideo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { fadeUp, stagger } from '@/lib/motion';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI repository insights',
    text: 'Summary, architecture and potential issues in minutes.',
  },
  {
    icon: FolderTree,
    title: 'File structure explorer',
    text: 'Browse the whole project tree without cloning it.',
  },
  {
    icon: MessageSquare,
    title: 'Chat with your codebase',
    text: 'Ask questions and get answers grounded in your files.',
  },
];

export default function LandingPage() {
  const router = useRouter();

  // Signed-in users skip the landing page. A plain fetch is used on purpose:
  // the shared client would redirect a visitor to /login on a 401.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/users/me', { credentials: 'include', cache: 'no-cache' })
      .then((res) => {
        if (res.ok && !cancelled) router.replace('/home');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background text-foreground">
      <div className="bg-hero-glow absolute inset-0" aria-hidden />
      <div className="bg-grid absolute inset-0" aria-hidden />

      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card ring-1 ring-border">
            <Image src="/favicon.ico" alt="" width={22} height={22} />
          </div>
          <span className="text-lg font-semibold tracking-tight">Repolens</span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md px-3 py-2 font-medium text-primary transition-colors hover:underline"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto max-w-5xl px-6 pb-20 pt-16 sm:pt-24">
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h1
            variants={fadeUp}
            className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl"
          >
            Understand any repository, <span className="text-primary">fast</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-base text-muted-foreground sm:text-lg"
          >
            Paste a GitHub link and get an AI summary, the file structure and a
            chat that answers questions about the code.
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          >
            <DemoButton className="h-11 px-5" />
            <DemoVideo />
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mt-3 text-xs text-muted-foreground"
          >
            No sign-up needed. The demo lasts 1 hour and its data is deleted
            afterwards.
          </motion.p>
        </motion.div>

        <motion.ul
          variants={stagger(0.08)}
          initial="hidden"
          animate="show"
          className="mt-20 grid gap-4 sm:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <motion.li
              key={title}
              variants={fadeUp}
              className="rounded-2xl border border-border bg-card/70 p-5"
            >
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="mt-3 font-medium">{title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </motion.li>
          ))}
        </motion.ul>
      </main>
    </div>
  );
}
