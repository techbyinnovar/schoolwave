"use client"

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Modal from "@/components/Modal";
import DemoForm from "@/components/DemoForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
const signup = "/sign_up.png";
const fee = "/fee2.png";
const fees = "/fees.png";
const chatbot = "/chatbot.png";
const lightblue_bg = "/lightblue_bg2.png";
const arrow = "/arrow2.svg";
const exams = "/exams.png";
const finance = "/finance.png";
const crm = "/crm.png";
const close = "/close.png";
const lesson_note = "/lesson_note.png";
const inventory = "/inventory.png";
const report = "/report.png";
const classroom_update = "/classroom_update.png";
const scanner = "/scanner.png";
const events = "/events (2).png";
const dividend = "/dividend (2).png";
const calendar_new = "/calendar_new.png";
const geolocation = "/geolocation.png";
const communication = "/communication.png";
const assignment = "/assignment2.png";
const resource = "/resource.png";
const more_info = "/more_info.png";
const student_present = "/student_present.png";
const lecture_room = "/gif/lecture-room.gif";
const ai_assistant = "/gif/ai_assistant.gif";
const classroom = "/gif/classroom.gif";
const computer = "/gif/computer.gif";
const diploma = "/gif/diploma.gif";
const school = "/gif/school.gif";
const books = "/gif/books.gif";
const book = "/gif/book.gif";
const exam = "/gif/exam.gif";
const calendar = "/gif/calendar.gif";
const notification = "/gif/notification.gif";
const location = "/gif/location.gif";
const analytics = "/gif/analytics.gif";
const marketing = "/gif/marketing.gif";
const search_school = "/gif/search_school.gif";
import Link from "next/link";

// Feature data structure
const featureData = [
  {
    id: "fee-collection",
    title: "Smart Fee Collection",
    icon: fees,
    description: "Streamline your school's fee collection process with our smart payment system. Track payments, generate invoices, and send automated reminders to parents for outstanding fees.",
    videoLink: "/fee-collection-demo"
  },
  {
    id: "exams",
    title: "Examination Management",
    icon: exams,
    description: "Comprehensive exam management system that allows teachers to create, schedule, and grade exams. Students can take online tests and get instant results.",
    videoLink: "/exam-management-demo"
  },
  {
    id: "payroll",
    title: "Payroll",
    icon: dividend,
    description: "Automate your school's payroll process. Calculate salaries, taxes, and deductions with ease. Generate pay slips and maintain detailed records of all transactions.",
    videoLink: "/payroll-demo"
  },
  {
    id: "report-card",
    title: "Digital Report Card",
    icon: report,
    description: "Create and share digital report cards with parents. Include grades, comments, and performance metrics to provide a comprehensive view of student progress.",
    videoLink: "/report-card-demo"
  },
  {
    id: "geolocation",
    title: "Geolocation Staff Clock-in",
    icon: geolocation,
    description: "Track staff attendance with our geolocation-based clock-in system. Ensure staff are present at the designated location during working hours.",
    videoLink: "/geolocation-demo"
  },
  {
    id: "student-attendance",
    title: "Student Attendance",
    icon: student_present,
    description: "Easily track student attendance with our digital attendance system. Generate reports and identify attendance patterns to improve student engagement.",
    videoLink: "/student-attendance-demo"
  },
  {
    id: "auto-script",
    title: "Auto-Script Marking",
    icon: scanner,
    description: "Save time with our automated script marking system. Scan and grade multiple-choice questions instantly, reducing the workload on teachers.",
    videoLink: "/auto-script-demo"
  },
  {
    id: "communication",
    title: "Communication",
    icon: communication,
    description: "Facilitate seamless communication between teachers, students, and parents. Send announcements, messages, and updates to keep everyone informed.",
    videoLink: "/communication-demo"
  },
  {
    id: "classroom-updates",
    title: "Classroom Updates",
    icon: classroom_update,
    description: "Keep parents informed about classroom activities, assignments, and events. Share photos, videos, and updates to showcase student achievements.",
    videoLink: "/classroom-updates-demo"
  },
  {
    id: "events",
    title: "Events",
    icon: events,
    description: "Plan and manage school events efficiently. Create event schedules, send invitations, and track attendance for various school activities.",
    videoLink: "/events-demo"
  },
  {
    id: "calendar",
    title: "Calendar",
    icon: calendar_new,
    description: "Maintain a comprehensive school calendar with important dates, events, and deadlines. Sync with personal calendars for better planning.",
    videoLink: "/calendar-demo"
  },
  {
    id: "ai-lesson-notes",
    title: "AI Lesson Notes",
    icon: lesson_note,
    description: "Leverage AI to generate and organize lesson notes. Save time on lesson planning and focus more on delivering quality education.",
    videoLink: "/ai-lesson-notes-demo"
  },
  {
    id: "ai-study-assistant",
    title: "AI Study Assistant",
    icon: chatbot,
    description: "Provide students with an AI-powered study assistant that can answer questions, explain concepts, and help with homework.",
    videoLink: "/ai-study-assistant-demo"
  },
  {
    id: "assignment",
    title: "Assignment & Ticket Out",
    icon: assignment,
    description: "Create, distribute, and grade assignments digitally. Track submission status and provide timely feedback to students.",
    videoLink: "/assignment-demo"
  },
  {
    id: "e-resource",
    title: "E-Resource Library",
    icon: resource,
    description: "Access a vast library of educational resources including books, videos, and interactive content to enhance the learning experience.",
    videoLink: "/e-resource-demo"
  },
  {
    id: "inventory",
    title: "Inventory Management",
    icon: inventory,
    description: "Keep track of school inventory including books, equipment, and supplies. Generate reports and get alerts for low stock items.",
    videoLink: "/inventory-demo"
  },
  {
    id: "crm",
    title: "CRM",
    icon: crm,
    description: "Manage relationships with parents, students, and other stakeholders. Track interactions and maintain detailed records for better service.",
    videoLink: "/crm-demo"
  }
];

