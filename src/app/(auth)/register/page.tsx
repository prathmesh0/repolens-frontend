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
  const { handleRegister } = useAppContext();

  return (
    <AuthShell>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Get started with Repolens in seconds
        </p>
      </div>

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
          <Form className="space-y-5">
            <div className="space-y-4">
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
              className="h-11 w-full"
            >
              Register
            </CustomButton>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 transition-colors hover:underline"
              >
                Login
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthShell>
  );
}
