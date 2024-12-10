import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Bids } from './pages/Bids';
import { AddItem } from './pages/AddItem';
import { Help } from './pages/Help';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { NotificationList } from './components/ui/NotificationList';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <NotificationProvider>
          <UserProvider>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
              <Header />
              <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/help" element={<Help />} />
                  <Route
                    path="/bids"
                    element={
                      <ProtectedRoute>
                        <Bids />
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
                </Routes>
              </main>
              <Footer />
              <NotificationList />
            </div>
          </UserProvider>
        </NotificationProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;