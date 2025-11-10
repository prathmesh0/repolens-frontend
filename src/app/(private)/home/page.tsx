'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import { BODY } from '@/lib/Config';
import { Y } from '@/lib/yup';
import { useRouter } from 'next/navigation';
import { Repository } from '@/api/services';
import { Toast } from '@/lib/Toast';
import { IAnalyse } from '@/types/repo';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { PageSkeleton } from '@/components/HomePageSkelaton';
import Particles from '@/components/Particles';
import { capitalizeFirstLetter } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
export default function HomePage() {
  const [user, setUser] = useState<{ username: string; email: string } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          console.error('Failed to parse user from localStorage');
        }
      }
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Detect Theme
  useEffect(() => {
    const detectTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    detectTheme();

    // Watch for theme changes
    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const formik = useFormik<IAnalyse>({
    initialValues: BODY.REPOSITORY.ANALYSE(),
    validationSchema: Y.repoAnalyseSchema,
    onSubmit: async (val) => {
      setLoading(true);
      const res = await Repository.analyseRepository(val);
      setLoading(false);
      if (res?.success || res?.statusCode === 201) {
        const repoInfo = res.data.basicInfo;
        Toast.success(
          `Analysis started! This might take a few minutes to complete.`,
          { duration: 5000 }
        );
        queryClient.invalidateQueries({ queryKey: ['repoHistory'] });
        // Navigate to chat page after short delay
        router.push(`/chat/${repoInfo._id}`);
      } else {
        Toast.error(res?.message || 'Something went wrong');
      }
    },
  });

  if (pageLoading) {
    return <PageSkeleton />;
  }

  const particleColors =
    theme === 'dark' ? ['#ffffff'] : ['#e6b347', '#4a9fd8', '#666666'];

  return (
    <div className="relative min-h-full w-full">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Particles
          particleColors={particleColors}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={150}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
          className="w-full h-full"
        />
      </div>
      <main className="relative z-10 min-h-full w-full flex flex-col items-center justify-between text-foreground overflow-x-hidden hide-scrollbar">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mt-12 sm:mt-16 md:mt-20 mb-8 sm:mb-10 px-4 space-y-4 sm:space-y-6 max-w-4xl w-full">
          <motion.h1
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight bg-gradient-to-r from-[oklch(0.6716_0.1368_48.513)] to-[oklch(0.536_0.0398_196.028)] text-transparent bg-clip-text leading-tight"
          >
            Welcome{user ? `, ${capitalizeFirstLetter(user.username)}` : ''} to
            Repolens
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="max-w-2xl text-base sm:text-lg text-muted-foreground"
          >
            Repolens empowers developers to analyze and understand their
            repositories using AI. Explore your codebase, view insightful
            reports, and chat with your intelligent assistant — all in one
            place.
          </motion.p>
        </section>

        {/* Input + Button Section */}
        <motion.form
          onSubmit={formik.handleSubmit}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4 sm:mt-6 mb-12 sm:mb-16 md:mb-20 w-full max-w-md px-4"
        >
          <div className="flex flex-col sm:flex-row w-full items-start sm:items-start gap-3">
            <div className="flex-1 w-full">
              <CustomInput
                type="text"
                placeholder="Enter your repository URL..."
                value={formik.values.url}
                name="url"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.url ? (formik.errors.url as string) : ''}
                className="h-10 "
              />
            </div>

            <CustomButton
              type="submit"
              disabled={loading || !formik.values.url || !!formik.errors.url}
              className="flex items-center gap-2 bg-primary text-primary-foreground  h-10 px-4 py-3 sm:px-6 rounded-lg hover:opacity-90 transition-all duration-200 w-full sm:w-auto whitespace-nowrap"
            >
              {loading ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="animate-pulse text-sm sm:text-base"
                >
                  Analysing...
                </motion.span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Analyse
                </>
              )}
            </CustomButton>
          </div>
        </motion.form>

        {/* Animated Features Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-6 mb-12 sm:mb-16 md:mb-20 max-w-6xl w-full">
          {[
            {
              title: 'AI Repository Insights',
              desc: "Get instant, intelligent breakdowns of your repo's structure and performance metrics using cutting-edge AI.",
            },
            {
              title: 'File Structure Visualizer',
              desc: 'Explore your project’s file hierarchy with clean, intuitive diagrams enriched with smart recommendations.',
            },
            {
              title: 'Chat with AI Assistant',
              desc: 'Interact directly with an AI trained to understand your project. Ask questions, get suggestions, and debug faster.',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                delay: 0.2 + i * 0.15,
                duration: 0.5,
                ease: 'easeOut',
              }}
            >
              <Card className="bg-card/80 backdrop-blur-sm text-card-foreground hover:shadow-xl hover:scale-[1.03] transition-transform duration-300 ease-in-out border border-border rounded-xl">
                <CardContent className="space-y-3 p-4 sm:p-6">
                  <CardTitle className="text-xl font-semibold text-primary">
                    {feature.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* Footer */}
        <footer className="w-full py-4 sm:py-6 text-center  border-t border-border text-muted-foreground  backdrop-blur-md text-xs sm:text-sm">
          © {new Date().getFullYear()}{' '}
          <span className="font-semibold text-primary">Repolens</span>. All
          rights reserved.
        </footer>
      </main>
    </div>
  );
}
