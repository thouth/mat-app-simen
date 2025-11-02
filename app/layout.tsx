import './globals.css';

export const metadata = {
  title: 'Matlager & Handleliste',
  description: 'Oversikt over matvarer hjemme og handleliste – med Matvaretabellen',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
