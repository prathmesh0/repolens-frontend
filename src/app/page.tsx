'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getFromLocalStorage } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getFromLocalStorage('token');
    if (token) router.push('/home');
    else router.push('/login');
  }, [router]);

  return null;
}
