"use client"

import { Modal } from './Modal'
import { useState  } from 'react'
import { ContactForm } from './ContactForm'
import Image from 'next/image'
import localFont from 'next/font/local'

const polysans = localFont({ 
  src: '../../public/fonts/PolySans Bulky.woff'
})

const polysansSlim = localFont({ 
  src: '../../public/fonts/PolySans Neutral.woff2'
})

const Footer =()=>{

    const  [isOpen, setIsOpen] = useState(false)

    function closeModal() {
        setIsOpen(false)
      }
    
      function openModal() {
        setIsOpen(true)
      }
  
    return(
        <footer className={`${polysansSlim.className} bg-[#00164E] text-white mt-16`}>
        <div className="mx-auto w-full md:max-w-screen-xl lg:px-0 md:px-20 sm:px-10 px-10 py-12 lg:py-10">
            <div className="md:flex md:justify-between">
                <div className="mb-6 md:mb-0 md:w-[40%] w-full">
                    <a href="#" className="flex items-center gap-2 mb-6">
                    <Image width={100} height={100} className="h-10 w-auto mr-1" src="/schoolwave.png" alt="" /> 
                    <span className={`${polysansSlim.className} text-2xl tracking-normal`}>Schoolwave</span>
                    </a>
                    <p className='md:w-[80%] w-full text-md leading-6 mb-12 md:mb-0'>Comprehensive solution that streamlines school administration and improves communication for effective school management.</p>
                </div>
                <div className="grid grid-cols-2 gap-10 md:gap-12 lg:gap-6 md:grid-cols-3 w-[90%] md:w-[45%] justify-start md:justify-end">
                    <div className='text-white'>
                        <h2 className="mb-6 text-sm font-semibold uppercase text-white">Quick Links</h2>
                        <ul className="font-medium leading-8">
                            <li>
                                <a href="/features" className="hover:underline text-sm lg:text-md text-white">Features</a>
                            </li>
                            <li>
                                <a href="/blogs" className="hover:underline text-sm lg:text-md text-white">Blog</a>
                            </li>
                            <li>
                                <a href="refer_earn" className="hover:underline text-sm lg:text-md text-white">Refer & Earn</a>
                            </li>
                            <li>
                                <a onClick={ openModal} className="hover:underline cursor-pointer text-sm lg:text-md text-white">Contact Us</a>
                                <Modal isOpen={isOpen} closeModal={closeModal} formComponent={<ContactForm />} />
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="mb-6 text-sm font-semibold  uppercase text-white">Social</h2>
                        <ul className="font-medium leading-8">
                            <li>
                                <a href="https://twitter.com/theschoolwave" target='_blank' className="hover:underline text-sm lg:text-md cursor-pointer text-white"> Twitter</a>
                            </li>
                            <li>
                                <a href="https://instagram.com/theschoolwave?igshid=OGQ5ZDc2ODk2ZA==" target='_blank' className="hover:underline text-sm lg:text-md cursor-pointer text-white">Instagram</a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/company/schoolwave" target='_blank' className="hover:underline text-sm lg:text-md cursor-pointer text-white">Linkedin</a>
                            </li>
                        </ul>
                    </div>
                    {/* <div>
                        <h2 className="mb-6 text-sm font-semibold uppercase text-white">Legal</h2>
                        <ul className="font-medium leading-8">
                            <li>
                                <a href="#" className="hover:underline text-sm lg:text-md text-white">Privacy Policy</a>
                            </li>
                            <li>
                                <a href="#" className="hover:underline text-sm lg:text-md text-white">Terms &amp; Conditions</a>
                            </li>
                        </ul>
                    </div> */}
                    <div>
                        <h2 className="mb-6 text-sm font-semibold uppercase text-white">Contact</h2>
                        <ul className="font-medium leading-8">
                            <li className="text-sm lg:text-md text-white mb-3">
                            <p>hello@schoolwave.ng</p>
                            </li>
                            <li className="text-sm lg:text-md text-white mb-3">
                            <p>+234 802 133 7988</p>                         
                            </li>
                            <li className="text-sm lg:text-md text-white">
                            <p>Block A, AVM Complex, Agungi Bus Stop, Lekki, Lagos State, Nigeria.</p>                         
                            </li>
                        </ul>
                    </div>
                </div>
          </div>
          <hr className="my-6 border-gray-700 sm:mx-auto lg:my-8" />
          <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-[12px] font-normal lg:text-sm text-white sm:text-center">&copy; 2025 <a href="/" className="hover:underline">Schoolwave</a>. All Rights Reserved.
            </span>
              </div>
        </div>
    </footer>
    )
}

export default Footer