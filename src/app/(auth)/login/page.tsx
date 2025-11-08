'use client';

import Image from 'next/image';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import CustomInput from '@/components/CustomInput';
import CustomButton from '@/components/CustomButton';
import { Form, Formik } from 'formik';
import { BODY } from '@/lib/Config';
import { Y } from '@/lib/yup';
import Link from 'next/link';
import { useAppContext } from '@/providers/AppContextProvider';
import { Assets } from '@/lib/Assets';

export default function LoginPage() {
  const { handleLogin } = useAppContext();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={Assets.LoginBackground}
          alt="Login background"
          fill
          priority
          className="object-cover opacity-60"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md py-3 bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg">
        <CardHeader className="flex flex-col items-center gap-3 ">
          {/* Logo */}
          {/* <div className="w-14 h-14 relative">
            <Image
              src={Assets.Logo}
              alt="Repolens Logo"
              fill
              className="object-contain"
              priority
            />
          </div> */}
          <CardTitle className="text-center text-2xl font-semibold tracking-tight">
            Welcome Back to Repolens
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Enter your email and password to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
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
              <Form className="space-y-4 sm:space-y-5 lg:space-y-6">
                <div className="space-y-3 sm:space-y-4">
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

                  {/* Forgot password link */}
                  {/* <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div> */}
                </div>

                <CustomButton
                  type="submit"
                  disabled={!(isValid && dirty)}
                  className="w-full"
                >
                  Login
                </CustomButton>

                {/* Register link */}
                <p className="text-center text-sm text-gray-300">
                  Haven’t signed up yet?{' '}
                  <Link
                    href="/register"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Register
                  </Link>
                </p>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
