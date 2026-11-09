'use client';

import { useState } from 'react';
import {
  FolderTree,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import { BODY } from '@/lib/Config';
import { Y } from '@/lib/yup';
import { useRouter } from 'next/navigation';
import { Repository } from '@/api/services';
import { Toast } from '@/lib/Toast';
import { IAnalyse } from '@/types/repo';
import { Input } from '@/components/ui/input';
import CustomButton from '@/components/CustomButton';
import Link from 'next/link';
import { ME_QUERY_KEY, useMe } from '@/lib/useMe';
import { DEMO_LIMIT_REACHED } from '@/lib/demo';
import { capitalizeFirstLetter } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fadeUp, stagger } from '@/lib/motion';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI Repository Insights',
    desc: "Get instant, intelligent breakdowns of your repo's structure and performance metrics using cutting-edge AI.",
  },
  {
    icon: FolderTree,
    title: 'File Structure Visualizer',
    desc: 'Explore your project’s file hierarchy with clean, intuitive diagrams enriched with smart recommendations.',
  },
  {
    icon: MessageSquare,
    title: 'Chat with AI Assistant',
    desc: 'Interact directly with an AI trained to understand your project. Ask questions, get suggestions, and debug faster.',
  },
];

export default function HomePage() {
  const { data: user } = useMe();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const isDemo = Boolean(user?.isDemo);
  const demo = user?.demo;
  const limitReached = !!demo && demo.analysesUsed >= demo.analysesMax;
  const analysesLeft = demo
    ? Math.max(demo.analysesMax - demo.analysesUsed, 0)
    : 0;

  // Sample repos are ready-made, so opening one costs nothing from the quota
  const { data: samples } = useQuery({
    queryKey: ['samples'],
    queryFn: Repository.getSamples,
    enabled: isDemo,
    staleTime: 5 * 60 * 1000,
  });

  const formik = useFormik<IAnalyse>({
    initialValues: BODY.REPOSITORY.ANALYSE(),
    validationSchema: Y.repoAnalyseSchema,
    onSubmit: async (val) => {
      setLoading(true);
      const res = await Repository.analyseRepository(val);
      setLoading(false);
      // Keep the "n of 2 used" counter in the banner and below up to date
      if (isDemo) queryClient.invalidateQueries({ queryKey: ME_QUERY_KEY });
      if (res?.success || res?.statusCode === 201) {
        const repoInfo = res.data.basicInfo;
        // 201 = new run queued; 200 = a run is already live for this repo.
        if (res.statusCode === 200) {
          Toast.info('This repository is already being analysed.', {
            duration: 5000,
          });
        } else {
          Toast.success(
            `Analysis started! This might take a few minutes to complete.`,
            { duration: 5000 }
          );
        }
        queryClient.invalidateQueries({ queryKey: ['repoHistory'] });
        // Navigate to chat page after short delay
        router.push(`/chat/${repoInfo._id}`);
      } else if (res?.errors?.[0]?.code === DEMO_LIMIT_REACHED) {
        // Our count may be stale (another tab); the refetch above fixes it
        Toast.error(
          res.message || 'Demo limit reached. Sign up to analyse more.'
        );
      } else {
        Toast.error(res?.message || 'Something went wrong');
      }
    },
  });

  const urlError = formik.touched.url ? (formik.errors.url as string) : '';

  return (
    <div className="relative flex min-h-full w-full flex-col overflow-hidden">
      {/* Decorative backdrop */}
      <div
        className="bg-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        aria-hidden
      />
      <div
        className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        aria-hidden
      />

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 sm:px-6">
        {/* Hero */}
        <motion.section
          variants={stagger(0.08)}
          initial="hidden"
          animate="show"
          className="flex w-full max-w-3xl flex-col items-center gap-5 pt-14 text-center sm:pt-20 md:pt-28"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-powered repository analysis
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
          >
            Welcome{user ? `, ${capitalizeFirstLetter(user.username)}` : ''} to{' '}
            <span className="text-gradient-brand">Repolens</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Repolens empowers developers to analyze and understand their
            repositories using AI. Explore your codebase, view insightful
            reports, and chat with your intelligent assistant — all in one
            place.
          </motion.p>

          {/* Analyse bar */}
          <motion.form
            variants={fadeUp}
            onSubmit={formik.handleSubmit}
            className="mt-4 w-full max-w-xl"
          >
            <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/80 p-2 shadow-lg backdrop-blur transition-shadow duration-200 focus-within:ring-4 focus-within:ring-primary/15 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter your repository URL..."
                  value={formik.values.url}
                  name="url"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  aria-invalid={!!urlError}
                  className="h-11 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-0 dark:bg-transparent"
                />
              </div>

              <CustomButton
                type="submit"
                disabled={
                  loading ||
                  limitReached ||
                  !formik.values.url ||
                  !!formik.errors.url
                }
                className="h-11 w-full whitespace-nowrap px-5 sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analysing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Analyse
                  </>
                )}
              </CustomButton>
            </div>
            {urlError && (
              <p className="mt-2 text-left text-xs text-destructive">
                {urlError}
              </p>
            )}
            {isDemo && (
              <p className="mt-2 text-left text-xs text-muted-foreground">
                {limitReached ? (
                  <>
                    Demo limit reached.{' '}
                    <Link
                      href="/register"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Sign up
                    </Link>{' '}
                    to analyse more.
                  </>
                ) : (
                  `${demo?.analysesMax ?? 2} free analyses in demo, ${analysesLeft} left.`
                )}
              </p>
            )}
          </motion.form>
        </motion.section>

        {/* Sample repositories (demo guests) */}
        {isDemo && samples && samples.length > 0 && (
          <motion.section
            variants={stagger(0.08)}
            initial="hidden"
            animate="show"
            className="mt-12 w-full"
          >
            <div className="mb-3 text-center">
              <h2 className="text-lg font-semibold tracking-tight">
                Or try a sample repository
              </h2>
              <p className="text-sm text-muted-foreground">
                Ready to explore instantly. Doesn&rsquo;t use your analyses.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {samples.map((s) => (
                <motion.div key={s.repoId} variants={fadeUp}>
                  <Link
                    href={`/chat/${s.repoId}`}
                    className="group flex h-full flex-col gap-1.5 rounded-2xl border border-border bg-card p-4 shadow-xs transition-[transform,box-shadow,border-color] duration-200 ease-product hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <span className="truncate text-sm font-semibold">
                      {s.owner}/{s.name}
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {s.description || 'No description'}
                    </span>
                    <span className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                      {s.language && <span>{s.language}</span>}
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {s.stars.toLocaleString()}
                      </span>
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Features */}
        <motion.section
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-16 mt-16 grid w-full grid-cols-1 gap-4 sm:mt-20 md:grid-cols-3 md:gap-5"
        >
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="group rounded-2xl border border-border bg-card p-5 shadow-xs transition-[transform,box-shadow,border-color] duration-200 ease-product hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-6"
            >
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary/15">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.section>
      </main>

      <footer className="relative z-10 border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}{' '}
        <span className="font-semibold text-foreground">Repolens</span>. All
        rights reserved.
      </footer>
    </div>
  );
}
