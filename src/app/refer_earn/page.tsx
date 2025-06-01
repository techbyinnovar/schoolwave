"use client"

import Image from "next/image"
import Header from "@/components/Header";
import Footer from "@/components/Footer"
import CallToAction from "@/components/CallToAction"
import { useState, useEffect } from 'react'
import Modal from "@/components/Modal"
import DemoForm from "@/components/DemoForm"
const checkicon = "/check icon.png";
const bill = "/bill.png";
const billwhite = "/billwhite.png";
const signup = "/signupwhite.png";
import AnimateHeight from 'react-animate-height';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import ContactForm from "@/components/ContactForm"


export default function ReferEarnPage() {
   const  [isOpen, setIsOpen] = useState(false)
  
  function closeModal() {
    setIsOpen(false)
  }
  
  function openModal() {
    setIsOpen(true)
  }

  const [active, setActive] = useState('0');
    const togglePara = (value:any) => {
      setActive((oldValue) => {
          return oldValue === value ? '' : value;
      });
  };

  return (
    <div className="bg-white">
      <div className='relative bg-cover bg-center bg-no-repeat grad'>
        <div className="">
          <Header />
          <div className="lg:px-32 md:px-24 sm:px-12 px-10 flex flex-col items-center lg:h-[370px] md:h-[370px] h-[390px] lg:mt-28 md:mt-24 sm:mt-16 mt-16">
            {/* <h1 className='text-center text-2xl text-[#346dff] font-normal'>Refer & Earn</h1> */}
            <h1 className="font-bold text-white lg:text-6xl md:text-6xl sm:text-5xl text-[40px] md:leading-snug sm:leading-snug leading-snug lg:leading-[80px] m-0 text-center">
            Earn Rewards with Schoolwave
            </h1>
            <p className="mt-4 text-center lg:text-2xl md:text-2xl sm:text-xl text-xl leading-snug text-white lg:w-[90%] w-[80%]">
            Refer a school and earn cash - it&apos;s that simple.
            </p>

            <div className="mt-12">
              <button
                className="bg-[#0045F6] hover:bg-[#DFE8FF] hover:text-[#0045F6] text-white rounded-full px-12 py-5 transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 cursor-pointer md:text-lg"
                onClick={openModal}
              >
                Refer & Earn
              </button>
              <Modal isOpen={isOpen} closeModal={closeModal} formComponent={<ContactForm />} />
            </div>
          </div>
        </div>
      </div>

      <div className="lg:px-60 px-10 py-16 lg:py-12 mt-0 bg-blue-100 bg-[url('/sch_element3.png')] bg-cover bg-center lg:bg-no-repeat">
        <h1 className="mt-6 mb-16 lg:text-5xl md:text-5xl text-4xl font-bold text-center">How It Works</h1>
        <div className="flex flex-col justify-center items-center">
          <div className="flex flex-col gap-16">
            <div className="flex lg:flex-row flex-col-reverse justify-start items-start lg:items-stretch">
              <div className="lg:border-r-2 md:border-r-2 border-r-0 lg:border-b-0 md:border-b-0 border-b-2 border-[#0045f6] border-dashed lg:pr-24 md:pr-24 lg:pt-0 lg:pb-0 pb-20 lg:w-[50%] w-full">
                <h1 className="mt-6 lg:text-7xl md:text-7xl text-6xl text-[#0045f6] font-bold">1</h1>
                <h2 className="lg:mt-12 mt-8 text-3xl">Sign up and get your unique referral code.</h2>
              </div>
              <div className="lg:pl-24 lg:w-[50%] md:w-[50%] w-full">
                <Image src={signup} alt="checkicon" width={500} height={200} className="rounded-2xl" />
              </div>
            </div>

            <div className="flex lg:flex-row flex-col-reverse justify-start items-start lg:items-stretch">
              <div className="lg:border-r-2 md:border-r-2 border-r-0 lg:border-b-0 md:border-b-0 border-b-2 border-[#0045f6] border-dashed lg:pr-24 md:pr-24 lg:pt-0 lg:pb-0 pb-20 lg:w-[50%] w-full">
                <h1 className="mt-6 lg:text-7xl md:text-7xl text-6xl text-[#0045f6] font-bold">2</h1>
                <h2 className="lg:mt-12 mt-8 text-3xl">Share it with School Owners and Administrators.</h2>
              </div>
              <div className="lg:pl-24 lg:w-[50%] md:w-[50%] w-full">
                <Image src={billwhite} alt="checkicon" width={500} height={200} className="rounded-2xl" />
              </div>
            </div>

            <div className="flex lg:flex-row flex-col-reverse justify-start items-start lg:items-stretch">
              <div className="lg:border-r-2 md:border-r-2 border-r-0 lg:border-b-0 md:border-b-0 border-b-0 border-[#0045f6] border-dashed lg:pr-24 md:pr-24 lg:pt-0 lg:pb-0 pb-20 lg:w-[50%] w-full">
                <h1 className="mt-6 lg:text-7xl md:text-7xl text-6xl text-[#0045f6] font-bold">3</h1>
                <h2 className="lg:mt-12 mt-8 text-3xl">Earn <span className="text-4xl text-[#0045f6] font-bold">₦10,000</span> when a school signs up using your code.</h2>
              </div>
              <div className="lg:pl-24 lg:w-[50%] md:w-[50%] w-full">
                <Image src={bill} alt="checkicon" width={500} height={200} className="rounded-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="lg:mt-20 lg:mb-16 md:mb-16 mb-8 flex justify-center ">
          <button
            type="submit"
            className="flex rounded-full bg-[#0045f6] px-20 py-4 text-md font-normal leading-6 text-white shadow-sm hover:bg-[#0046f6e0] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#0045F6] cursor-pointer"
            >Join Referral Program
          </button>
        </div>

      </div>


      {/* FAQ */}
      <div className="bg-white pb-[50px] pt-[80px]">
        <div className='lg:w-[80%] px-10 mx-auto' id='faq'> 
          <h1 className='text-center text-[30px] font-bold  mb-10 text-black'> Frequently Asked <span className='px-5 py-2 bg-[#0045F6] rounded-2xl text-white'>Questions</span> on Refer & Earn</h1>
          <div className="">
            <div className="space-y-2 font-semibold">
              <div className="">
                  <div className={`${active === '1' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                      onClick={() => togglePara('1')}
                  >
                  <span className='font-normal'>How does the referral program work?</span>
                      <div className={`ltr:ml-auto rtl:mr-auto `}>
                          <PlusCircleIcon className={`w-6 h-6 ` }/>
                      </div>
                  </div>
                  <div>
                    <AnimateHeight duration={300} height={active === '1' ? 'auto' : 0}>
                      <div className="space-y-2 p-4 text-white-dark text-[13px]">
                        <p className='lg:text-base text-lg text-black font-normal'>
                        Sign up, receive a referral code and share it. You earn a reward when a school signs up using your code.
                        </p>
                      </div>
                    </AnimateHeight>
                  </div>
              </div>
              <div className="">
                  <div className={`${active === '2' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                      onClick={() => togglePara('2')}
                  >
                      <span className='font-normal'>
                      How much do I earn per referral?  
                      </span>
                      <div className={`ltr:ml-auto rtl:mr-auto `}>
                          <PlusCircleIcon className={`w-6 h-6 ` }/>
                      </div>
                  </div>
                  <div>
                    <AnimateHeight duration={300} height={active === '2' ? 'auto' : 0}>
                      <div className="space-y-2 p-4 text-white-dark text-[13px]">
                        <p className='lg:text-base text-lg text-black font-normal'>
                        ₦10,000 for every school that registers using your referral code.
                        </p>
                      </div>
                    </AnimateHeight>
                  </div>
              </div>
              <div className="">
                  <div className={`${active === '3' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                      onClick={() => togglePara('3')}
                  >
                      <span className='font-normal'>
                      When will I receive my reward?
                      </span>
                      <div className={`ltr:ml-auto rtl:mr-auto `}>
                          <PlusCircleIcon className={`w-6 h-6 ` }/>
                      </div>
                  </div>
                  <div>
                      <AnimateHeight duration={300} height={active === '3' ? 'auto' : 0}>
                          <div className="space-y-2 p-4 text-white-dark text-[13px]">
                              <p className='lg:text-base text-lg text-black font-normal'>
                              Once the referred school completes their subscription.
                              </p>
                              
                          </div>
                      </AnimateHeight>
                  </div>
              </div>
              <div className="">
                  <div className={`${active === '4' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                      onClick={() => togglePara('4')}
                  >
                      <span className='font-normal'>
                      Is there a limit to the number of referrals?
                      </span>
                      <div className={`ltr:ml-auto rtl:mr-auto`}>
                          <PlusCircleIcon className={`w-6 h-6` }/>
                      </div>
                  </div>
                  <div>
                      <AnimateHeight duration={300} height={active === '4' ? 'auto' : 0}>
                          <div className="space-y-2 p-4 text-white-dark text-[13px]">
                              <p className='lg:text-base text-lg text-black font-normal'>
                              No, you can refer as many schools as you want.
                              </p>
                          
                          </div>
                      </AnimateHeight>
                  </div>
              </div>
              <div className="">
                  <div className={`${active === '5' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                      onClick={() => togglePara('5')}
                  >
                      <span className='font-normal'>
                      How do I join the referral program?
                      </span>
                      <div className={`ltr:ml-auto rtl:mr-auto `}>
                          <PlusCircleIcon className={`w-6 h-6 ` }/>
                      </div>
                  </div>
                  <div>
                      <AnimateHeight duration={300} height={active === '5' ? 'auto' : 0}>
                          <div className="space-y-2 p-4 text-white-dark text-[13px]">
                              <p className='lg:text-base text-lg text-black font-normal'>
                              Click “Join the Referral Program Today,” fill out the form and receive your referral code via email.
                              </p>
                              
                          </div>
                      </AnimateHeight>
                  </div>
              </div>
              <div className="">
                  <div className={`${active === '6' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                      onClick={() => togglePara('6')}
                  >
                  <span className='font-normal'>
                  Who Can Join the Referral Program?
                  </span>
                      <div className={`ltr:ml-auto rtl:mr-auto `}>
                          <PlusCircleIcon className={`w-6 h-6 ` }/>
                      </div>
                  </div>
                  <div>
                      <AnimateHeight duration={300} height={active === '6' ? 'auto' : 0}>
                          <div className="space-y-2 p-4 text-white-dark text-[13px]">
                              <p className='lg:text-base text-lg text-black font-normal'>
                              School owners, teachers, vendors and anyone with a direct connection to a school are welcome to participate. The program is designed for those who can truly benefit from and contribute to the Schoolwave community.
                              </p>
                              
                          </div>
                      </AnimateHeight>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
