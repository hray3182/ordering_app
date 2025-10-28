'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 800 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 flex justify-center px-4 animate-slide-up">
      <div className="bg-black text-white px-6 py-3 border-2 border-black shadow-lg flex items-center gap-3 min-w-[280px] max-w-md">
        <span className="font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="hover:bg-white hover:text-black transition-colors p-1 shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
