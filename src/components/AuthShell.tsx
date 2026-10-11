'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FolderTree, MessageSquare, Sparkles } from 'lucide-react';
import { fadeUp, stagger } from '@/lib/motion';

const POINTS = [
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

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card ring-1 ring-border">
        <Image src="/favicon.ico" alt="Repolens" width={22} height={22} />
      </div>
      <span className="text-lg font-semibold tracking-tight">Repolens</span>
    </div>
  );
}

// Shared frame for login and register: brand panel on large screens,
// just the form on small ones.
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-background text-foreground lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-muted/40 p-12 lg:flex">
        <div className="bg-hero-glow absolute inset-0" aria-hidden />
        <div className="bg-grid absolute inset-0" aria-hidden />

        <div className="relative">
          <Brand />
        </div>

        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          animate="show"
          className="relative max-w-md space-y-8"
        >
          <motion.h2
            variants={fadeUp}
            className="text-4xl font-semibold leading-[1.15] tracking-tight"
          >
            Understand any repository,{' '}
            <span className="text-gradient-brand">faster.</span>
          </motion.h2>

          <ul className="space-y-5">
            {POINTS.map(({ icon: Icon, title, text }) => (
              <motion.li
                key={title}
                variants={fadeUp}
                className="flex items-start gap-3.5"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="block text-sm text-muted-foreground">
                    {text}
                  </span>
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Repolens
        </p>
      </aside>

      <main className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="bg-hero-glow absolute inset-0 lg:hidden" aria-hidden />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="relative w-full max-w-sm space-y-8"
        >
          <div className="lg:hidden">
            <Brand />
          </div>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
