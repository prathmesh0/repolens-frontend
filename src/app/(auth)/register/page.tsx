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
  const { handleRegister } = useAppContext();

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
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg">
        <CardHeader className="flex flex-col items-center gap-3">
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
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Get started with Repolens in seconds
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Formik
            initialValues={BODY.USERS.REGISTER()}
            onSubmit={handleRegister}
            validationSchema={Y.registerSchema}
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
                    id="username"
                    label="Username"
                    placeholder="Enter User Name"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username ? errors.username : ''}
                  />
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
                  className="w-full"
                >
                  Register
                </CustomButton>

                {/* Register link */}
                <p className="text-center text-sm text-gray-300">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Login
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
