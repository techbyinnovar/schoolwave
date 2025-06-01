import { Calendar, Clock, MonitorSmartphone, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  openRegistrationForm: () => void;
}

const Hero: React.FC<HeroProps> = ({ openRegistrationForm }) => {
  return (
    <section className="pt-24 pb-16 px-6 md:px-12 bg-gradient-to-b from-blue-950 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 md:pr-8">
            <span className="bg-teal-500 text-blue-950 text-sm font-bold px-4 py-1 rounded-full">FREE WEBINAR</span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Reducing Unpaid School Fees: Smart Strategies That Actually Work
            </h1>
            <h2 className="text-xl md:text-2xl text-teal-300 font-medium">
              Learn how successful schools are recovering 80%+ of outstanding fees — without chasing parents or damaging relationships
            </h2>
            
            <div className="flex flex-col space-y-3 pt-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-teal-400" />
                <span>30th of May 2025</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-teal-400" />
                <span>10:00 AM</span>
              </div>
              <div className="flex items-center space-x-3">
                <MonitorSmartphone className="h-5 w-5 text-teal-400" />
                <span>Online (Zoom link sent after registration)</span>
              </div>
            </div>
            
            <button 
              onClick={openRegistrationForm}
              className="mt-6 bg-teal-500 hover:bg-teal-600 text-blue-950 font-bold py-4 px-8 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>REGISTER NOW FOR FREE</span>
              <CheckCircle2 className="h-5 w-5" />
            </button>
          </div>
          
          <div className="relative hidden md:block">
            <div className="absolute -top-12 -left-12 w-24 h-24 bg-teal-400 rounded-full opacity-20"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-teal-400 rounded-full opacity-20"></div>
            <img 
              src="/webinar.jpg" 
              alt="School administrator working at desk" 
              className="rounded-xl shadow-2xl relative z-10 border-4 border-white/10"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;