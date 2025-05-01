import { ThemeProvider } from "@/components/theme-provider";
import { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ThriveSend",
  description: "Comprehensive social media management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
