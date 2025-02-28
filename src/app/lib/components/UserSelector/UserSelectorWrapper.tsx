import UserSelector from '@/app/components/UserSelector';

interface UserSelectorWrapperProps {
  currentUserId: number;
  onUserSelect: (userId: number | null) => void;
  className?: string;
}

export const UserSelectorWrapper = ({ 
  currentUserId, 
  onUserSelect, 
  className 
}: UserSelectorWrapperProps) => (
  <UserSelector
    currentUserId={currentUserId}
    onUserSelect={onUserSelect}
    className={className}
  />
);

export default UserSelectorWrapper;