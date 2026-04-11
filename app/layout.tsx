import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SM Pay",
  description: "Virtual top-up, wallet funding, and payment dashboard.",
};

import { Providers } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
