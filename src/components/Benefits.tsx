import Image from "next/image";
// import admin from '../public/admin.png'
import parent from '../../public/mother.jpg'
import teacher from '../../public/teacher.jpg'
import staff from '../../public/staff2.jpg'
import student from '../../public/student.png'
import school from '../../public/school.jpg'
import school_owner from '../../public/school owner.jpg'
import check_mark from '../../public/check-mark.png'
import education from '../../public/gif/education.gif'
import diploma from '../../public/gif/diploma.gif'
import efficiency from '../../public/gif/efficiency.gif'
import teaching from '../../public/gif/teaching.gif'
import books from '../../public/gif/books.gif'
import exam from '../../public/gif/exam.gif'
import admin from '../../public/gif/admin.gif'
import calendar from '../../public/gif/calendar.gif'
import parents from '../../public/gif/parent.gif'
import analytics from '../../public/gif/analytics.gif'
import marketing from '../../public/gif/marketing.gif'
import payment from '../../public/gif/payment.gif'
import inventory from '../../public/gif/inventory.gif'
import ai_assistant from '../../public/gif/ai_assistant.gif'
import lecture_room from '../../public/gif/lecture_room.gif'
import computer from '../../public/gif/computer.gif'


export default function Benefits(){

  return(
  <div className="bg-white lg:px-32 md:px-20 sm:px-12 px-10 lg:py-20 md:py-24 lg:mb-20 flex flex-col items-center justify-center">
    <h1 className='lg:text-5xl md:text-4xl text-2xl font-semibold lg:mt-7 md:mt-7 mt-20 mb-20 text-[#0045F6] text-center lg:w-full md:w-full sm:w-[80%] w-full'>Who Benefits From Schoolwave?</h1>

    <div className="flex flex-col gap-32">
      {/* SCHOOLS */}
      <div className="flex md:flex-row flex-col gap-36 justify-between items-end mt-2">
        <div className="md:w-[50%] w-full">
           <Image src={school} alt="finance" height={800} width={800} className="rounded-3xl border border-[#0045f6] block lg:hidden" />
       
          <h1 className='font-bold text-black lg:text-4xl md:text-2xl sm:text-2xl text-3xl mb-8 text-left'>Schools</h1>
          <p className="mb-2 text-black text-lg">Schools can enhance productivity, reduce costs and focus on delivering quality education.</p>
          <ul className="mt-4 text-black list-none flex flex-col gap-5 text-justify">
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Streamlined Administration - Centralized management for efficient operations.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Cost Efficiency - Reduces paperwork and administrative overhead.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Data-Driven Decisions - Advanced analytics for continuous improvement.</p>
            </li>
          </ul>
        </div>
        <div className="md:w-[50%] w-full relative hidden lg:block">
        <Image src={school} alt="finance" height={800} width={800} className="rounded-3xl border border-[#0045f6]" />
         <span className="flex flex-col gap-12 absolute -left-20 bottom-8 items-center justify-end">
            <Image src={education} width={70} height={70} alt="chat" />
            <Image src={diploma} width={60} height={70} alt="message" />
            <Image src={efficiency} width={70} height={70} alt="message" />
          </span>
        </div>
      </div>

      {/* ADMINISTRATORS */}
      <div className="flex md:flex-row flex-col gap-36 justify-between items-center">
        <div className="md:w-[50%] w-full relative hidden lg:block">
          <Image src={school_owner} alt="sch" className="rounded-3xl border border-[#0045f6]" />
          <span className="flex flex-col gap-12 absolute -right-20 bottom-12 items-center justify-end">
            <Image src={admin} width={60} height={60} alt="chat" />
            <Image src={analytics} width={60} height={60} alt="message" />
            <Image src={marketing} width={60} height={60} alt="message" />
          </span>
        </div>
        <div className="md:w-[50%] w-full text-justify">
          <h1 className='font-bold text-black lg:text-4xl md:text-2xl sm:text-2xl text-3xl mb-8'>Administrators</h1>
          <Image src={school_owner} alt="sch" className="rounded-3xl border border-[#0045f6] block lg:hidden" />
          <p className="mt-2 text-black text-lg">Administrators gain control, save time and improve decision making with accurate data.</p>
          <ul className="mt-4 text-black list-disc flex flex-col gap-5">
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Effortless Financial Oversight - Real-time payment tracking and financial reports.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Comprehensive Record-Keeping - Secure, centralized storage for student and staff data.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Time Efficiency - Automate repetitive tasks and streamline workflows.</p>
            </li>
          </ul>
        </div>
      </div>

      {/* TEACHERS */}
      <div className="flex md:flex-row flex-col gap-36 justify-between items-center">
        <div className="md:w-[50%] w-full">
          <h1 className='font-bold text-black lg:text-4xl md:text-2xl sm:text-2xl text-3xl mb-8 text-left'>Teachers</h1>
        <Image src={staff} alt="finance" height={800} width={800} className="rounded-3xl border border-[#0045f6] block lg:hidden" />
          <p className="mb-2 text-black text-lg">Teachers can focus on teaching, reducing administrative tasks and enhancing classroom interactions.</p>
          <ul className="mt-4 text-black list-none flex flex-col gap-5 text-justify">
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Simplified Attendance & Grading - Digital attendance and automated grading systems.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Enhanced Communication - Direct messaging with parents for better engagement.</p>
            </li>
          </ul>
        </div>
        <div className="md:w-[50%] w-full relative hidden lg:block">
        <Image src={staff} alt="finance" height={800} width={800} className="rounded-3xl border border-[#0045f6]" />
          <span className="flex flex-col gap-12 absolute -left-20 bottom-12 items-center justify-end">
            <Image src={teaching} width={65} height={70} alt="chat" />
            <Image src={books} width={55} height={55} alt="message" />
            <Image src={exam} width={55} height={55} alt="message" />
          </span>
        </div>
      </div>

      {/* PARENTS */}
      <div className="flex md:flex-row flex-col gap-36 justify-between items-center ">
        <div className="md:w-[50%] w-full relative hidden lg:block">
          <Image src={parent} alt="sch" className="rounded-3xl border border-[#0045f6]" />
          <span className="flex flex-col gap-12 absolute -right-20 bottom-12 items-center justify-end">
            <Image src={parents} width={60} height={60} alt="chat" />
            <Image src={calendar} width={60} height={60} alt="message" />
            <Image src={payment} width={60} height={60} alt="message" />
          </span>
        </div>
        <div className="md:w-[50%] w-full text-justify">
          <h1 className='font-bold text-black lg:text-4xl md:text-2xl sm:text-2xl text-3xl mb-8'>Parents</h1>
           <Image src={parent} alt="sch" className="rounded-3xl border border-[#0045f6] block lg:hidden" />
          <p className="mt-2 text-black text-lg">Parents stay connected, reducing communication gaps and increasing satisfaction.</p>
          <ul className="mt-4 text-black list-disc flex flex-col gap-5">
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Convenient Fees Payment - Pay fees anytime, anywhere with multiple payment options.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Real-Time Updates - Stay informed with notifications on student activities and school events.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Transparent Communication - Direct access to teachers and school updates for better involvement.</p>
            </li>
          </ul>
        </div>
      </div>

      {/* NON-TEACHING STAFF */}
      <div className="flex md:flex-row flex-col gap-36 justify-between items-center">
        <div className="md:w-[50%] w-full relative">
          <h1 className='mt-6 font-bold text-black lg:text-4xl md:text-2xl sm:text-2xl text-3xl mb-8 text-left'>Non-Teaching Staff</h1>
          <Image src={teacher} alt="finance" height={800} width={800} className="rounded-3xl border border-[#0045f6] block lg:hidden" />
           <p className="mb-2 text-black text-lg text-justify">SchoolWave empowers non-teaching staff by automating routine tasks, providing real-time data and streamlining communication. This reduces manual work and errors, giving them more time to focus on what truly matters.</p>
          <ul className="mt-4 text-black list-none flex flex-col gap-5 text-justify">
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Save Time - Cut out repetitive tasks and reduce errors, so you can focus on what truly matters—supporting the school.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Real-Time Updates - Stay informed with notifications on school activities and upcoming events.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Organize and secure important files in one accessible place.</p>
            </li>
          </ul>
        </div>
        <div className="md:w-[50%] w-full relative hidden lg:block">
        <Image src={teacher} alt="finance" height={800} width={800} className="rounded-3xl border border-[#0045f6]" />
          <span className="flex flex-col gap-12 absolute -left-20 bottom-10 items-center justify-end">
            <Image src={admin} width={65} height={70} alt="chat" />
            <Image src={calendar} width={55} height={55} alt="message" />
            <Image src={inventory} width={60} height={55} alt="message" />
          </span>
        </div>
      </div>

      {/* STUDENTS */}
      <div className="flex md:flex-row flex-col gap-36 justify-between items-center">
        <div className="md:w-[50%] w-full relative hidden lg:block">
          <Image src={parent} alt="sch" className="rounded-3xl border border-[#0045f6]" />
          <span className="flex flex-col gap-12 absolute -right-20 bottom-12 items-center justify-end">
            <Image src={ai_assistant} width={70} height={60} alt="chat" />
            <Image src={computer} width={60} height={60} alt="message" />
            <Image src={lecture_room} width={60} height={60} alt="message" />
          </span>
        </div>
        <div className="md:w-[50%] w-full text-justify">
          <h1 className='font-bold text-black lg:text-4xl md:text-2xl sm:text-2xl text-3xl mb-8'>Students</h1>
          <Image src={parent} alt="sch" className="rounded-3xl border border-[#0045f6] block lg:hidden" />
          <p className="mt-2 text-black text-lg">SchoolWave gives students one simple platform to manage assignments, get instant feedback, track their progress and organize their study schedule - empowering them to learn and improve every day.</p>
          <ul className="mt-4 text-black list-disc flex flex-col gap-5">
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Manage Assignments - View all assignment details, track progress, due dates and teacher feedback on one clear dashboard.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Get Instant Feedback - Receive accurate, real-time digital report cards and performance insights that show strengths and areas for improvement.</p>
            </li>
            <li className="flex justify-start items-start gap-5 text-lg">
              <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
              <p>Organize Study Schedule - Students receive timely reminders for deadlines and exam dates to help them plan study time effectively.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  )
}

