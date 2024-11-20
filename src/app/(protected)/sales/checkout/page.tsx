'use client';

import React, { useCallback } from 'react';
import { useSearchParams } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Page() {
  const searchParams = useSearchParams();
  const priceType = searchParams.get('type');
  const priceCode = searchParams.get('code');

  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session
    return fetch("/api/stripe/checkout-session", {
      method: "POST",
      body: JSON.stringify({ priceType, priceCode }),

    })
      .then((res) => res.json())
      .then((data) => data.clientSecret.toString());
  }, []);

  const options = {fetchClientSecret};

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}