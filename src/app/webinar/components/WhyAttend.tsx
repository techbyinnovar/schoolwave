import Image from 'next/image'; 

interface Reason {
  title: string;
  description: string;
}

interface WhyAttendProps {
  openRegistrationForm: () => void;
  title: string;
  reasons: Reason[];
}

const WhyAttend: React.FC<WhyAttendProps> = ({ openRegistrationForm, title, reasons }) => {
  return (
    <section className="py-16 px-6 md:px-12 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 relative hidden md:block">
              <img 
                src="/webinar2.jpg" 
                alt="Education professionals in discussion" 
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="md:col-span-3 p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{title}</h2>
              <p className="text-teal-100 text-lg mb-6">
                Unpaid fees are a growing crisis in Nigerian schools, but it doesn&apos;t have to be your school&apos;s story. Join this power-packed session and leave with strategies you can start using immediately.
              </p>
              
              {reasons && reasons.length > 0 && (
                <div className="bg-blue-800/50 rounded-lg p-6 mb-6 backdrop-blur-sm border border-blue-700">
                  <h3 className="text-xl font-semibold text-white mb-3">You&apos;ll walk away with:</h3>
                  <ul className="space-y-4 text-teal-100">
                    {reasons.map((reason, index) => (
                      <li key={index}>
                        <h4 className="font-semibold text-white">{reason.title}</h4>
                        <p className="text-sm text-teal-200 mt-1">{reason.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-white text-xl font-semibold mb-4">🎓 Don&apos;t miss this free opportunity to save your school from financial stress.</h3>
                <button 
                  onClick={openRegistrationForm}
                  className="bg-teal-500 hover:bg-teal-600 text-blue-950 font-bold py-4 px-8 rounded-lg shadow-lg transform transition duration-300 hover:scale-105 w-full"
                >
                  YES, I WANT TO JOIN THE FREE WEBINAR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyAttend;