'use client';

import { Suspense } from 'react';
import PaymentFailureComponent from './PaymentFailure';
import { Heart } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="h-12 w-12 text-primary" />
        </div>
      </div>
    }>
      <PaymentFailureComponent />
    </Suspense>
  );
}
