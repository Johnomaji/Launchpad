import React from 'react'
import Logo from './Logo'

const Footer = () => {
  return (
    <div className='absolute bottom-[-8rem] w-full sm:w-[1600px] z-50 bg-black'>
        <hr className="border-none h-[2px] bg-gradient-to-r from-[#EC8AEF] to-[#8121E0]" />
        <div className='flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 px-4 md:px-8 py-3 md:py-12'>

        <Logo/>

        <span className='text-white text-sm'>
        &copy; Memetic Labs {new Date().getFullYear()}. All rights reserved.
        </span>
        </div>
    </div>
  )
}

export default Footer