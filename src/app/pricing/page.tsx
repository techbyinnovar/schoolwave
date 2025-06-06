"use client"

import { useState, useEffect, useRef } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Price from "./Price"

const price1 = {
  id: 1, 
  title: 'Starter Plan', 
  description: 'Ideal for Small Schools',
  amount: 1000, 
  features:  [ 'School Fees & Payments Management', 'Student Records', 'Staff Records', 'Exams & Result Management', 'Staff, Parent & Student Portal', 'Attendance & Calendar', 'Communication & WhatsApp integration', 'Real-time Reports & Analytics', 'Multi-School Management', 'Geolocation Staff Clock-In', 'Advanced HR & Payroll', 'AI-Driven Exam Processing', 'Smart Finance Automation', '24/7 Premium Support.' ]
}

export default function page({ min, max, step, value, handleSlider }: any) {
  return (
    <div className="bg-blue-100 mx-0">
      {/* HEADER */}
      <div className="grad">
        <Header/>
      </div>

     <div className='bg-[url("/sch_element3.png")] bg-cover lg:bg-bottom'>
      <div className='h-fit lg:w-[90%] w-full lg:mx-auto mx-0 pt-[80px] mb-0 pb-24'>
        <h1 className='text-center text-xl text-[#0045F6] font-semibold'>Pricing</h1>
        <h1 className='text-center text-black text-4xl font-bold lg:px-0 px-10'>Flexible Pricing Plan for Every School</h1>
        <p className='text-black text-center mt-[20px] lg:w-[60%] w-[90%] mx-auto lg:px-0 px-4'>Choose a plan that suits your school&apos;s needs. Whether you&apos;re managing a Montessori, Primary or Secondary School, Schoolwave has the perfect solution for you.</p>
        
        <div className='lg:flex lg:space-x-8 justify-between lg:w-[50%] w-full lg:mt-[5px] mt-[20px] lg:px-0 px-10 mx-auto h-fit'>
          <Price
          features={price1.features}
          min={min}
          max={max}
          step={step}
          onChange={handleSlider}
          value={value}
          />
        </div>   
      </div>  
     </div>

      <Footer/>
    </div>
  )
}
