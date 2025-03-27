import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ExtensionCleanup from './component/ExtensionCleanup';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Disaster Alert App',
  description: 'Real-time disaster monitoring system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans" suppressHydrationWarning>
        {children}
        <ExtensionCleanup />
      </body>
    </html>
  );
}