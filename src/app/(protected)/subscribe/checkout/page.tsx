'use client';

import React, { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Page() {
  const fetchClientSecret = useCallback(() => {
    // Create a Checkout Session
    return fetch("/api/stripe-checkout-session", {
      method: "POST",
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