import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';

import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from 'sonner';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pinnacle',
  description: 'Placement & Internship platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased font-sans">
        <ThemeProvider defaultTheme="dark" storageKey="pinnacle-theme">
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster />
            <Sonner position="top-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
