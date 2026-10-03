import type { Metadata, Viewport } from 'next';
import './globals.css';
import { profile } from '@/data/profile';

const description =
  'Shyam Sai — AI/ML engineer. B.Tech Computer Science Engineering at Gayatri Vidya Parishad College of Engineering (Autonomous). A royal archive containing his projects, foundations, equipment and credentials.';

export const metadata: Metadata = {
  metadataBase: new URL('https://shyamsai.dev'),
  title: {
    default: 'Shyam Sai — AI / ML Engineer',
    template: '%s — Shyam Sai',
  },
  description,
  keywords: ['Shyam Sai', 'Shyam Sai Tatiparti', 'AI engineer', 'machine learning', 'RiverSight', 'PipeGuard', 'portfolio'],
  authors: [{ name: 'Shyam Sai' }],
  openGraph: {
    title: 'Shyam Sai — AI / ML Engineer',
    description,
    type: 'profile',
    siteName: 'Shyam Sai',
  },
  twitter: { card: 'summary_large_image', title: 'Shyam Sai — AI / ML Engineer', description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0A0706',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.fullName,
  jobTitle: profile.classification,
  description: profile.positioning,
  alumniOf: { '@type': 'CollegeOrUniversity', name: profile.institution },
  knowsAbout: profile.focus,
};

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
