"use client"
import React, { useState } from 'react'
import Modal from '@/components/Modal';
import DemoForm from '@/components/DemoForm';
import { CheckIcon  } from '@heroicons/react/24/outline'
import { Slider } from '@mui/material';


export default function Price({ features }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState(1);
  const [price, setPrice] = useState(1000);

  const min = 1;
  const max = 500;
  const step = 1;
  const discountThreshold = 100;
  const perStudent = value > discountThreshold ? 800 : 1000;
  const discount = value > discountThreshold ? 0.2 : 0;

  function calculatePrice(students: number) {
    // 20% discount for schools above 100 students
    if (students > discountThreshold) {
      return students * 1000 * 0.8;
    }
    return students * 1000;
  }

  function handleSlider(event: Event, newValue: number | number[]) {
    if (typeof newValue === "number") {
      setValue(newValue);
      setPrice(calculatePrice(newValue));
    }
  }

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <div className="flex flex-col lg:flex-grow md:flex-grow lg:w-[30%] md:w-[40%] sm:w-full w-full bg-white border border-gray-300 rounded-3xl text-black lg:py-[50px] md:py-[50px] sm:py-[30px] py-[40px] lg:px-[60px] md:px-[60px] sm:px-[30px] px-[20px] mt-10 group hover:border hover:border-[#0045F6] hover:scale-105 hover:ease-in-out hover:duration-300 cursor-pointer items-center">
      {/* Slider */}
      <div className="flex flex-col w-full justify-center">
        <span className="font-semibold lg:text-xl text-lg text-center">{value} Students</span>

        <Slider
          aria-label="Price Range"
          defaultValue={value}
          value={value}
          valueLabelDisplay="auto"
          shiftStep={1}
          step={step}
          marks
          min={min}
          max={max}
          className='py-5 h-2 text-[#0045f6] placeholder:text-red-500' 
          onChange={ handleSlider }
        />

        <div className="flex justify-between mt-0">
          <small>{min}</small>
          <small>{max}</small>
        </div>
        <h2 className="text-blue-600 text-center font-medium mb-2">Schools above 100 students get a 20% discount (₦800 per student)</h2>
      </div>

      <h1 className="font-bold lg:text-6xl text-3xl mt-8 mb-2 text-center text-[#0045f6]">
        {`₦${price.toLocaleString()}`}
      </h1>

      <h1 className="font-bold lg:text-2xl text-lg mb-2 text-center">
        {discount > 0 ? (
          <>
            <span className="line-through text-gray-400 mr-2">₦1000</span>
            <span className="text-green-600">₦800</span> <span className="lg:text-sm text-xs font-semibold">/Student/Term</span>
          </>
        ) : (
          <span>₦1000 <span className="lg:text-sm text-xs font-semibold">/Student/Term</span></span>
        )}
      </h1>
      {discount > 0 && (
        <h2 className="text-green-600 text-center font-semibold mb-4">20% discount applied for schools above 100 students!</h2>
      )}
          
      <button
        onClick={() => window.location.href = '/signup'}
        className="mx-auto text-center w-full mt-[30px] border border-gray-300 rounded-md h-[50px] font-bold text-[#0045F6] group-hover:bg-[#0045F6] group-hover:text-white group-hover:ease-in group-hover:duration-300"
      >
        Get Started
      </button>

      <Modal isOpen={isOpen} closeModal={closeModal} formComponent={<DemoForm />} />

      <div className="mt-[40px]">
        {features.map((feature: any, index: number) => (
          <p key={index} className="text-md flex mt-[20px]">
            <CheckIcon className="text-[#0045F6] h-[20px] w-[20px]" aria-hidden="true" />
            <span className="ml-[10px]">{feature}</span>
          </p>
        ))}
      </div>
    </div>
  );
}