import { Users, ClipboardList, Calculator } from 'lucide-react';

const WhoShouldAttend: React.FC = () => {
  const attendees = [
    {
      title: 'School Owners',
      icon: <Users className="h-10 w-10 text-teal-500" />,
      description: 'Learn strategies to improve your school\'s financial health while maintaining positive parent relationships.'
    },
    {
      title: 'School Administrators & Bursars',
      icon: <ClipboardList className="h-10 w-10 text-teal-500" />,
      description: 'Discover practical systems to streamline fee collection and reduce administrative burden.'
    },
    {
      title: 'PTA Executives',
      icon: <Users className="h-10 w-10 text-teal-500" />,
      description: 'Understand how to bridge the gap between school needs and parent perspectives on fee payment.'
    },
    {
      title: 'School Finance Team',
      icon: <Calculator className="h-10 w-10 text-teal-500" />,
      description: 'Get equipped with tools to track, manage, and improve fee collection rates.'
    }
  ];

  return (
    <section className="py-16 px-6 md:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-950 mb-4">Who Should Attend?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            This webinar is specifically designed for education professionals involved in school financial management.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {attendees.map((attendee, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-md p-6 transition duration-300 hover:shadow-xl hover:transform hover:scale-105"
            >
              <div className="mb-4 flex justify-center">
                {attendee.icon}
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-2 text-center">{attendee.title}</h3>
              <p className="text-gray-600 text-center">{attendee.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoShouldAttend;