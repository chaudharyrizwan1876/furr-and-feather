import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/site';
import './globals.css';

export const metadata = {
  // Basic
  title: {
    default: `${SITE_NAME} | Veterinary Medicines & Pet Care in Pakistan`,
    template: `%s | ${SITE_NAME}`, // Pages will inject their own title here
  },
  description: "Pakistan's trusted veterinary online store. Genuine medicines, supplements, pet food and accessories for dogs, cats and birds. Cash on Delivery across Rawalpindi, Islamabad and all of Pakistan.",
  keywords: [
    'veterinary medicines pakistan', 'pet medicines online', 'dog medicines pakistan',
    'cat medicines pakistan', 'bird medicines', 'bravecto pakistan', 'nexgard pakistan',
    'pet care rawalpindi', 'veterinary store islamabad', 'pet food pakistan',
    'deworming medicine dogs', 'cat deworming', 'pet supplements pakistan',
    'furr feathers hospital', 'online pet store pakistan', 'cod pet medicines',
  ],

  // Canonical URL
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },

  // Open Graph (Facebook, WhatsApp sharing)
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Veterinary Medicines & Pet Care in Pakistan`,
    description: "Pakistan's trusted veterinary online store. Genuine medicines, supplements & pet food. COD available.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Furr & Feather's Hospital — Pakistan's Trusted Pet Care Store",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Pet Medicines Pakistan`,
    description: 'Genuine pet medicines, supplements & food. COD Rawalpindi & Islamabad.',
    images: [DEFAULT_OG_IMAGE],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (for Google Search Console — add later)
  // verification: {
  //   google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  // },

  // Favicon/icons — src/app/icon.png is picked up automatically by Next.js
  // (its file-naming convention), so no manual "icons" entry is needed here.

  // App/PWA
  manifest: '/manifest.json',
  applicationName: SITE_NAME,
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2F7D3A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="top-right" />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
