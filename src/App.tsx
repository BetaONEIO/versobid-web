import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Listings } from './pages/Listings';
import { ListingDetail } from './pages/ListingDetail';
import { AddItem } from './pages/AddItem';
import { Help } from './pages/Help';
import { Admin } from './pages/Admin';
import { BidsReceived } from './pages/BidsReceived';
import { Profile } from './pages/Profile';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { NotificationList } from './components/ui/NotificationList';
import { VerificationBanner } from './components/ui/VerificationBanner';

// PayPal configuration
const paypalOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test',
  currency: 'GBP',
  intent: 'capture',
  'enable-funding': 'paypal',
  'disable-funding': 'card,paylater',
  components: 'buttons'
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <NotificationProvider>
          <UserProvider>
            <PayPalScriptProvider options={paypalOptions}>
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
                <VerificationBanner />
                <Header />
                <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route
                      path="/listings"
                      element={
                        <ProtectedRoute>
                          <Listings />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/listings/:id"
                      element={
                        <ProtectedRoute>
                          <ListingDetail />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/items/add"
                      element={
                        <ProtectedRoute>
                          <AddItem />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bids/received"
                      element={
                        <ProtectedRoute>
                          <BidsReceived />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
                <NotificationList />
              </div>
            </PayPalScriptProvider>
          </UserProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;