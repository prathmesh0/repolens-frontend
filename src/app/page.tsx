'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/lib/useMe';

export default function HomePage() {
  const router = useRouter();

  const { isSuccess, isError } = useMe();

  useEffect(() => {
    if (isSuccess) router.replace('/home');
    else if (isError) router.replace('/login');
  }, [isSuccess, isError, router]);

  return null;
}
