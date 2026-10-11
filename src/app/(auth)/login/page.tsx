'use client';

import AuthShell from '@/components/AuthShell';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { Form, Formik } from 'formik';
import { BODY } from '@/lib/Config';
import { Y } from '@/lib/yup';
import Link from 'next/link';
import { useAppContext } from '@/providers/AppContextProvider';

export default function LoginPage() {
  const { handleLogin } = useAppContext();

  return (
    <AuthShell>
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
