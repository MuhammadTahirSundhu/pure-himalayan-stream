import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import ScrollToHash from "@/components/ScrollToHash";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Delivery from "./pages/Delivery";
import Quality from "./pages/Quality";
import Offers from "./pages/Offers";
import Events from "./pages/Events";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import Admin from "./pages/admin/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

import { useLocation } from "react-router-dom";

const CustomerLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  return (
    <>
      <Navbar />
      <main className={`min-h-screen ${!isHome ? 'pt-16' : ''}`}>{children}</main>
      <Footer />
      <CartSidebar />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToHash />
            <Routes>
              <Route path="/admin" element={<Admin />} />
              <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
              <Route path="/products" element={<CustomerLayout><Products /></CustomerLayout>} />
              <Route path="/delivery" element={<CustomerLayout><Delivery /></CustomerLayout>} />
              <Route path="/quality" element={<CustomerLayout><Quality /></CustomerLayout>} />
              <Route path="/offers" element={<CustomerLayout><Offers /></CustomerLayout>} />
              <Route path="/events" element={<CustomerLayout><Events /></CustomerLayout>} />
              <Route path="/about" element={<CustomerLayout><About /></CustomerLayout>} />
              <Route path="/contact" element={<CustomerLayout><Contact /></CustomerLayout>} />
              <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