export default function FeaturesPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeFeature, setActiveFeature] = useState<string | null>(null);
    const [selectedForm, setSelectedForm] = useState(null);
    const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 });
    const [isMobile, setIsMobile] = useState(false);
    const [expandedAccordionItem, setExpandedAccordionItem] = useState<string | null>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setIsMobile(window.innerWidth < 768);
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Add click outside handler to close the overlay
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
          hideFeatureDetails();
        }
      };

      if (activeFeature) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [activeFeature]);

    function closeModal() {
      setIsOpen(false);
    }
    
    function openModal(form:any = null) {
      setSelectedForm(form);
      setIsOpen(true);
    }

    // Function to show feature details
    function showFeatureDetails(featureId: string, event: React.MouseEvent<HTMLButtonElement>) {
      // Get the mouse position
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      // const scrollY = window.scrollY;
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      
      // Calculate position for the overlay based on mouse position
      if (isMobile) {
        // For mobile, position overlay at the mouse cursor
        setOverlayPosition({
          top: mouseY , // At mouse cursor Y position
          left: Math.min(viewportWidth - 300, Math.max(10, mouseX - 100)) // Keep within viewport
        });
      } else {
        // For desktop, position overlay near mouse cursor
        // Determine if we should show the overlay to the left or right of cursor
        // based on available space
        const showToRight = mouseX < viewportWidth / 2;
        
        let idealLeft;
        if (showToRight) {
          idealLeft = mouseX + 10; // Show to the right of cursor
        } else {
          idealLeft = mouseX - 360; // Show to the left of cursor
        }
        
        // Make sure it stays within the viewport
        const adjustedLeft = Math.max(
          10, 
          Math.min(idealLeft, viewportWidth - 360)
        );
        
        setOverlayPosition({
          top: mouseY , // At mouse cursor Y position
          left: adjustedLeft
        });
      }
      
      setActiveFeature(featureId);
    }

    // Function to hide feature details
    function hideFeatureDetails() {
      setActiveFeature(null);
    }

    // Function to toggle accordion item on mobile
    function toggleAccordionItem(featureId: string) {
      if (expandedAccordionItem === featureId) {
        setExpandedAccordionItem(null);
      } else {
        setExpandedAccordionItem(featureId);
      }
    }

    // Get active feature data
    const activeFeatureData = activeFeature ? featureData.find(feature => feature.id === activeFeature) : null;

  return (
    <div className="bg-[#dde7ff] mx-0">
      <div className="absolute inset-0 bg-contain grad"></div>
      {/* HEADER */}
        <Header/>

      {/* HERO */}
      <div className="flex lg:flex-col md:flex-row sm:flex-row flex-col lg:gap-0 lg:px-32 md:px-20 sm:px-20 px-10 lg:items-center lg:justify-start lg:mx-0 lg:max-w-full lg:h-auto md:h-[900px] sm:h-[600px] h-[600px] relative">
        <div className="relative text-center flex flex-col items-center lg:w-full md:w-full sm:w-full w-full pt-12 sm:py-20 md:py-16 lg:pt-20 lg:pb-12">
          <h1 className="font-bold tracking-tight text-white lg:text-6xl md:text-6xl sm:text-6xl text-[50px] md:leading-snug sm:leading-snug leading-snug lg:leading-[80px] lg:w-[90%] m-0">
          All your School Management & Operations on <span className='bg-[url("/scribble.svg")] bg-no-repeat bg-contain bg-bottom pb-4'>one platform!</span>
          </h1>
          <div className="absolute lg:top-48 lg:right-80 top-72 right-0 hidden lg:block">
            <Image src={arrow} width={100} height={100} alt="arrow pointing to fee management" className="lg:-rotate-0 rotate-90 " />
          </div>
          <div className="absolute lg:top-56 lg:right-20 top-[370px] hidden lg:block">
            <Image src={fee} width={300} height={300} alt="fee management illustration" className="-rotate-12" />
          </div>
          <div className="lg:mt-16 mt-40">
            <button
              className="bg-[#0045F6] hover:bg-[#DFE8FF] hover:text-[#0045F6] text-white rounded-full px-12 py-4 transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700 cursor-pointer md:text-lg"
              onClick={() => openModal()}
              aria-label="Schedule a Demo"
            >
              Schedule a Demo
            </button>
            <Modal isOpen={isOpen} closeModal={closeModal} formComponent={<DemoForm />} />
          </div>
        </div>
      </div>

      <div className="relative lg:-bottom-10 bottom-0 z-0 mb-0">
        <Image src={lightblue_bg} alt="light blue background" fill style={{ objectFit: 'cover' }} className="" />
      </div>

      {/* SCHOOLS BENEFITS */}
      <div className="bg-[#dde7ff] relative z-50 mt-0">
        <div className="flex flex-col gap-12 py-16 lg:py-0 lg:pb-32 md:py-12 sm:py-20 lg:px-64 px-10 relative -top-6">
          <h2 className="font-bold tracking-tight text-[#0045f6] text-3xl md:text-4xl sm:text-3xl text-[30px] md:leading-snug sm:leading-snug leading-snug text-center lg:mb-6">
            Our Features
          </h2>
          <div className="flex flex-col items-center justify-center mt-16 mb-16">
            {/* Desktop View - Grid with Overlays */}
            <div className="hidden md:block w-full mt-10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-x-5 lg:gap-y-12 gap-x-12 gap-y-12 sm:gap-x-6 sm:gap-y-12 md:gap-x-5 md:gap-y-10 items-start">
                {featureData.map((feature) => (
                  <div key={feature.id} className="flex flex-col justify-center items-center z-20">
                    <div className="group bg-white flex flex-row items-center gap-2 justify-center shadow-md p-6 rounded-xl mb-5 hover:-translate-y-1 hover:duration-700 w-[100px] h-[100px] relative">
                      <Image src={feature.icon} width={60} height={60} alt={feature.title} />
                      <button 
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white"
                        onClick={(e) => showFeatureDetails(feature.id, e)}
                        aria-label={`More information about ${feature.title}`}
                      >
                        <Image src={more_info} width={20} height={20} alt="more information icon" className="absolute bottom-[70px] right-1" />
                      </button>
                    </div>
                    <h3 className="font-bold text-md text-center">{feature.title}</h3>
                  </div>
                ))}
              </div>
              
              {/* Feature Details Overlay for Desktop */}
              {activeFeature && activeFeatureData && (
                <div 
                  ref={overlayRef}
                  className="absolute bg-white bg-opacity-95 shadow-lg rounded-xl text-justify border border-blue-200 p-4 md:p-6 flex flex-col items-start justify-start gap-3 w-[90%] md:w-[350px] max-h-[450px] overflow-y-auto z-50"
                  style={{ 
                    top: `${overlayPosition.top}px`, 
                    left: `${overlayPosition.left}px`
                  }}
                >
                  <div className="flex justify-between w-full">
                    <h1 className="font-bold text-2xl text-left mb-2 text-[#0045f6]">{activeFeatureData.title}</h1>
                    <button 
                      onClick={hideFeatureDetails} 
                      className="cursor-pointer"
                      aria-label="Close feature details"
                    >
                      <Image src={close} width={20} height={20} alt="close icon" />
                    </button>
                  </div>
                  <p className="leading-loose">{activeFeatureData.description}</p>
                </div>
              )}
            </div>
            
            {/* Mobile View - Accordion */}
            <div className="block md:hidden w-full px-4 mt-6">
              <div className="flex flex-col gap-4">
                {featureData.map((feature) => (
                  <div key={feature.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <button 
                      className="w-full flex items-center justify-between p-4 bg-white"
                      onClick={() => toggleAccordionItem(feature.id)}
                      aria-expanded={expandedAccordionItem === feature.id}
                      aria-controls={`accordion-content-${feature.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Image src={feature.icon} width={40} height={40} alt="" className="flex-shrink-0" />
                        <h3 className="font-bold text-gray-700 text-md">{feature.title}</h3>
                      </div>
                      <svg 
                        className={`w-5 h-5 transition-transform ${expandedAccordionItem === feature.id ? 'transform rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedAccordionItem === feature.id && (
                      <div 
                        id={`accordion-content-${feature.id}`}
                        className="p-4 bg-gray-50"
                      >
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">{feature.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className='lg:w-[86%] w-auto md:w-auto bg-[#00164E] bg-[url("/sch_elementwhite.png")] bg-contain bg-center rounded-[36px] text-white flex lg:flex-row flex-col items-center justify-start gap-24 lg:mb-24 lg:mx-auto md:mx-20 mx-10 h-fit lg:min-h-[350px] mt-12'>
        <div className='flex flex-col gap-4 justify-center items-start md:w-[60%] lg:pl-[60px] py-[36px] p-10'>
          <h1 className='md:text-4xl text-3xl mt-0 mb-3'>Simplify your School&apos;s operations, save time & focus on what truly matters - Quality Education.</h1>
          <p className='lg:text-lg md:text-lg sm:text-lg text-md mb-8'>We&apos;re here to help! Reach out to us for more information or to schedule a demo. Get Started Today and Get One Term Free.</p>
       <Link  href='/book-demo' >   <button 
            className='bg-white py-4 px-10 font-semibold rounded-full shadow-md cursor-pointer text-[#0045f6] hover:bg-[#DFE8FF] transition ease-in delay-150 hover:-translate-y-1 hover:scale-105 duration-700' 
                  >
           Schedule a Demo
          </button></Link>
        </div>
        <div className='lg:block md:block hidden w-[23%] lg:mr-[0px] py-0 pr-6'>
          <Image src={signup} alt="school sign up illustration" width={300} height={300} />
        </div>
      </div>

      {/* FOOTER */}
      <Footer/>
    </div>
  )
}