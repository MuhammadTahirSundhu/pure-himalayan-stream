import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { CartProvider } from '@/contexts/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartSidebar from '@/components/CartSidebar';
import ScrollToHash from '@/components/ScrollToHash';
import WhatsAppFab from '@/components/site/WhatsAppFab';
import Home from './pages/Home';

// Home ships in the main bundle; every other route is code-split.
const Products = lazy(() => import('./pages/Products'));
const Delivery = lazy(() => import('./pages/Delivery'));
const Quality = lazy(() => import('./pages/Quality'));
const Offers = lazy(() => import('./pages/Offers'));
const Events = lazy(() => import('./pages/Events'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnWindowFocus: false } },
});

const PageFallback = () => <div className="ow-page" aria-busy="true" />;

function CustomerLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <>
      <Navbar />
      <main className={`min-h-screen pb-20 md:pb-0 ${pathname === '/' ? '' : 'pt-16'}`}>
        <Suspense fallback={<PageFallback />}>{children}</Suspense>
      </main>
      <Footer />
      <CartSidebar />
      <WhatsAppFab />
    </>
  );
}

const page = (el: React.ReactNode) => <CustomerLayout>{el}</CustomerLayout>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <Sonner position="top-center" />
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
          <Route path="/admin" element={<Suspense fallback={<PageFallback />}><Admin /></Suspense>} />
          <Route path="/" element={page(<Home />)} />
          <Route path="/products" element={page(<Products />)} />
          <Route path="/delivery" element={page(<Delivery />)} />
          <Route path="/quality" element={page(<Quality />)} />
          <Route path="/offers" element={page(<Offers />)} />
          <Route path="/events" element={page(<Events />)} />
          <Route path="/about" element={page(<About />)} />
          <Route path="/contact" element={page(<Contact />)} />
          <Route path="/checkout" element={page(<Checkout />)} />
          <Route path="*" element={page(<NotFound />)} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
