import React from 'react'
import { useRef } from 'react'
import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { DemoForm } from './DemoForm'
import Image from 'next/image'
import sch_kid from '../../public/school_kid.png'
import check from '../../public/check2.png'
import localFont from 'next/font/local'
import Link from 'next/link'

const polysansBold = localFont({
  src: '../../public/fonts/PolySans Bulky.woff',
  weight: 'normal',
})
const polysansSlim = localFont({
  src: '../../public/fonts/PolySans Slim.woff',
  weight: 'normal',
})

export default function LandingHero(){

  const  [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }
  
  function openModal() {
    setIsOpen(true)
  }
  
  return(  
    <div className="relative">
      <div className="flex lg:flex-row md:flex-row sm:flex-row flex-col lg:gap-12 lg:px-32 md:px-20 sm:px-20 px-10 lg:items-end lg:justify-start lg:mx-0 lg:max-w-[1200px] lg:h-auto md:h-[900px] sm:h-[600px] h-[600px]">
        <div className="text-left lg:w-[85%] md:w-full sm:w-full w-full py-8 sm:py-20 md:py-16 lg:pt-20 lg:pb-36">
          <h1 className={`${polysansBold.className} tracking-tight text-white lg:text-5xl text-[30px] md:leading-snug sm:leading-snug leading-snug lg:leading-[60px] m-0`}>
          The AI-Powered All-in-One School Management Software for Seamless Operations & Enhanced Learning.
          </h1>
          
          <div className="hidden lg:block">
  <p className={`${polysansSlim.className} flex gap-4 items-center mt-8 lg:text-lg md:text-2xl sm:text-lg text-lg leading-snug text-white w-[90%]`}>
    <span className="flex gap-2 items-center"><Image src={check} width={20} height={20} alt="check" />AI-Powered CBT</span>
    <span className="flex gap-2 items-center"><Image src={check} width={20} height={20} alt="check" />Marketing Tool</span> 
    <span className="flex gap-2 items-center"><Image src={check} width={20} height={20} alt="check" />Finance Tool</span>         
    <span className="flex gap-2 items-center"><Image src={check} width={20} height={20} alt="check" />Scan To Mark</span>         
  </p>
  <p className={`${polysansSlim.className} flex gap-4 items-center justify-start mt-2 lg:text-lg md:text-2xl sm:text-lg text-lg leading-snug text-white w-[90%]`}>
    <span className="flex gap-2 items-center"><Image src={check} width={20} height={20} alt="check" />Communication Tool</span>
    <span className="flex gap-2 items-center"><Image src={check} width={20} height={20} alt="check" />School Fees Collection & Payroll</span> 
    <span className="flex gap-2 items-center"><Image src={check} width={20} height={20} alt="check" />Smart Attendance</span>         
  </p>
</div>

 <p className={`${polysansSlim.className}block lg:hidden flex flex-wrap gap-4 items-center mt-6 text-sm sm:text-lg md:text-xl lg:text-lg leading-snug w-full sm:w-[90%] text-white`}>
            {[
              'AI-Powered CBT',
              'Marketing Tool',
              'Finance Tool',
              'Scan To Mark',
              'Communication Tool',
              'School Fees Collection & Payroll',
              'Smart Attendance',
            ].map((item, index) => (
              <span key={index} className="flex gap-2 items-center">
                <Image src={check} width={20} height={20} alt="check" />
                {item}
              </span>
            ))}
          </p>
          

          {/* All your school mgt and operations on one platform! As low as N500/student/term.... put an image and video play nbutton on the image. put the text under */}
          <div className="mt-12 flex gap-4 flex-wrap">
            <Link href="/book-demo"><button
              className="bg-[#0045F6] hover:bg-[#DFE8FF] hover:text-[#0045F6] text-white rounded-full px-12 py-5 transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 cursor-pointer md:text-lg font-semibold"
            >
              Schedule a Demo
            </button></Link>
            <Link href="/get_demo_code"><button
              className="bg-white hover:bg-[#DFE8FF] text-[#0045F6] border border-[#0045F6] rounded-full px-8 py-5 transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 cursor-pointer md:text-lg font-semibold"
            >
              See Schoolwave in action Now!
            </button></Link>
          </div>
        </div>
        
        <div className='lg:block md:hidden sm:hidden hidden lg:w-[20%] md:w-[20%] sm:w-[16%] absolute lg:left-[720px] lg:bottom-[60px] md:left-[300px] sm:left-[200px]'>
          <div  className='lg:w-[780px] md:w-[750px] sm:w-auto h-auto'>
            <Image src={sch_kid} alt='school kid' />
          </div>
        </div>
      </div>
    </div>
    )
}