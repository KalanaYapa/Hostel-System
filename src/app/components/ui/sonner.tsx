"use client";

import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        duration: 4000,
        style: {
          padding: '16px 20px',
          fontSize: '15px',
          fontWeight: '500',
          borderRadius: '12px',
          minWidth: '400px',
          maxWidth: '600px',
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-2 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-gray-600 group-[.toast]:text-sm group-[.toast]:mt-1 group-[.toast]:font-normal",
          actionButton: "group-[.toast]:bg-indigo-600 group-[.toast]:text-white group-[.toast]:hover:bg-indigo-700 group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:rounded-lg group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:hover:bg-gray-200 group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:rounded-lg group-[.toast]:font-medium",
          success: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-green-50 group-[.toast]:to-emerald-50 group-[.toast]:border-green-400 group-[.toast]:text-green-900",
          error: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-red-50 group-[.toast]:to-rose-50 group-[.toast]:border-red-400 group-[.toast]:text-red-900",
          warning: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-yellow-50 group-[.toast]:to-amber-50 group-[.toast]:border-yellow-400 group-[.toast]:text-yellow-900",
          info: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-50 group-[.toast]:to-cyan-50 group-[.toast]:border-blue-400 group-[.toast]:text-blue-900",
          loading: "group-[.toast]:bg-gradient-to-r group-[.toast]:from-purple-50 group-[.toast]:to-indigo-50 group-[.toast]:border-purple-400 group-[.toast]:text-purple-900",
          title: "group-[.toast]:font-semibold group-[.toast]:text-base",
          closeButton: "group-[.toast]:bg-white group-[.toast]:border-0 group-[.toast]:text-gray-400 group-[.toast]:hover:text-gray-600",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
