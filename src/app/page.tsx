"use client"

import { useState } from 'react'
import Header from '@/components/Header'
import CallToAction from '@/components/CallToAction'
import Footer from '@/components/Footer'
import Benefits from '@/components/Benefits'
import LandingHero from '@/components/LandingHero'
import Stats from '@/components/Stats'
import Features from '@/components/Features'
import FAQ from '@/components/FAQ'

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
  <div className="bg-white">
    <div className='relative bg-cover bg-center bg-no-repeat'>
      <div className="absolute inset-0 bg-contain grad"></div>
      <Header />
      <LandingHero/>
    </div>

    <Stats/>

    <div id='feature'>
      <Features />
    </div>
    
    <div id='benefit'>
      <Benefits />
    </div>

    <div className='w-[80%] mx-auto mt-[100px] pb-[50px]' id='faq'> 
      <h1 className='text-center text-[30px] font-bold  mb-10 text-black'> Frequently Asked <span className='px-5 py-2 bg-[#0045F6] rounded-2xl text-white'>Questions</span></h1>
      <FAQ />
    </div>

    <div>
      <CallToAction />
    </div>

    <Footer />
  
  </div>
  )
}
