import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PWARegister } from '@/components/PWARegister';

export const metadata: Metadata = {
  title: 'IskanMo — Interactive Class Timetable',
  description:
    'Turn timetable photos and syllabus screenshots into a clean, interactive calendar.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'IskanMo',
  },
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#09090b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-[#09090b] text-zinc-100 antialiased selection:bg-zinc-800 selection:text-zinc-200">
        <PWARegister />
        <main className="min-h-full flex flex-col">{children}</main>
      </body>
    </html>
  );
}
