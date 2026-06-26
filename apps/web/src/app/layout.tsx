import type { ReactNode } from "react";

export const metadata = {
  title: "STARLINK MANAGER PRO",
  description: "Modern ISP Billing Platform"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
