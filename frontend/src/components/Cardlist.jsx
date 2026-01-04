import React, { useState, useEffect } from 'react'
import CardImg from '../assets/cardimg.jpg'
import {Swiper, SwiperSlide} from 'swiper/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Navigation, Pagination } from 'swiper/modules'
import {Link} from 'react-router'

const Cardlist = ({title, category}) => {
  const [data,setData] = useState([]);
  const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyODk5ZmJmYTk4OWY5YjlmOTJjNWYyYTVjNzExZjhhNiIsIm5iZiI6MTc2NjMzODI3NS45OTYsInN1YiI6IjY5NDgyZWUzNDkzNWIyZTMzMmZiMTFlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.1uCxRfRwaewJNY5IpKotduvdBYC7PQsuNiN9deCjNkw'
  }
};

useEffect(() => {
  fetch(`https://api.themoviedb.org/3/movie/${category}?language=en-US&page=1`, options)
  .then(res => res.json())
  .then(res => {
    setData(res.results);
  })
  .catch(err => console.error(err));
}, [category, options])

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

      {data.map((item,index) => (
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