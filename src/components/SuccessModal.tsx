"use client"

import React from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export const SuccessModal = ( {openModal, closeModal, isOpen}:any ) => {
 
  return (
    <div>  
    <Transition appear show={isOpen} as={Fragment}>
     <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 transform translate-x-3"
                enterTo="opacity-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0 transform translate-x-3"
            >
              <Dialog.Panel className="fixed top-0 right-0 w-[25%] h-[50px] lg:w-[30%] bg-success shadow-lg z-50 rounded-md ">
                <div className='h-full ml-[10px] bg-white rounded-tr-md rounded-br-md flex items-center justify-start gap-6 p-4'>
                  <CheckCircleIcon className="lg:h-8 lg:w-8 h-6 w-6 lg:ml-0 ml-[4px] text-success" aria-hidden="true" />
                  <div className='lg:w-auto w-auto text-left lg:pl-[0px] pl-[10px]'>
                    <h2 className='lg:text-md text-sm leading-none text-black font-semibold'>SUCCESS</h2>
                    <p className='text-gray-600 text-[8px] lg:text-xs w-full mt-1'>Your information has been submitted successfully.</p>
                  </div>
                  <div className='h-[40px] border-l-2 border-gray-400 cursor-pointer flex items-center justify-center' onClick={closeModal}>
                    <p className='text-gray-600 text-[12px] lg:text-sm ml-1'>CLOSE</p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  </div>
  )
}

export default SuccessModal
