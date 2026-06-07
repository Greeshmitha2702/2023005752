import type { ReactNode } from 'react';
import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Campus Hiring Evaluation',
  description: 'Reusable logging middleware system for the pre-test setup.'
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