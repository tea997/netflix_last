import React, { useEffect, useState } from 'react'
import { Bookmark, Play } from 'lucide-react'
import { Link } from 'react-router'
import { useAuthStore } from '../store/authStore';

import HeroBg from '../assets/herobg2.jpg'

const Hero = () => {
  const [movie, setMovie] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Calling our own backend instead of TMDB directly
    fetch(`${API_URL}/api/category/upcoming`)
      .then(res => res.json())
      .then(res => {
        if (res.content && res.content.length > 0) {
          const randomIndex = Math.floor(Math.random() * res.content.length);
          setMovie(res.content[randomIndex]);
        }
      })
      .catch(err => console.error("Error fetching hero movie:", err));
  }, [API_URL])

  if (!movie) {
    return <p>loading...</p>;
  }
  return (
    <div className='text-white relative bg-black'>
      <img src={movie?.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : HeroBg} alt="bg-img" className='w-full h-130 rounded-cover rounded-2xl object-cover' />

      <div className='flex space-x-5 md:space-x-4 absolute bottom-2 left-5 md:bottom-10 md:left-10 font-medium'>
        {useAuthStore.getState().user && (
          <button className='flex items-center justify-center bg-white hover:bg-[#d7c3c4] text-[#e21919] px-3 py-2 rounded-full cursor-pointer text-sm md:text-base'> <Bookmark /> Save for Later</button>
        )}
        <Link to={`/movie/${movie.id}`}>
          <button className='flex items-center justify-center bg-[#e50b0b]
             hover:bg-[#d7c3c4] text-[#f6efef] px-3 py-2 rounded-full cursor-pointer text-sm md:text-base'>
            <Play /> Watch Now</button>
        </Link>
      </div>
    </div>

  )
}

export default Hero
