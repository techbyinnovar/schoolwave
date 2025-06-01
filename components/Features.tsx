import Image from "next/image"
import calendar from '../public/calendar.png'
import attend from '../public/attend (1).png'
import security from '../public/encrypted.png'
import report from '../public/report-card.png'
import record from '../public/record.png'
import calendarcheck from '../public/calendar-with-check.png'
import report_card from '../public/report-card (3).png'
import customer_care from '../public/communication.png'
import timetable from '../public/calendar (4).png'
import sch_concept from '../public/school_concept.png'
import call_center from '../public/call center.png'
import check_mark from '../public/check-mark.png'
import finance from '../public/finance_mockup.png'
import exam from '../public/exam_mockup2.png'
import messaging from '../public/messaging_mockup2.png'
import student from '../public/happy student.png'
import teacher from '../public/teacher messaging.png'
import assigment from '../public/assignment.png'
import broadcast from '../public/broadcast.png'
import event from '../public/events.png'
import broadcast_text from '../public/broadcast_text.png'
import speaker from '../public/speaker.gif'
import whatsapp from '../public/whatsapp.gif'
import in_app from '../public/forum.gif'
import email from '../public/email.gif'
import scan from '../public/qr-code.gif'
import scan_to_mark from '../public/scan_to_mark.png'
import auto_mark from '../public/auto_mark.png'
import scripts_upload from '../public/scripts_upload.png'
import medium from '../public/medium.png'
import payment from '../public/payment.png'
import payroll from '../public/payroll2.png'
import cbt from '../public/cbt.png'
import chats from '../public/chats.png'
import cashflow_text from '../public/cashflow.png'
import auto_script from '../public/auto_script.png'
import curved_arrow from '../public/arrow5.png'
import accounting_text from '../public/accounting.png'
import reconciliation_text from '../public/reconciliation_text.png'
import accounting from '../public/gif/accounting.gif'
import financing from '../public/gif/financing.gif'
import bill from '../public/gif/bill.gif'
import salary from '../public/gif/salary.gif'
import invoice from '../public/gif/invoice.gif'
import printer from '../public/gif/printer.gif'
import cashflow from '../public/gif/cashflow.gif'
import online_exam from '../public/gif/online_exam.gif'
import online_report from '../public/gif/online_report.gif'
import online_education from '../public/gif/online_education.gif'
import sch1 from '../public/leaders_gate.png'
import sch2 from '../public/citytop.png'
import sch3 from '../public/edn.png'
import sch4 from '../public/oakshire.png'
import sch5 from '../public/cuteland.png'
import sch6 from '../public/mojdell.png'
import sch7 from '../public/unity.png'
import exam_icon from '../public/gif/online-exam.gif'

const modules = [
  {
    title: 'Smart Attendance',
    image: record,
  },
  {
    title: 'Scan To Mark',
    image: record,
  },
  {
    title: 'AI Lesson Notes',
    image: record,
  },
]

