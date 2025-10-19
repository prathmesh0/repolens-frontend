import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import React from 'react';

const LoginPage = () => {
  // const onSubmit = (data: any) => {
  //   console.log('Login Data:', data);
  //   // TODO: integrate with login API (e.g., postMethod("/api/auth/loginUser", data))
  // };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-primary-foreground/10 backdrop-blur-md text-primary-foreground border border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold tracking-tight">
            Welcome Back 👋
          </CardTitle>
          <CardDescription className="text-center text-gray-300">
            Login to your Repolens account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="prathmesh@example.com"
                // {...register('email', { required: true })}
                className="bg-white/10 border-white/20 text-white placeholder-primary-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                // {...register('password', { required: true })}
                className="bg-white/10 border-white/20 text-white placeholder-primary-foreground"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Login
            </Button>

            <p className="text-sm text-center text-gray-400 mt-3">
              {`Don't have an account?`}
              <Link href="/register" className="text-blue-400 hover:underline">
                Register here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
