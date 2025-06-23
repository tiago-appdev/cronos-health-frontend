"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

// Define the Toast type
type ToastType = "default" | "success" | "error" | "warning" | "info";

// Define the structure of a toast
interface Toast {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
}

// Define the context interface
interface ToastContextType {
  toasts: Toast[];
  toast: (props: { title: string; description?: string; type?: ToastType }) => void;
  dismiss: (id: number) => void;
}

// Create context with default values
const ToastContext = createContext<ToastContextType>({
  toasts: [],
  toast: () => {},
  dismiss: () => {},
});

// Custom hook to use toast
export const useToast = () => useContext(ToastContext);

// Toast Provider component
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add a new toast
  const toast = useCallback(({ title, description, type = "default" }: { 
    title: string; 
    description?: string; 
    type?: ToastType 
  }) => {
    const id = Math.random();
    const newToast = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }, []);

  // Remove a toast by id
  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container component
const ToastContainer = () => {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80" data-testid="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          data-testid={`toast-${toast.type}`}
          className={`rounded-md p-4 shadow-md transition-all duration-300 transform translate-x-0 ${getToastClassName(toast.type)}`}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold" data-testid="toast-title">{toast.title}</h3>
              {toast.description && <p className="text-sm mt-1" data-testid="toast-description">{toast.description}</p>}
            </div>
            <button 
              onClick={() => dismiss(toast.id)} 
              className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// Helper function to get toast class names based on type
const getToastClassName = (type: ToastType): string => {
  switch (type) {
    case "success":
      return "bg-green-100 text-green-800 border-l-4 border-green-500";
    case "error":
      return "bg-red-100 text-red-800 border-l-4 border-red-500";
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500";
    case "info":
      return "bg-blue-100 text-blue-800 border-l-4 border-blue-500";
    default:
      return "bg-white text-gray-800 border-l-4 border-gray-300";
  }
};