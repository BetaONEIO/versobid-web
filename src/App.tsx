import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Home } from './pages/Home';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Bids } from './pages/Bids';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <UserProvider>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route
                  path="/bids"
                  element={
                    <ProtectedRoute>
                      <Bids />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </UserProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;