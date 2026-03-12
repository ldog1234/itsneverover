import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlowUp AI",
  description: "Healthy, science-based appearance improvement tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <Link href="/" className="brand">
            GlowUp AI
          </Link>

         <div className="navLinks">
  <Link href="/">Home</Link>
  <Link href="/analyze">Analyze</Link>
  <Link href="/routine">Routine</Link>
  <Link href="/dashboard">Dashboard</Link>
  <Link href="/login">Login</Link>
</div>
        </nav>

        {children}
      </body>
    </html>
  );
}