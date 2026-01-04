import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import Navbar from './components/Navbar'
import Homepage from './pages/Homepage'
import Moviepage from './pages/Moviepage'
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import { Toaster } from "react-hot-toast";
import { useAuthStore } from './store/authStore';
import AIRecommendation from './pages/AIRecommendation';
import SearchPage from './pages/SearchPage';
import CategoryPage from './pages/CategoryPage';


const App = () => {

  const { user, fetchUser, fetchingUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser])

  if (fetchingUser) {
    return (
      <div className="h-screen">
        <div className="flex justify-center items-center bg-black h-full">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Toaster />
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/movie/:id" element={<Moviepage />} />
        <Route path="/category/:type" element={<CategoryPage />} />

        {/* Auth routes - redirect to home if already logged in */}
        <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/" replace />} />
        <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/" replace />} />

        {/* Public routes - accessible to everyone */}
        <Route path="/search" element={<SearchPage />} />

        {/* Protected routes - require login */}
        <Route path="/ai-recommendation" element={user ? <AIRecommendation /> : <Navigate to="/signin" replace />} />
      </Routes>
    </div>
  )
}

export default App
