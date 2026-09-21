'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyJpMembersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/associates');
  }, [router]);

  return (
    <div className="p-8 text-center text-xs font-bold text-slate-500">
      Redirecting to Associate Registry...
    </div>
  );
}
