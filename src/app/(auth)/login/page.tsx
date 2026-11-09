'use client';

import AuthShell from '@/components/AuthShell';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { Form, Formik } from 'formik';
import { BODY } from '@/lib/Config';
import { Y } from '@/lib/yup';
import Link from 'next/link';
import { useAppContext } from '@/providers/AppContextProvider';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import DemoButton from '@/components/landing/DemoButton';
import { clearDemoSession } from '@/lib/demo';

// Shown after a demo guest's session ended (expired, or ended elsewhere)
function DemoEndedNotice() {
  const ended = useSearchParams().get('demo') === 'ended';
  useEffect(() => {
    if (ended) clearDemoSession();
  }, [ended]);
  if (!ended) return null;
  return (
    <div className="rounded-xl border border-primary/25 bg-primary/10 p-3 text-sm">
      <p className="font-medium">Demo session ended</p>
      <p className="mt-0.5 text-muted-foreground">
        Demo data is deleted when the session ends. Start a new demo or sign in.
      </p>
    </div>
  );
}

export default function LoginPage() {
  const { handleLogin } = useAppContext();

  return (
    <AuthShell>
      <Suspense>
        <DemoEndedNotice />
      </Suspense>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome Back to Repolens
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and password to continue
        </p>
      </div>

      <Formik
        initialValues={BODY.USERS.LOGIN()}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            await handleLogin(values);
          } catch (err) {
            console.error('Login submit error:', err);
          } finally {
            setSubmitting(false);
          }
        }}
        validationSchema={Y.loginSchema}
      >
        {({
          handleBlur,
          handleChange,
          values,
          touched,
          errors,
          isValid,
          dirty,
        }) => (
          <Form className="space-y-5">
            <div className="space-y-4">
              <CustomInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="Enter Email Address"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : ''}
              />
              <CustomInput
                id="password"
                type="password"
                label="Password"
                placeholder="Enter Password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : ''}
              />
            </div>

            <CustomButton
              type="submit"
              disabled={!(isValid && dirty)}
              className="h-11 w-full"
            >
              Login
            </CustomButton>

            <DemoButton className="h-11 w-full border border-border bg-transparent text-foreground hover:bg-accent" />

            <p className="text-center text-sm text-muted-foreground">
              Haven&rsquo;t signed up yet?{' '}
              <Link
                href="/register"
                className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
              >
                Register
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthShell>
  );
}
