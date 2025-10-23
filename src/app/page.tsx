'use client';

import { useQuery } from '@tanstack/react-query';
import { getMethod } from '@/lib/apiMethods';
import { Button } from '@/components/ui/button';

export default function Home() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log('Backend URL:', backendUrl);

  const { data, error, isLoading } = useQuery({
    queryKey: ['healthcheck'],
    queryFn: async () => await getMethod('/health/healthcheck'), // Using proxy — no CORS issues
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-muted/10 to-card">
      <h1 className="text-3xl font-bold mb-6 text-primary">
        Repolens Connectivity Check
      </h1>
      <Button className="mb-4 bg-primary text-white hover:bg-primary/80 text-lg px-8">
        Test API Connection
      </Button>
      {isLoading && (
        <p className="text-sm text-gray-500">Checking backend connection...</p>
      )}
      {error && (
        <p className="text-red-600 font-semibold">
          Cannot connect to backend ❌
        </p>
      )}
      {data && (
        <div className="mt-3 p-4 rounded-md bg-card shadow-md border border-border text-foreground">
          <p className="font-semibold">{data.message}</p>
          <p className="text-sm text-muted-foreground">
            {/* Status: {data?.data?.status || ""} */}
          </p>
          <p className="text-sm text-muted-foreground">
            {/* Uptime: {data.data.uptime.toFixed(2)}s */}
          </p>
        </div>
      )}
    </div>
  );
}
