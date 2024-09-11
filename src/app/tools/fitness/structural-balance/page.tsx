'use client';

import { UserProvider } from '../../../contexts/UserProvider';
import { useUser } from '../../../contexts/UserContext';
import StructuralBalance from './StructuralBalance';

const StructuralBalancePage = () => {
  // Your component logic here
  return (
    <div>
      <h1>Structural Balance Page</h1>
    </div>
  );
};

export default function Page() {
  return (
    <UserProvider>
      <StructuralBalancePage />
    </UserProvider>
  );
}