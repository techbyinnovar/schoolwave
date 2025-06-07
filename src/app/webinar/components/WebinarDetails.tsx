import { Calendar, Clock, MonitorSmartphone, CreditCard, Users, Languages, Hourglass } from 'lucide-react';
import Image from 'next/image';

interface Facilitator {
  name: string;
  title?: string;
  bio?: string;
  imageUrl?: string;
}

interface WebinarDetailsProps {
  openRegistrationForm: () => void;
  facilitators: Facilitator[];
  platform: string;
  dateTime: Date | null;
  durationMinutes: number;
  language: string;
  isFree: boolean;
  price: number; // Assuming price is a number, formatting might be needed
}

const WebinarDetails: React.FC<WebinarDetailsProps> = ({
  openRegistrationForm,
  facilitators,
  platform,
  dateTime,
  durationMinutes,
  language,
  isFree,
  price,
}) => {
  const formattedDate = dateTime 
    ? dateTime.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Date TBD';
  const formattedTime = dateTime
    ? dateTime.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : 'Time TBD';

  return (
    <section className="py-16 px-6 md:px-12 bg-blue-950 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Webinar Details</h2>
          <p className="text-lg text-teal-300 max-w-3xl mx-auto">
            Key information about this exclusive online event.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Date Card */}
          <div className="bg-blue-900/50 rounded-xl p-6 backdrop-blur-sm border border-blue-800 flex flex-col items-center text-center">
            <Calendar className="h-10 w-10 text-teal-400 mb-3" />
            <h3 className="text-xl font-semibold mb-1">Date</h3>
            <p className="text-teal-100">{formattedDate}</p>
          </div>
          
          {/* Time Card */}
          <div className="bg-blue-900/50 rounded-xl p-6 backdrop-blur-sm border border-blue-800 flex flex-col items-center text-center">
            <Clock className="h-10 w-10 text-teal-400 mb-3" />
            <h3 className="text-xl font-semibold mb-1">Time</h3>
            <p className="text-teal-100">{formattedTime}</p>
          </div>
          
          {/* Platform & Duration Card */}
          <div className="bg-blue-900/50 rounded-xl p-6 backdrop-blur-sm border border-blue-800 flex flex-col items-center text-center">
            <MonitorSmartphone className="h-10 w-10 text-teal-400 mb-3" />
            <h3 className="text-xl font-semibold mb-1">Platform & Duration</h3>
            <p className="text-teal-100">{platform}</p>
            <p className="text-sm text-teal-200 mt-1">{durationMinutes} minutes</p>
          </div>
          
          {/* Fee & Language Card */}
          <div className="bg-blue-900/50 rounded-xl p-6 backdrop-blur-sm border border-blue-800 flex flex-col items-center text-center">
            <CreditCard className="h-8 w-8 text-teal-400 mb-2" />
            <Languages className="h-8 w-8 text-teal-400 mb-3" />
            <h3 className="text-xl font-semibold mb-1">Fee & Language</h3>
            <p className="text-teal-100 font-bold">{isFree ? 'FREE' : `$${price}`}</p> {/* Basic price formatting */}
            <p className="text-sm text-teal-200 mt-1">{language}</p>
          </div>
        </div>

        {/* Facilitators Section */}
        {facilitators && facilitators.length > 0 && (
          <div className="mb-12">
            <div className="text-center mb-8">
              <Users className="h-10 w-10 text-teal-400 mb-2 inline-block" />
              <h2 className="text-3xl font-bold">Meet Your Facilitators</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {facilitators.map((facilitator, index) => (
                <div key={index} className="w-full max-w-sm bg-blue-900/50 rounded-xl p-6 backdrop-blur-sm border border-blue-800 flex flex-col items-center text-center">
                  <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4 border-2 border-teal-400">
                    <Image 
                      src={facilitator.imageUrl || '/default-avatar.png'} // Provide a fallback avatar
                      alt={facilitator.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{facilitator.name}</h3>
                  {facilitator.title && <p className="text-teal-300">{facilitator.title}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 text-center">
          <button 
            onClick={openRegistrationForm}
            className="bg-teal-500 hover:bg-teal-600 text-blue-950 font-bold py-4 px-8 rounded-lg shadow-lg transform transition duration-300 hover:scale-105"
          >
            REGISTER NOW {isFree ? 'FOR FREE' : `FOR $${price}`}
          </button>
        </div>
      </div>
    </section>
  );
};

export default WebinarDetails;