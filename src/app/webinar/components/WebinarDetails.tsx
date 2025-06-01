import { Calendar, Clock, MonitorSmartphone, CreditCard } from 'lucide-react';

interface WebinarDetailsProps {
  openRegistrationForm: () => void;
}

const WebinarDetails: React.FC<WebinarDetailsProps> = ({ openRegistrationForm }) => {
  return (
    <section className="py-16 px-6 md:px-12 bg-blue-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Webinar Details</h2>
          <p className="text-lg text-teal-300 max-w-3xl mx-auto">
            Mark your calendar and secure your spot in this exclusive online event
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-900/50 rounded-xl p-6 backdrop-blur-sm border border-blue-800">
            <div className="flex flex-col items-center text-center">
              <Calendar className="h-12 w-12 text-teal-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Date</h3>
              <p className="text-teal-100">30th of May 2025</p>
            </div>
          </div>
          
          <div className="bg-blue-900/50 rounded-xl p-6 backdrop-blur-sm border border-blue-800">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-12 w-12 text-teal-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Time</h3>
              <p className="text-teal-100">10:00 AM</p>
            </div>
          </div>
          
          <div className="bg-blue-900/50 rounded-xl p-6 backdrop-blur-sm border border-blue-800">
            <div className="flex flex-col items-center text-center">
              <MonitorSmartphone className="h-12 w-12 text-teal-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Location</h3>
              <p className="text-teal-100">Online (Zoom/Google Meet)</p>
              <p className="text-sm text-teal-200 mt-1">Link sent after registration</p>
            </div>
          </div>
          
          <div className="bg-blue-900/50 rounded-xl p-6 backdrop-blur-sm border border-blue-800">
            <div className="flex flex-col items-center text-center">
              <CreditCard className="h-12 w-12 text-teal-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fee</h3>
              <p className="text-teal-100 font-bold">FREE</p>
              <p className="text-sm text-teal-200 mt-1">Limited spots available</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <button 
            onClick={openRegistrationForm}
            className="bg-teal-500 hover:bg-teal-600 text-blue-950 font-bold py-4 px-8 rounded-lg shadow-lg transform transition duration-300 hover:scale-105"
          >
            REGISTER NOW FOR FREE
          </button>
        </div>
      </div>
    </section>
  );
};

export default WebinarDetails;