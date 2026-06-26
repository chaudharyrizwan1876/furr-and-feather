import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata = {
  title: 'Furr & Feather\'s Hospital | Veterinary Medicines & Pet Care in Pakistan',
  description: 'Buy genuine veterinary medicines, pet care products, supplements & food for dogs, cats and other pets. Cash on Delivery available all over Pakistan.',
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