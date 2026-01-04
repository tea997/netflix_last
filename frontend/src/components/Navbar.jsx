import React, { useState } from 'react'
import { Search, HelpCircle, Settings, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import logo from '../assets/logo.png'
import { useAuthStore } from '../store/authStore';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
      setShowMenu(false);
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear after search
    }
  };

  const avatar = user ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username)}` : "";

  return (
    <nav className='bg-black text-gray-300 flex justify-between items-center 
    h-20 text-sm md:text-[15px] font-medium text-nowrap pr-4'>

      <Link to="/">
        <img src={logo} alt="Logo" className='w-25 h-10 cursor-pointer brightness-125' />
      </Link>

      {/* Navigation Links - Always visible */}
      <ul className='hidden xl:flex space-x-6'>
        <Link to="/">
          <li className='cursor-pointer hover:text-red-500 transition-colors'>Home</li>
        </Link>
        <Link to="/category/tv">
          <li className='cursor-pointer hover:text-red-500 transition-colors'>TV Shows</li>
        </Link>
        <Link to="/category/movies">
          <li className='cursor-pointer hover:text-red-500 transition-colors'>Movies</li>
        </Link>
        <Link to="/category/anime">
          <li className='cursor-pointer hover:text-red-500 transition-colors'>Anime</li>
        </Link>
        <Link to="/category/popular">
          <li className='cursor-pointer hover:text-red-500 transition-colors'>New & Popular</li>
        </Link>
        <Link to="/category/upcoming">
          <li className='cursor-pointer hover:text-red-500 transition-colors'>Upcoming</li>
        </Link>
      </ul>

      <div className='flex items-center space-x-4 relative '>
        <div className='relative hidden md:inline-flex items-center'>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='bg-[#333333d4] px-4 py-2 rounded-2xl min-w-[280px] pr-16 outline-none text-white 
                         focus:ring-2 focus:ring-red-500 transition-all duration-200 placeholder-gray-400'
              placeholder="Search movies..."
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className='absolute top-2 right-10 text-gray-400 hover:text-white transition-colors'
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button type="submit" className='absolute top-2 right-3 text-gray-400 hover:text-red-500 transition-colors'>
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        <Link to="/ai-recommendation">
          <button className='bg-[#E50914] text-white px-4 py-1.5 rounded font-medium hover:bg-[#C11119] transition duration-200'>Get AI Recommendation</button>
        </Link>

        {!user ? (
          <Link to="/signin">
            <button className='bg-[#E50914] text-white px-4 py-1.5 rounded font-medium hover:bg-[#C11119] transition duration-200'>Sign in</button>
          </Link>
        ) : (
          <div className='relative'>
            <img src={avatar} alt="Avatar" className='w-8 h-8 rounded cursor-pointer'
              onClick={() => setShowMenu(!showMenu)}
            />
            {showMenu && (
              <div className='absolute right-0 top-10 flex flex-col w-52 bg-black z-50 rounded border border-gray-800'>
                <button className='flex items-center px-4 py-2 text-center hover:bg-gray-700 border-b border-gray-800'>
                  <div className='flex items-center space-x-2 text-sm flex-wrap w-full'>
                    <p className='w-full text-center pb-1' >{user.username}</p>
                    <p className='text-xs text-gray-400 w-full text-center pb-2 truncate px-2' >{user.email}</p>
                  </div>
                </button>

                <button
                  className='flex items-center px-8 py-2 hover:bg-gray-700 border-b border-gray-800 w-full'>
                  <HelpCircle className='w-5 h-5 mr-2' />
                  Help
                </button>

                <button className='flex items-center px-8 py-2 hover:bg-gray-700 border-b border-gray-800 w-full'>
                  <Settings className='w-5 h-5 mr-2' />
                  Settings
                </button>

                <button onClick={handleLogout} className='flex items-center justify-center py-2 hover:bg-gray-700 w-full text-red-500'>
                  Logout
                </button>

              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
