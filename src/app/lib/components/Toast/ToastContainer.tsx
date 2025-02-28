import React from 'react';
import ToastMessage from './ToastMessage';
import { ToastMessage as ToastMessageType } from '@/app/lib/types/toast';

interface ToastContainerProps {
  toasts: ToastMessageType[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastMessage
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}