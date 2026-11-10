'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SeminarsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/customers');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs font-bold text-slate-500">
      Redirecting to Customer Registry...
    </div>
  );
}
