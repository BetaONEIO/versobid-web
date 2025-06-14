import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { AddItem, Listing } from './pages';
import { Help } from './pages/Help';
import { Admin } from './pages/Admin';
import { BidsReceived } from './pages/BidsReceived';
import { BidDetails } from './pages/BidDetails';
import { Profile } from './pages/Profile';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { PaymentFailed } from './pages/PaymentFailed';
import { PaymentCheckout } from './pages/PaymentCheckout';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { NotificationList } from './components/ui/NotificationList';
import { VerificationBanner } from './components/ui/VerificationBanner';
import { getPayPalClientId } from './utils/env';

const App: React.FC = () => {
  const paypalOptions = {
    clientId: getPayPalClientId(),
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <Router>
        <ThemeProvider>
          <NotificationProvider>
            <UserProvider>
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
                <VerificationBanner />
                <Header />
                <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/help" element={<Help />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/failed" element={<PaymentFailed />} />
                    <Route
                      path="/payment/checkout"
                      element={
                        <ProtectedRoute>
                          <PaymentCheckout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/listings/*"
                      element={
                        <ProtectedRoute>
                          <Listing />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bids"
                      element={
                        <ProtectedRoute>
                          <BidsReceived />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/bids/:bidId"
                      element={
                        <ProtectedRoute>
                          <BidDetails />
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
            </UserProvider>
          </NotificationProvider>
        </ThemeProvider>
      </Router>
    </PayPalScriptProvider>
  );
};

export default App;