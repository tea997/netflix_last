import React from 'react'
import Hero from '../components/hero'
import Cardlist from '../components/Cardlist'
import Footer from '../components/Footer'

const Homepage = () => {
  return (
    <div className='p-5'>
        <Hero /> 
        <Cardlist title="Upcoming" category="upcoming"/>
        <Cardlist title="Popular" category="popular"/>
        <Cardlist title="Top Rated" category="top_rated"/>
        <Cardlist title="Now Playing" category="now_playing"/>
        <Footer />
    </div>
  )
}

export default Homepage