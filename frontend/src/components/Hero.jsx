import React, { useEffect, useState } from 'react'
import { Bookmark, Play } from 'lucide-react'
import { Link } from 'react-router'
import { useAuthStore } from '../store/authStore';

import HeroBg from '../assets/herobg2.jpg'

const Hero = () => {
  const [movie, setMovie] = useState(null);
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyODk5ZmJmYTk4OWY5YjlmOTJjNWYyYTVjNzExZjhhNiIsIm5iZiI6MTc2NjMzODI3NS45OTYsInN1YiI6IjY5NDgyZWUzNDkzNWIyZTMzMmZiMTFlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1uCxRfRwaewJNY5IpKotduvdBYC7PQsuNiN9deCjNkw'
    }
  };

  useEffect(() => {
    fetch('https://api.themoviedb.org/3/movie/upcoming?language=en-US&page=1', options)
      .then(res => res.json())
      .then(res => {
        if (res.results && res.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * res.results.length);
          setMovie(res.results[randomIndex]);
        }
      })
      .catch(err => console.error(err));
  }, [])

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
