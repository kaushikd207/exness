import "./globals.css";

export const metadata = {
  title: "Exness Clone",
  description: "Trading Dashboard Clone with Next.js + WebSocket",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
