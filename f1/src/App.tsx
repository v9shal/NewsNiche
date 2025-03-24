import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

// Pages
import LoginPage from './pages/loginPage';
import Register from './pages/registerPage';
import DashBoard from './pages/DashBoard';
import Home from './pages/home';
import BookmarkPage from './pages/bookmark';
import ProtectedRoute from './ProtectedRoute';

// State management
import { clearCredentials, setCredentials } from './features/auth/authSlice';
import Profile from './pages/profile';

// Background Component
const AppBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800"></div>
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-purple-900/30 via-transparent to-blue-900/30"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(120,90,180,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Blurred subtle shapes */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl"></div>
      
      {/* Animated subtle gradient bubbles */}
      <div 
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-gradient-to-r from-purple-700/5 to-purple-900/5 blur-3xl animate-pulse" 
        style={{ animationDuration: '15s' }}
      ></div>
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-blue-700/5 to-purple-800/5 blur-3xl animate-pulse"
        style={{ animationDuration: '20s' }}
      ></div>
    </div>
  );
};

// Loading Component
const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: any) => state.auth.isAuthenticated);
  const [loading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7000/api/auth/verify`,
          {
            withCredentials: true,
            timeout: 5000
          }
        );
        
        if (response.data.user) {
          dispatch(
            setCredentials({
              username: response.data.user.username,
              role: response.data.user.role,
              token: response.data.user.token,
            })
          );
          
          if (['/login', '/register', '/'].includes(location.pathname)) {
            navigate('/home', { replace: true });
          }
        } else if (!isAuthenticated && !['/login', '/register'].includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        dispatch(clearCredentials());
        console.error('Session verification failed', error);
        
        if (!['/login', '/register'].includes(location.pathname)) {
          navigate('/login', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    verifySession();
  }, [dispatch, navigate, location.pathname, isAuthenticated]);

  return (
    <>
      {/* Background component */}
      <AppBackground />
      
      {/* Main content with z-index to appear above background */}
      <div className="relative z-10 min-h-screen">
        {loading ? (
          <LoadingScreen />
        ) : (
          <Routes>
            <Route 
              path='/register' 
              element={isAuthenticated ? <Navigate to="/home" replace /> : <Register />} 
            />
            <Route 
              path='/login' 
              element={isAuthenticated ? <Navigate to="/home" replace /> : <LoginPage />} 
            />
            <Route 
              path='/' 
              element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path='/dashboard' 
              element={<ProtectedRoute element={<DashBoard />} />} 
            />
            <Route 
              path='/home' 
              element={<ProtectedRoute element={<Home />} />} 
            />
            <Route 
              path='/bookmark' 
              element={<ProtectedRoute element={<BookmarkPage />} />} 
            />
            <Route 
              path="*" 
              element={isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} 
            />
             <Route 
              path='/profile' 
              element={<ProtectedRoute element={<Profile />} />} 
            />
          </Routes>
        )}
      </div>
    </>
  );
}

export default App;