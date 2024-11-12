import React, { useState, useEffect } from 'react';
import { auth } from "@/app/auth";
import { SessionProvider } from "next-auth/react";
import BalancedLiftsForm from './components/BalancedLiftsForm';

type RefLift = {
  id: number
  exercise_name: string
  struct_bal_ref_lift_load: number
};
type RefLifts = RefLift[];

export default async function BalancedLiftsPage() {
  const session = await auth();
  if (!session?.user) return
  {
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">You must be signed in.</h1>
    </div>
  };

  const getRefLifts = async (): Promise<RefLifts> => {
    try {
      const response = await fetch('http://localhost:3000/api/reference-lifts', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
//        cache: 'force-cache',
      });
      const refLifts = await response.json();
      return refLifts.rows;
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const refLifts = await getRefLifts();

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold mb-4">Balanced Lifts Calculator</h1>
      <SessionProvider>
      <BalancedLiftsForm refLifts ={refLifts} />
      </SessionProvider>
    </div>
  );
}