export default function Features(){

  return(
  <div className="pb-[100px] lg:pt-0 pt-16">
    <div className="marquee-left">
      <div className="marqueeContentLeft gap-20 flex items-center lg:mb-20 mb-8">
        <Image src={sch1} width={150} height={150} alt="schools onboarded" />
        <Image src={sch2} width={150} height={150} alt="schools onboarded" />
        <Image src={sch3} width={150} height={150} alt="schools onboarded" />
        <Image src={sch4} width={150} height={150} alt="schools onboarded" />
        <Image src={sch5} width={150} height={150} alt="schools onboarded" />
        <Image src={sch6} width={150} height={150} alt="schools onboarded" />
        <Image src={sch7} width={150} height={150} alt="schools onboarded" />
        {/* Duplicate logos for continuous scrolling */}
        <Image src={sch1} width={150} height={150} alt="schools onboarded" />
        <Image src={sch2} width={150} height={150} alt="schools onboarded" />
        <Image src={sch3} width={150} height={150} alt="schools onboarded" />
        <Image src={sch4} width={150} height={150} alt="schools onboarded" />
        <Image src={sch5} width={150} height={150} alt="schools onboarded" />
        <Image src={sch6} width={150} height={150} alt="schools onboarded" />
        <Image src={sch7} width={150} height={150} alt="schools onboarded" />
      </div>
    </div>
    <div className='w-[80%] mx-auto'>
      <div className="flex flex-col items-center mb-16 mt-16 md:mt-0">
        {/* <h1 className='bg-[#0045f6] px-5 py-2 rounded-full inline-block text-white text-center'>Why Schoolwave?</h1> */}
        <h1 className='mt-5 font-semibold lg:text-5xl md:text-5xl sm:text-4xl text-3xl text-[#0045F6] text-center'>Why Top Schools Choose Schoolwave?</h1>
      </div>

      <div className="flex flex-col gap-32">
        <div className="flex md:flex-row flex-col gap-36 justify-between items-center mt-[0px] lg:mt-2">
          
          <div className=" lg:w-[50%] w-full">
            <h1 className='mt-6 font-bold text-black lg:text-4xl md:text-2xl text-xl  mb-8 text-center lg:text-left'>Smart Finance Management</h1>
           <div className="block lg:hidden  w-[50%] mx-auto">
              
              <Image src={cashflow} width={350} height={350} alt="finance icon" className="" />
              
            
          </div>
            <p className="mb-2 text-black text-lg">Spend less time on payment tracking and more on enhancing the learning experience.</p>
            <ul className="mt-4 text-black list-none flex flex-col gap-5 text-justify">
              <li className="flex justify-start items-start gap-5 text-lg">
                <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
                <p className="text-left"><b>Streamlined Payments:</b> Parents can easily pay online with multiple payment options.</p>
              </li>
              <li className="flex justify-start items-start gap-5 text-lg">
                <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
                <p className="text-left"><b>Automated Reconciliation:</b> Fees are automatically matched with student records, reducing manual errors. </p>
              </li>
              <li className="flex justify-start items-start gap-5 text-lg">
                <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
                <p className="text-left"><b>Real-Time Tracking:</b> Administrators can monitor payments instantly, ensuring transparent financial management. </p>
              </li>
            </ul>
            <div className="block lg:hidden">
              <Image src={finance} alt="finance" height={2200} width={2200} className="" />
           
            </div>
          </div>
         
          <div className="md:w-[50%] w-full relative hidden lg:block">
            <span className="flex gap-1 items-center absolute -left-14 -top-0 -rotate-12 ">
              <Image src={cashflow} width={50} height={50} alt="speaker" />
              <Image src={cashflow_text} width={120} height={120} alt="text" />
            </span>
            <span className="flex flex-col gap-12 absolute -right-20 bottom-32 items-center justify-start ">
              <Image src={printer} width={60} height={60} alt="message" />
              <Image src={salary} width={60} height={60} alt="chat" />
              <Image src={accounting} width={70} height={70} alt="message" />
            </span>
            <div className="flex gap-0 items-end justify-end right-0 -rotate-6">
              <Image src={invoice} width={50} height={50} alt="accounting" />
              <Image src={accounting_text} width={150} height={150} alt="text" />
            </div>
            <Image src={finance} alt="finance" height={2200} width={2200} className="rounded-3xl border border-[#0045f6]" />
            <div className="flex gap-1 items-center relative -rotate-12 bottom-16 -left-14">
              <Image src={bill} width={50} height={50} alt="accounting" />
              <Image src={payroll} width={110} height={110} alt="png" className="" />
            </div>
            <div className="flex gap-0 items-center justify-end bottom-6 -left-14 relative -rotate-6">
              <Image src={financing} width={50} height={50} alt="accounting" />
              <Image src={reconciliation_text} width={150} height={150} alt="text" />
            </div>
          </div>
        </div>

        <div className="flex md:flex-row flex-col gap-36 justify-between items-end">
          <div className="md:w-[50%] w-full relative hidden lg:block">
            <div className="absolute -top-16 -right-20">
              <Image src={scripts_upload} width={3000} height={3000} alt="png" className="rounded-xl border w-48" />
            </div>
            <div className="absolute top-16 right-20 rotate-0">
              <Image src={curved_arrow} width={300} height={300} alt="png" className="w-80" />
            </div>
            <span className="flex gap-1 items-center absolute -left-16 -top-12 -rotate-12">
              <Image src={cbt} width={200} height={200} alt="text" />
            </span>
            <span className="flex flex-col gap-10 absolute -left-20 bottom-24 items-center justify-start">
              <Image src={online_exam} width={60} height={60} alt="message" />
              <Image src={online_education} width={60} height={60} alt="chat" />
              <Image src={online_report} width={70} height={70} alt="message" />
            </span>
            <Image src={student} alt="sch" className="rounded-3xl border border-[#0045f6]" />
            <div className="absolute -bottom-24 -left-6">
              <Image src={auto_mark} width={150} height={150} alt="png" className="rounded-xl border " />
            </div>
            <div className="flex gap-0 items-center justify-end top-10 -left-20 relative">
              <Image src={scan} width={40} height={40} alt="accounting" />
              <Image src={auto_script} width={250} height={250} alt="text" />
            </div>
          </div>
          <div className="md:w-[50%] w-full text-justify">
            <h1 className='mt-6 font-bold text-black lg:text-4xl md:text-2xl text-xl  mb-8 text-center lg:text-left'>Efficient Examination System</h1>
                 <div className="block lg:hidden  w-[50%] mx-auto">
              
              <Image src={exam_icon} width={350} height={350} alt="finance icon" className="" />
              
            
          </div>
            <p className="mt-2 text-black text-lg">Save costs, enhance exam security and gain valuable insights into student progress.</p>
            <ul className="mt-4 text-black list-disc flex flex-col gap-5">
              <li className="flex justify-start items-start gap-5 text-lg">
                <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
                <p className="text-left"><b>Flexible Question Formats:</b> Create tests manually or use AI-generated questions for quick setup.</p>
              </li>
              <li className="flex justify-start items-start gap-5 text-lg">
                <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
                <p className="text-left"><b>Secure & Efficient:</b> No need for printed question papers, reducing costs and environmental impact.</p>
              </li>
              <li className="flex justify-start items-start gap-5 text-lg">
                <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
                <p className="text-left"><b>Comprehensive Performance Reports:</b> Detailed analytics on student performance for informed decision-making.</p>
              </li>
            </ul>
                <div className="block lg:hidden">
              <Image src={student} alt="finance" height={2200} width={2200} className="" />
           
            </div>
          </div>
        </div>

        <div className="flex md:flex-row flex-col gap-36 justify-between items-end">
          <div className="md:w-[50%] w-full text-justify">
            <h1 className='mt-6 font-bold text-black lg:text-4xl md:text-2xl text-xl  mb-8 text-center lg:text-left'>Seamless Communication</h1>
              <div className="block lg:hidden  w-[50%] mx-auto">
              
              <Image src={in_app} width={350} height={350} alt="finance icon" className="" />
              
            
          </div>
            <p className="mt-2 text-black text-lg">Build trust and keep parents informed in real time, enhancing collaboration.</p>
            <ul className="mt-4 text-black list-disc flex flex-col gap-5">
              <li className="flex justify-start items-start gap-5 text-lg">
                <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
                <p><b>Direct Messaging:</b> Private messages between parents and teachers for personalized communication.</p>
              </li>
              <li className="flex justify-start items-start gap-5 text-lg">
                <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
                <p><b>Group Announcements:</b> Bulk notifications for events, holidays and school updates.</p>
              </li>
              <li className="flex justify-start items-start gap-5 text-lg">
                <Image src={check_mark} width={30} height={30} alt="cehck icon" className="mt-2" />
                <p><b>Multi-Channel Alerts:</b> Reach parents via In-App Messages, Email and WhatsApp for effective engagement.</p>
              </li>
            </ul>
            <div className="block lg:hidden">
               <Image src={teacher} height={900} width={900} alt="sch" className="rounded-3xl border border-[#0045f6]" />
          
            </div>
          </div>
          <div className="md:w-[50%] w-full relative hidden lg:block">
            <span className="flex gap-1 items-center absolute -left-16 -top-12 -rotate-12 ">
              <Image src={speaker} width={50} height={50} alt="speaker" />
              <Image src={broadcast_text} width={250} height={250} alt="text" />
            </span>
            <span className="flex flex-col gap-12 absolute -right-20 bottom-0 items-center justify-end">
              <Image src={whatsapp} width={50} height={50} alt="chat" />
              <Image src={email} width={70} height={70} alt="message" />
              <Image src={in_app} width={70} height={70} alt="message" />
            </span>
            <Image src={teacher} height={900} width={900} alt="sch" className="rounded-3xl border border-[#0045f6]" />
            <div className="absolute -bottom-20 -left-20">
              <Image src={chats} width={240} height={240} alt="png" className="rounded-xl border shadow-md" />
            </div>
            <div className="absolute -bottom-14 -right-20">
              <Image src={medium} width={440} height={440} alt="png" className="rounded-xl border shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* OTHER FEATURES */}
    <div className="mt-48 rounded-4xl bg-[#cfebfd] flex justify-between items-start gap-52 lg:h-[698px] h-[300px] lg:rounded-l-[100px] p-0 bg-[url('/sch_element3.png')] bg-cover bg-center overflow-hidden">
      <div className="pl-32 py-64 w-[50%] hidden lg:block">
        <h1 className="mt-6 font-bold text-[#0045f6] lg:text-4xl leading-normal md:text-2xl sm:text-2xl text-3xl md:mb-4 mb-4">Other Schoolwave Features</h1>
        <p className="mb-20">All your school management & operations <br /> on one platform!</p>
      </div>

      <div className="w-[70%] lg:w-full flex gap-4 mt-0 pt-0 ">
      {/* MARQUEE UP */}
      <div className="marquee-up relative  -top-[2500px] hidden lg:block">
        <div className="marqueeContentUp flex flex-col gap-4">
          <div className="flex flex-col gap-4   justify-between">
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Smart Attendance</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Scan To Mark</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">AI Lesson Notes</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Finance & Accounting</h2>
            </div>
            <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={report_card} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Report Card Management</h2>
            </div>
            <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={report_card} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Inventory Management</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px] "></div>
          </div>

          <div className="flex flex-col gap-4   justify-between">
            {/* <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div> */}
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Smart Attendance</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Scan To Mark</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">AI Lesson Notes</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Finance & Accounting</h2>
            </div>
            <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={report_card} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Report Card Management</h2>
            </div>
            <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={report_card} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Inventory Management</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px] "></div>
          </div>
        </div>

        <div className="marqueeContentUp flex flex-col gap-4">
          <div className="flex flex-col gap-4   justify-between">
            {/* <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div> */}
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Smart Attendance</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Scan To Mark</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">AI Lesson Notes</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Finance & Accounting</h2>
            </div>
            <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={report_card} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Report Card Management</h2>
            </div>
            <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={report_card} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Inventory Management</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px] "></div>
          </div>

          <div className="flex flex-col gap-4   justify-between">
            {/* <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div> */}
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Smart Attendance</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Scan To Mark</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">AI Lesson Notes</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={record} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Finance & Accounting</h2>
            </div>
            <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={report_card} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Report Card Management</h2>
            </div>
            <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
              <Image src={report_card} width={50} height={50} alt="icon" />
              <h2 className="text-black text-2xl font-bold">Inventory Management</h2>
            </div>
            <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px] "></div>
          </div>
        </div>
      </div>

        {/* MARQUEE DOWN */}
        <div className="marquee-down relative bottom-[2500px] left-[50%] translate-x-[-25%] lg:left-[0%] lg:translate-x-[0%]">
          <div className="marqueeContentDown flex flex-col gap-4 " >
            <div className="flex flex-col gap-4   relative justify-between ">
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Geolocation Staff Clock-in</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Academic Calendar</h2>
              </div>
              <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={timetable} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Timetable Management</h2>
              </div>
              <div className="bg-gradient-to-r from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={security} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Data Security</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">CRM</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">E-Resource Library</h2>
              </div>
              <div className="bg-gradient-to-r from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            </div>
            <div className="flex flex-col gap-4   relative justify-between ">
              {/* <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div> */}
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Geolocation Staff Clock-in</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Academic Calendar</h2>
              </div>
              <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={timetable} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Timetable Management</h2>
              </div>
              <div className="bg-gradient-to-r from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={security} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Data Security</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">CRM</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">E-Resource Library</h2>
              </div>
              <div className="bg-gradient-to-r from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            </div>
          </div>

          <div className="marqueeContentDown flex flex-col gap-4">
            <div className="flex flex-col gap-4   relative justify-between ">
              {/* <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div> */}
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Geolocation Staff Clock-in</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Academic Calendar</h2>
              </div>
              <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={timetable} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Timetable Management</h2>
              </div>
              <div className="bg-gradient-to-r from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={security} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Data Security</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">CRM</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">E-Resource Library</h2>
              </div>
              <div className="bg-gradient-to-r from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            </div>
            <div className="flex flex-col gap-4   relative justify-between ">
              {/* <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div> */}
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Geolocation Staff Clock-in</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Academic Calendar</h2>
              </div>
              <div className="bg-gradient-to-l from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={timetable} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Timetable Management</h2>
              </div>
              <div className="bg-gradient-to-r from-[#0046f654] to-[#94d6ff] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={security} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">Data Security</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">CRM</h2>
              </div>
              <div className="bg-gradient-to-l from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
              <div className="bg-white rounded-xl w-[400px] border border-[#0045f6] p-6 flex items-center gap-4">
                <Image src={calendar} width={50} height={50} alt="icon" />
                <h2 className="text-black text-2xl font-bold">E-Resource Library</h2>
              </div>
              <div className="bg-gradient-to-r from-[#94d6ff] to-[#0046f654] rounded-xl h-[100px] w-[400px]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
          
    {/* <div className="mt-20 flex justify-center">
      <button
        type="submit"
        className="flex rounded-full bg-[#0045f6] px-20 py-4 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#0046f6e0] focus-visible:outline  focus-visible:outline-offset-2 focus-visible:outline-[#0045F6] cursor-pointer"
      >
        Contact Us
      </button>
    </div> */}
  </div>
  )
}
