"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 10000,
          },
        },
      })
  );

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => {
        // Prevent duplicate consecutive messages and limit to max 3 active toasts
        if (prev.length > 0 && prev[prev.length - 1].message === message) {
          return prev;
        }
        const updated = [...prev, { id, type, message }];
        return updated.slice(-3);
      });

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ToastContext.Provider value={{ toast: addToast }}>
          {children}

          {/* Toast Notification Container */}
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-3 ${
                  t.type === "success"
                    ? "bg-[#10b981]/20 border-[#10b981]/50 text-emerald-200"
                    : t.type === "error"
                    ? "bg-red-500/20 border-red-500/50 text-red-200"
                    : "bg-[#8b5cf6]/20 border-[#8b5cf6]/50 text-purple-200"
                }`}
              >
                <div className="flex items-center gap-3 pr-2">
                  {t.type === "success" && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  {t.type === "error" && (
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                  )}
                  {t.type === "info" && (
                    <Info className="w-5 h-5 text-purple-400 shrink-0" />
                  )}
                  <p className="text-sm font-medium">{t.message}</p>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-gray-400 hover:text-white transition p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </ToastContext.Provider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
