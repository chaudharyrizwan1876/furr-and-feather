import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const SITE_URL = 'https://furrandfeathers.com'; // ← Apna domain yahan likhein jab live karein
const SITE_NAME = "Furr & Feather's Hospital";

export const metadata = {
  // Basic
  title: {
    default: `${SITE_NAME} | Veterinary Medicines & Pet Care in Pakistan`,
    template: `%s | ${SITE_NAME}`, // Pages apna title uss mein inject karenge
  },
  description: 'Pakistan ka trusted veterinary online store. Dogs, cats aur birds ke liye genuine medicines, supplements, pet food aur accessories. Cash on Delivery Rawalpindi, Islamabad aur poore Pakistan mein.',
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
    description: 'Pakistan ka trusted veterinary online store. Genuine medicines, supplements & pet food. COD available.',
    images: [
      {
        url: '/og-image.png', // 1200x630px image — public folder mein rakhein (optional, nahi ho to bhi chalega)
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
    images: ['/og-image.png'],
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

  // Verification (Google Search Console ke liye — baad mein add karein)
  // verification: {
  //   google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  // },

  // Favicon/icons
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },

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
