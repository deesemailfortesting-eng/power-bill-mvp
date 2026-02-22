import './globals.css';

export const metadata = {
  title: 'Power Bill Analyzer MVP',
  description: 'Upload a bill PDF and get tariff recommendations.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
