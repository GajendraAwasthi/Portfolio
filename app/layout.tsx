import type { Metadata } from 'next';
import './globals.css';
import { getPortfolioData } from '@/lib/data-service';

export async function generateMetadata(): Promise<Metadata> {
  const data = await getPortfolioData();
  const s = data.settings;
  const p = data.profile;

  return {
    title: s.metaTitle || `${p.name} ${p.surnameGradient} | Portfolio`,
    description: s.metaDescription || p.description,
    keywords: s.metaKeywords,
    authors: [{ name: `${p.name} ${p.surnameGradient}` }],
    icons: {
      icon: s.favicon,
    },
    openGraph: {
      title: s.metaTitle,
      description: s.metaDescription,
      images: [s.ogImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: s.metaTitle,
      description: s.metaDescription,
      images: [s.ogImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="bg-grid-pattern" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
