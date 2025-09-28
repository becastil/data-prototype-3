import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { staticHealthcareTheme } from '@/lib/theme';
import { HealthcareProvider } from '@/lib/store/HealthcareContext';
import "./globals.css";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Healthcare Analytics Dashboard",
  description: "Professional C&E reporting and analytics platform for healthcare data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={staticHealthcareTheme}>
            <CssBaseline />
            <HealthcareProvider>
              {children}
            </HealthcareProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
