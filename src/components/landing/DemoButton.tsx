'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Play } from 'lucide-react';
import { User } from '@/api/services';
import CustomButton from '@/components/CustomButton';
import { markDemoSession } from '@/lib/demo';
import { Toast } from '@/lib/Toast';

// "Try live demo": one click creates a guest session and opens /home.
export default function DemoButton({
  className,
  children = 'Try live demo',
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    const result = await User.demoLogin();
    if (!result.ok) {
      setLoading(false);
      Toast.error(
        result.status === 429 || result.status === 503
          ? `${result.message} You can also sign up for free.`
          : result.message || 'Could not start the demo. Please try again.'
      );
      return;
    }

    markDemoSession();
    // Drop anything cached for a previous (real) user, then let /users/me
    // load the guest.
    queryClient.clear();
    router.push('/home');
  };

  return (
    <CustomButton onClick={start} disabled={loading} className={className}>
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Starting demo...
        </>
      ) : (
        <>
          <Play className="h-4 w-4" />
          {children}
        </>
      )}
    </CustomButton>
  );
}
