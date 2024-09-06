'use client';

import { UserProvider } from '../../../contexts/UserProvider';
import { useUser } from '../../../contexts/UserContext';
import StructuralBalance from './StructuralBalance';

const StructuralBalancePage = () => {
  // Your component logic here
  return (
    <div>
      {/* Your JSX content here */}
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