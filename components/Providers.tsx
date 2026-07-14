"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Toaster } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

function ThemedToaster() {
  const { theme } = useTheme();
  return <Toaster position="top-right" theme={theme} richColors />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          {children}
          <ThemedToaster />
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
