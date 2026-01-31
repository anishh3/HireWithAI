import type { Metadata } from "next";
import dynamic from "next/dynamic";
import "./globals.css";

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });

export const metadata: Metadata = {
  title: "HireWithAI",
  description: "Evaluate candidates by how they work",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
