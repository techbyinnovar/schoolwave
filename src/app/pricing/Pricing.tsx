import React from 'react'
import Price from './Price'

const Pricing = ({min, max, value, step} : any) => {
    const price1 = {
        id: 1, 
        title: 'Starter Plan', 
        description: 'Ideal for Small Schools',
        amount: 1000, 
        features:  [ 'Fees & Payments Management', 'Student Records', 'Staff Records', 'Attendance & Calendar', 'Communication & WhatsApp integration', 'Exams & Result Management', 'Real-time Reports & Analytics', 'Support – Email Support.' ]
    }
    return (
    <div className='h-fit w-[90%] mx-auto mt-[100px]'>
        <h1 className='text-center text-xl text-[#0045F6] font-semibold'>Pricing</h1>
        <h1 className='text-center text-black text-4xl font-bold'>Flexible Pricing Plans for Every School</h1>
        <p className='text-black text-center mt-[20px] lg:w-[60%] w-[90%] mx-auto'>Choose a plan that suits your school's needs. Whether you're managing a Montessori, Primary or Secondary School, Schoolwave has the perfect solution for you.</p>
        
        <div className='lg:flex lg:space-x-8 justify-between w-[50%] mt-[40px] mx-auto h-fit'>
            <Price
            features= {price1.features}
            min={min}
            max={max}
            step={step}
            />
        </div>   
    </div>
    )}

export default Pricing
