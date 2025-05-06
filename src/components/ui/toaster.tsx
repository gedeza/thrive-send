"use client";

import React from "react";
import { useToast } from "@/components/ui/use-toast";

interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive" | "success";
  onClose: () => void;
}

const Toast = ({
  title,
  description,
  variant = "default",
  onClose,
}: ToastProps) => {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex w-full max-w-sm items-center rounded-lg border p-4 shadow-md ${
        variant === "destructive"
          ? "border-red-200 bg-red-50 text-red-800"
          : variant === "success"
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-gray-200 bg-white text-gray-800"
      }`}
    >
      <div className="flex-1">
        {title && <div className="font-medium">{title}</div>}
        {description && <div className="mt-1 text-sm">{description}</div>}
      </div>
      <button
        onClick={onClose}
        className="ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      >
        <span className="sr-only">Close</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

export function Toaster() {
  const { toasts, dismiss } = useToast();
  
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant as "default" | "destructive" | "success"}
          onClose={() => dismiss(toast.id)}
        />
      ))}
    </>
  );
}
