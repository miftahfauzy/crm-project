'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from './loading';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const redirectToDashboard = async () => {
      try {
        await router.push('/dashboard');
      } catch (error) {
        console.error('Redirect failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    redirectToDashboard();
  }, [router]);

  if (isLoading) {
    return <Loading />;
  }

  return null;
}