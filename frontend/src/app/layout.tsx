import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ScreenActionsBridge from "@/components/ScreenActionsBridge";

export const metadata: Metadata = {
  title: "ReliefConnect | Disaster Relief Coordination",
  description:
    "A mission-critical command platform connecting specialized volunteers, agency admins, and affected civilians during disaster situations in real time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <style>{`
          .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          }
        `}</style>
      </head>
      <body className="bg-background text-on-background selection:bg-primary-container selection:text-white overflow-x-hidden font-body">
        <AuthProvider>
          <ScreenActionsBridge />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
