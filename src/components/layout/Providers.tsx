'use client';

import { SWRConfig } from 'swr';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from './ThemeProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        errorRetryCount: 3,
        dedupingInterval: 10000,
      }}
    >
      <ThemeProvider>
        {children}
        <Toaster position="top-right" />
      </ThemeProvider>
    </SWRConfig>
  );
}
