'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
// import { useForm } from 'react-hook-form';

// type RegisterForm = {
//   username: string;
//   email: string;
//   password: string;
// };

export default function RegisterPage() {
  //   const { register, handleSubmit } = useForm<RegisterForm>();

  // const onSubmit = (data: RegisterForm) => {
  //   console.log('Register Data:', data);
  //   // TODO: integrate with register API (e.g., postMethod("/api/auth/registerUser", data))
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold tracking-tight">
            Create Account ✨
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Get started with Repolens in seconds
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="prathmesh"
                // {...register('username', { required: true })}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="prathmesh@example.com"
                // {...register('email', { required: true })}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="mypassword123"
                // {...register('password', { required: true })}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Register
            </Button>

            <p className="text-sm text-center text-gray-400 mt-3">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
