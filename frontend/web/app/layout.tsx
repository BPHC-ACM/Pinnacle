import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/contexts/theme-context';
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
      <body className="antialiased font-sans bg-background text-foreground" style={{ borderTop: 'none', margin: '0', padding: '0' }}>
        <ThemeProvider defaultTheme="dark" storageKey="pinnacle-theme">
          <AuthProvider>
            <Header />
            <main className="pt-18 bg-background" style={{ borderTop: 'none', borderBottom: 'none', marginTop: '0', paddingTop: '72px' }}>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
