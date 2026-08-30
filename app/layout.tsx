import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexus Motion — Physical Intelligence Platform",
  description: "Learn any physical skill with real-time guidance. Nexus turns expert knowledge into step-by-step instructions anyone can follow.",
  manifest: "/manifest.json",
  keywords: ["physical intelligence", "learn by doing", "guidance", "skills", "training", "Nexus Motion"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nexus Motion",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0F1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <ToastProvider>
          {children}
        </ToastProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('Nexus Edge SW registered: ', registration.scope);
                  }, function(err) {
                    console.log('Nexus Edge SW registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
