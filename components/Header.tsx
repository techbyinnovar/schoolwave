"use client"

// import { useRef } from 'react'
import { Dialog, Transition} from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { SetStateAction, useState } from 'react'
import { Modal } from './Modal'
import { DemoForm } from './DemoForm'
import { ContactForm } from './ContactForm'
import Image from 'next/image'
import SignupLeadModal from './SignupLeadModal'
import Link from 'next/link'


export default function Header(){
  console.log('Header component rendering...');
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedForm , setSelectedForm ] = useState(null)
  const [signupModalOpen, setSignupModalOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }
  
  function openModal(form:any) {
    setSelectedForm(form)
    setIsOpen(true)
  }


  const navigation = [
    { id: 1, name: 'Home', href: '/', onClick: ()=> {
      setMobileMenuOpen(false)
  } },
    { id: 2, name: 'Features', href: '/features', onClick: ()=> {
      setMobileMenuOpen(false)
  } },
    { id: 3, name: 'Pricing', href: '/pricing', onClick: ()=> {
      setMobileMenuOpen(false)
  } },
    { id: 4, name: 'Refer & Earn', href: '/refer_earn', onClick: ()=> {
        setMobileMenuOpen(false)
    } },
  //   { id: 5, name: 'Resources', href: '/resources', onClick: ()=> {
  //     setMobileMenuOpen(false)
  // } },
    { id: 6, name: 'Blog', href: '/blog', onClick: ()=> {
      setMobileMenuOpen(false)
  } },
  ]

  return (
  <header className="inset-x-0 top-0 z-40 relative">
    <nav className="flex items-center justify-between p-4 lg:px-32 md:px-20 sm:px-20 px-8 lg:py-4 md:py-4 sm:py-6 py-6" aria-label="Global">
      <div className="flex lg:flex-1">
        <a href="/" className="-m-1.5 p-1.5 flex items-center">
          <Image
            className="h-10 w-auto"
            src="/schoolwave.png"
            alt=""
            width={200}
            height={200}
          />
            <span className="text-white ml-2 lg:text-2xl md:text-2xl">Schoolwave</span>
        </a>
      </div>
      <div className="flex lg:hidden">
        <button
          type="button"
          className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          onClick={() => setMobileMenuOpen(true)}
        >
          <span className="sr-only">Open main menu</span>
          <Bars3Icon className="h-6 w-6 text-white" aria-hidden="true" />
        </button>
      </div>
      <div className="hidden lg:flex lg:gap-x-12">
        {navigation.map((item:any) => (
          <a key={item.id} href={item.href && item.href} onClick={item.onClick && item.onClick} 
          className="text-sm font-normal leading-6 text-white cursor-pointer hover:text-primary">
            {item.name}
          </a>
        ))}
        
      </div>
      <div className="hidden lg:flex lg:flex-1 lg:justify-end">
        <Link href="/contact" >  <button className='bg-[#0045F6] text-white rounded-full px-12 py-4 hover:bg-[#DFE8FF] hover:text-[#0045F6] transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 cursor-pointer mr-4' >Contact Us</button></Link>
        <Link href="/signup" >  <button className='bg-white text-[#0045F6] rounded-full px-10 py-4 font-semibold shadow-md hover:bg-[#DFE8FF] transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 cursor-pointer' >Sign Up</button></Link>
        {/* <SignupLeadModal open={signupModalOpen} onClose={() => setSignupModalOpen(false)} /> */}
        {/* <Modal isOpen={isOpen} 
          closeModal={closeModal} 
          formComponent={selectedForm === 'DemoForm' ? <DemoForm /> : <ContactForm />} /> */}
      </div>
    </nav>
    <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
      <div className="fixed inset-0 z-50" />
      <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
        <div className="flex items-center justify-between">
          <a href="#" className="-m-1.5 p-1.5 ">
            <Image
              className="h-10 w-auto"
              src='/schoolwave2.png'
              alt=""
              width={200}
              height={200}
            />
          </a>
          <button
            type="button"
            className="-m-2.5 rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">Close menu</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-gray-500/10">
            <div className="space-y-2 py-6">
              {navigation.map((item:any) => (
                <a
                  key={item.id}
                  href={item.href && item.href}
                  onClick={item.onClick && item.onClick}
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                >
                  {item.name}
                </a>
              ))}
            </div>
            {/* <div className="py-6">
    <button className='bg-primary text-white rounded-full px-5 py-3'  onClick={ ()=> {
      openModal('DemoForm')
        setMobileMenuOpen(false)
    }}>Sign In</button>
            </div> */}
          </div>
        </div>
      </Dialog.Panel>
    </Dialog> 
  </header>
  )
}