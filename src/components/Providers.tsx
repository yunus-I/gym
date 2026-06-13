'use client';

import { SessionProvider } from "next-auth/react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { IntlProviderMessages, Locale } from "@/types/app";

interface ProvidersProps {
  children: React.ReactNode;
  messages: IntlProviderMessages;
  locale: Locale;
}

export function Providers({ children, messages, locale }: ProvidersProps) {
  return (
    <SessionProvider>
      <NextIntlClientProvider messages={messages} locale={locale}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
    </SessionProvider>
  );
}
