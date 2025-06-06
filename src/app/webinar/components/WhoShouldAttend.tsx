import { Users } from 'lucide-react';

interface TargetAudienceItem {
  title: string;
  description: string;
}

interface WhoShouldAttendProps {
  title: string;
  targetAudience: TargetAudienceItem[];
}

const WhoShouldAttend: React.FC<WhoShouldAttendProps> = ({ title, targetAudience }) => {
  return (
    <section className="py-16 px-6 md:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-950 mb-4">{title}</h2>
          {/* Static paragraph removed */}
        </div>
        
        {targetAudience && targetAudience.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {targetAudience.map((item, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl shadow-lg p-6 transition duration-300 hover:shadow-2xl hover:transform hover:-translate-y-1 flex flex-col"
              >
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-teal-500 mr-3 flex-shrink-0" />
                  <h3 className="text-xl font-semibold text-blue-900 text-left">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-left flex-grow">{item.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-center">
            Information about who should attend this webinar will be available soon.
          </p>
        )}
      </div>
    </section>
  );
};

export default WhoShouldAttend;