{/* <h1 className='lg:text-4xl md:text-4xl text-2xl font-semibold lg:mt-7 md:mt-7 mt-20 mb-12 text-[#0045F6] text-center lg:w-full md:w-full sm:w-[80%] w-[80%]'>Enhanced Collaboration, Communication & Efficient Administrative Management</h1>
    <div className="flex lg:flex-row md:flex-col flex-col items-center justify-center gap-16">
      <div className="lg:w-[50%] md:w-auto sm:w-auto w-auto lg:px-0 md:px-0 px-12">
        <ul className='text-black border-l-2 border-[#0045F6] text-justify'>
            <span className="absolute lg:left-[231px] md:left-[68px] sm:left-[36px] left-[36px]">
              <Image src={blue_dot} alt="blue dots" className="w-6" />
            </span>
          <li className='ml-10 text-lg mb-6 items-start'>
            Our portal facilitates real-time collaboration and 
          communication between teachers, students, and parents. Empowering all parties to make informed decisions.</li>
        
            <span className="absolute lg:left-[231px] md:left-[68px] sm:left-[36px] left-[36px]">
              <Image src={blue_dot} alt="blue dots" className="w-6" />
            </span>
          <li className='ml-10 text-lg mb-6 items-start'>
          Unlock the power of data-driven decision making with in-depth reports and analytics. 
          Monitor performance and strive for constant improvement.</li>
          
            <span className="absolute lg:left-[231px] md:left-[68px] sm:left-[36px] left-[36px]">
              <Image src={blue_dot} alt="blue dots" className="w-6" />
            </span>
          <li className='ml-10 text-lg mb-6 items-start'>
            Create and manage timetables effortlessly, 
          ensuring optimal resource allocation and minimizing conflicts. Simplify the coordination of classes, extracurricular activities, 
          and events, saving valuable time and effort for your staff.</li>

            <span className="absolute lg:left-[231px] md:left-[68px] sm:left-[36px] left-[36px]">
              <Image src={blue_dot} alt="blue dots" className="w-6" />
            </span>
          <li className='ml-10 text-lg mb-6 items-start'>
            Simplified student record-keeping, 
          including attendance, grades, and personal details, all in one secure and centralized location.</li>
          
            <span className="absolute lg:left-[231px] md:left-[68px] sm:left-[36px] left-[36px]">
              <Image src={blue_dot} alt="blue dots" className="w-6" />
            </span>
          <li className='ml-10 text-lg mb-6 items-start'>
            Effortlessly manage examinations and grading 
          with School Wave robust examination and assessment grading system.</li>
          
        </ul>
      </div>

      <div className="lg:w-[38%] md:w-auto w-auto lg:px-0 md:px-0 px-12">
        <Image src={teacher} className='w-[400px] h-auto rounded-xl' alt=''/>
      </div>
    </div> */}