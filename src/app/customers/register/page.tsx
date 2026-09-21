'use client';

import React, { Suspense } from 'react';
import { StepRegistrationForm } from '../../../components/customers/StepRegistrationForm';

export default function RegisterCustomerPage() {
  return (
    <div className="py-2 pb-12">
      <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-slate-500">Loading Registration Wizard...</div>}>
        <StepRegistrationForm />
      </Suspense>
    </div>
  );
}
