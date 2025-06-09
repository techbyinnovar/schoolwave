import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Modal } from './Modal'
import { DemoForm } from './DemoForm'
import { ContactForm } from './ContactForm'
import SignupLeadModal from './SignupLeadModal';
import sch_concept from '../../public/school_concept.png'
import signup from '../../public/sign_up.png'

const CallToAction =()=>{

    const [isOpen, setIsOpen] = useState(false)
    const [ selectedForm , setSelectedForm ] = useState(null)
    const [signupModalOpen, setSignupModalOpen] = useState(false);

    function closeModal() {
        setIsOpen(false)
      }
    
    function openModal(form:any) {
      setSelectedForm(form)
      setIsOpen(true)
    }

  return(
    <div className='lg:w-[86%] w-auto md:w-auto bg-[#00164E] bg-[url("/sch_elementwhite.png")] bg-contain bg-center rounded-[36px] text-white flex lg:flex-row flex-col items-center justify-start gap-24 lg:mb-24 lg:mx-auto md:mx-20 mx-10 h-fit lg:min-h-[350px] mt-12'>
        <div className='flex flex-col gap-4 justify-center items-start md:w-[60%] lg:pl-[60px] py-[36px] p-10'>
          <h1 className='md:text-4xl text-3xl mt-0 mb-3'>Simplify your School&apos;s operations, save time & focus on what truly matters - Quality Education.</h1>
          <p className='lg:text-lg md:text-lg sm:text-lg text-md mb-8'>We&apos;re here to help! Reach out to us for more information or to schedule a demo. Get Started Today and Get One Term Free.</p>
          <div className='flex flex-row gap-4'>
          <Link href="/get_demo_code" legacyBehavior passHref>
            <button className='bg-white py-4 px-8 font-semibold rounded-full shadow-md cursor-pointer text-[#0045f6] hover:bg-[#DFE8FF] transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700' >See Schoolwave in action Now!</button></Link>
            <Link href="/signup" legacyBehavior passHref>
              <a className='bg-[#0045f6] py-4 px-10 font-semibold rounded-full shadow-md cursor-pointer text-white hover:bg-[#002b8a] transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 flex items-center justify-center'>Sign Up</a>
            </Link>
            {/* <button className='bg-[#0045f6] py-4 px-10 font-semibold rounded-full shadow-md cursor-pointer text-white hover:bg-[#002b8a] transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700' onClick={() => setSignupModalOpen(true)}>Sign Up</button> */}
            {/* <SignupLeadModal open={signupModalOpen} onClose={() => setSignupModalOpen(false)} /> */}
          </div>
          <Modal isOpen={isOpen} closeModal={closeModal} formComponent={ <DemoForm /> } />
        </div>
        <div className='lg:block md:block hidden w-[23%] lg:mr-[0px] py-0 pr-6'>
          <Image src={signup} alt="school concept" />
        </div>
      </div>
    )
}

export default CallToAction