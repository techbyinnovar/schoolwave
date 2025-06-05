import { useState } from 'react';
import AnimateHeight from 'react-animate-height';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

export default function FAQ(){
    const [active, setActive] = useState('0');
        const togglePara = (value:any) => {
            setActive((oldValue) => {
                return oldValue === value ? '' : value;
            });
        };

    return(
        <div className="mb-5">
            <div className="space-y-2 font-semibold">
                <div className="">
                    <div className={`${active === '1' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                        onClick={() => togglePara('1')}
                    >
                    <span className='font-normal'> What is Schoolwave? </span>
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <PlusCircleIcon className={`w-6 h-6 ` }/>
                        </div>
                    </div>
                    <div>
                        <AnimateHeight duration={300} height={active === '1' ? 'auto' : 0}>
                            <div className="space-y-2 p-4 text-white-dark text-[13px]">
                                <p className='lg:text-base text-lg text-black font-normal'>
                                An AI-powered school management software that automates administration and streamlines operations.
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
                            Who can use Schoolwave?  
                        </span>
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <PlusCircleIcon className={`w-6 h-6 ` }/>
                        </div>
                    </div>
                    <div>
                        <AnimateHeight duration={300} height={active === '2' ? 'auto' : 0}>
                            <div className="space-y-2 p-4 text-white-dark text-[13px]">
                                <p className='lg:text-base text-lg text-black font-normal'>
                                Primary, secondary and tertiary institutions.
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
                        Does SchoolWave have an app?
                        </span>
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <PlusCircleIcon className={`w-6 h-6 ` }/>
                        </div>
                    </div>
                    <div>
                        <AnimateHeight duration={300} height={active === '3' ? 'auto' : 0}>
                            <div className="space-y-2 p-4 text-white-dark text-[13px]">
                                <p className='lg:text-base text-lg text-black font-normal'>
                                No, but it works seamlessly on any device with internet access.
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
                        How secure is my school&apos;s data?
                        </span>
                        <div className={`ltr:ml-auto rtl:mr-auto`}>
                            <PlusCircleIcon className={`w-6 h-6` }/>
                        </div>
                    </div>
                    <div>
                        <AnimateHeight duration={300} height={active === '4' ? 'auto' : 0}>
                            <div className="space-y-2 p-4 text-white-dark text-[13px]">
                                <p className='lg:text-base text-lg text-black font-normal'>
                                We use advanced encryption and secure storage solutions to keep your information safe.
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
                        Can SchoolWave be customized to fit our school&apos;s needs?
                        </span>
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <PlusCircleIcon className={`w-6 h-6 ` }/>
                        </div>
                    </div>
                    <div>
                        <AnimateHeight duration={300} height={active === '5' ? 'auto' : 0}>
                            <div className="space-y-2 p-4 text-white-dark text-[13px]">
                                <p className='lg:text-base text-lg text-black font-normal'>
                                Yes, our platform is highly customizable to suit your school&apos;s specific requirements.
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
                    Does SchoolWave support multiple users?
                    </span>
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <PlusCircleIcon className={`w-6 h-6 ` }/>
                        </div>
                    </div>
                    <div>
                        <AnimateHeight duration={300} height={active === '6' ? 'auto' : 0}>
                            <div className="space-y-2 p-4 text-white-dark text-[13px]">
                                <p className='lg:text-base text-lg text-black font-normal'>
                                Yes, SchoolWave allows administrators, teachers, students and parents to access relevant features.
                                </p>
                            </div>
                        </AnimateHeight>
                    </div>
                </div>
                <div className="">
                    <div className={`${active === '7' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                        onClick={() => togglePara('7')}
                    >
                    <span className='font-normal'>
                    How does the free term offer work?
                    </span>
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <PlusCircleIcon className={`w-6 h-6 ` }/>
                        </div>
                    </div>
                    <div>
                        <AnimateHeight duration={300} height={active === '7' ? 'auto' : 0}>
                            <div className="space-y-2 p-4 text-white-dark text-[13px]">
                                <p className='lg:text-base text-lg text-black font-normal'>
                                Once you sign up and pay for a term, you automatically receive an extra term for free.
                                </p>
                            </div>
                        </AnimateHeight>
                    </div>
                </div>
                <div className="">
                    <div className={`${active === '8' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                        onClick={() => togglePara('8')}
                    >
                    <span className='font-normal'>
                    What kind of support is available to users?
                    </span>
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <PlusCircleIcon className={`w-6 h-6 ` }/>
                        </div>
                    </div>
                    <div>
                        <AnimateHeight duration={300} height={active === '8' ? 'auto' : 0}>
                            <div className="space-y-2 p-4 text-white-dark text-[13px]">
                                <p className='lg:text-base text-lg text-black font-normal'>
                                We provide 24/7 reliable support to assist with any questions or issues you may encounter.
                                </p>
                            </div>
                        </AnimateHeight>
                    </div>
                </div>
                <div className="">
                    <div className={`${active === '9' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                        onClick={() => togglePara('9')}
                    >
                    <span className='font-normal'>
                    Is training provided for new users?
                    </span>
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <PlusCircleIcon className={`w-6 h-6 ` }/>
                        </div>
                    </div>
                    <div>
                        <AnimateHeight duration={300} height={active === '9' ? 'auto' : 0}>
                            <div className="space-y-2 p-4 text-white-dark text-[13px]">
                                <p className='lg:text-base text-lg text-black font-normal'>
                                Yes, we offer comprehensive training sessions to ensure a smooth onboarding experience for all users.
                                </p>
                            </div>
                        </AnimateHeight>
                    </div>
                </div>
                <div className="">
                    <div className={`${active === '10' ? 'text-[#0045F6]' : 'text-black'} cursor-pointer text-xl lg:text-2xl rounded-3xl border border-[#d3d3d3] py-3 px-5 flex justify-between`}
                        onClick={() => togglePara('10')}
                    >
                    <span className='font-normal'>
                    Can SchoolWave work for schools in remote areas?
                    </span>
                        <div className={`ltr:ml-auto rtl:mr-auto `}>
                            <PlusCircleIcon className={`w-6 h-6 ` }/>
                        </div>
                    </div>
                    <div>
                        <AnimateHeight duration={300} height={active === '10' ? 'auto' : 0}>
                            <div className="space-y-2 p-4 text-white-dark text-[13px]">
                                <p className='lg:text-base text-lg text-black font-normal'>
                                Yes! Our cloud-based platform supports schools everywhere.
                                </p>
                            </div>
                        </AnimateHeight>
                    </div>
                </div>

            </div>
        </div>
    )
}