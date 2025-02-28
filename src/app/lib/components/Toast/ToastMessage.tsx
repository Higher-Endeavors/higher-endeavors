import React from 'react';
import { Toast } from 'flowbite-react';
import { HiCheck, HiX, HiExclamation, HiInformationCircle } from 'react-icons/hi';
import { ToastMessage as ToastMessageType } from '@/app/lib/types/toast';

interface ToastMessageProps {
  toast: ToastMessageType;
  onClose: (id: string) => void;
}

const icons = {
  success: HiCheck,
  error: HiX,
  warning: HiExclamation,
  info: HiInformationCircle,
};

const colors = {
  success: 'bg-green-100 text-green-500',
  error: 'bg-red-100 text-red-500',
  warning: 'bg-yellow-100 text-yellow-500',
  info: 'bg-blue-100 text-blue-500',
};

export default function ToastMessage({ toast, onClose }: ToastMessageProps) {
  const Icon = icons[toast.type];

  return (
    <Toast>
      <div className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors[toast.type]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="ml-3 text-sm font-normal">{toast.message}</div>
      <Toast.Toggle onDismiss={() => onClose(toast.id)} />
    </Toast>
  );
}