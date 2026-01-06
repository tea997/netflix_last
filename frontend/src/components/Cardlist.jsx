import React, { useState, useEffect } from 'react'
import CardImg from '../assets/cardimg.jpg'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Navigation, Pagination } from 'swiper/modules'
import { Link } from 'react-router'

const Cardlist = ({ title, category }) => {
  const [data, setData] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Calling our own backend instead of TMDB directly
    fetch(`${API_URL}/api/category/${category}`)
      .then(res => res.json())
      .then(res => {
        setData(res.content || []);
      })
      .catch(err => console.error(`Error fetching ${category}:`, err));
  }, [category, API_URL])

  return (
    <div className='text-[#ffffff] md:px-4'>
      <h2 className='pt-10 pb-5 text-lg' >{title}</h2>
      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={5}
        spaceBetween={10}
        navigation
        pagination={{ clickable: true }}
        className='mySwiper'>

        {data.map((item, index) => (
          <SwiperSlide key={index} className='w-32'>
            <Link to={`/movie/${item.id}`}>
              <img
                src={`https://image.tmdb.org/t/p/w500${item.backdrop_path}`}
                alt={item.title}
                className='h-34 w-full object-center object-cover'
              />
              <p className='text-center pt-2'>{item.title}</p>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default Cardlist