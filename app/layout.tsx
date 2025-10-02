import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Box } from '@mui/material';
import { ClientThemeProvider } from '@/components/theme/ClientThemeProvider';
import { HealthcareProvider } from '@/lib/store/HealthcareContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import "./globals.css";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "C&E Reporting Platform",
  description: "Professional claims and expenses reporting with automated calculations and interactive analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ErrorBoundary>
          <AppRouterCacheProvider>
            <ClientThemeProvider>
              <HealthcareProvider>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh'
                  }}
                >
                  <Navigation />
                  <Box component="main" sx={{ flex: 1 }}>
                    {children}
                  </Box>
                  <Footer />
                </Box>
              </HealthcareProvider>
            </ClientThemeProvider>
          </AppRouterCacheProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
