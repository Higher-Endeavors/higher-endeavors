import React from 'react';
import { auth } from 'auth';
import SettingsForm from '(protected)/user/settings/components/SettingsForm';

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user) {
    return null; // Handle unauthorized access
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Settings</h1>
      <SettingsForm />
    </div>
  );
} 