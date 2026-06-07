import type { ReactNode } from 'react';
import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Campus Notifications Microservice',
  description: 'Priority inbox built with Next.js, TypeScript, Material UI, and vanilla CSS.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}