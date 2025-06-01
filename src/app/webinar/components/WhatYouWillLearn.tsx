import { CheckCircle } from 'lucide-react';

const WhatYouWillLearn: React.FC = () => {
  const learningPoints = [
    'Practical, tested strategies for reducing unpaid school fees',
    'How to encourage prompt payment — without threats',
    'Communication techniques that drive results',
    'Tools & systems that make collections easier',
    'Live Q&A with an expert school finance coach'
  ];

  return (
    <section className="py-16 px-6 md:px-12 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-blue-950 mb-4">What You&apos;ll Learn</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Join this power-packed session to discover strategies used by successful schools to recover outstanding fees.
          </p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl shadow-lg p-8 md:p-10">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {learningPoints.slice(0, 3).map((point, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-teal-500 flex-shrink-0 mt-1" />
                  <p className="text-lg text-blue-900">{point}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {learningPoints.slice(3).map((point, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-teal-500 flex-shrink-0 mt-1" />
                  <p className="text-lg text-blue-900">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatYouWillLearn;