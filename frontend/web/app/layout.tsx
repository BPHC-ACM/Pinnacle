import type { Metadata } from 'next';
// import { AuthProvider } from "@/hooks/useAuth";
import './globals.css';

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
    <html lang="en">
      <body className="antialiased">{/*<AuthProvider>*/}{children}{/*</AuthProvider>*/}</body>
    </html>
  );
}
