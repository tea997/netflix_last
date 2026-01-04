import React from 'react'

const Footer = () => {
  return (
    <div className='text-[#d7c3c4] px-7 ' >

    <div className='py-10'>
    <p>Devloped By Adarsh</p>
    <p>Read about Netflix TV shows and Movies and watch bonus video on T.com.</p>
    </div>

    <p className='pb-5'>Questions Contact us.</p>

    <div className='grid grid-cols-2 md:grid-cols-4 twxt-sm pb-5 max-w-5xl'>
      <ul className='flex flex-col space-y-2'>
        <li>FAQ</li>
        <li>Investor Relations</li>
        <li>Privacy</li>
        <li>Speed Test</li>
        
      </ul>

      <ul className='flex flex-col space-y-2 pb-2'>
        <li>Help Center</li>
        <li>Jobs</li>
        <li>Cookie Preferences</li>
        <li>Legal Notices</li>
      </ul>

      <ul className='flex flex-col space-y-2'>
        <li>Media Center</li>
        <li>Terms of Use</li>
        <li>Contact us</li>
      </ul>
    </div>

    </div>
    
  )
}

export default Footer