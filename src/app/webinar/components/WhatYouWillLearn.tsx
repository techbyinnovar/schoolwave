import { CheckCircle } from 'lucide-react';

interface WhatYouWillLearnProps {
  title: string;
  description: string;
  learningPoints: string[];
}

const WhatYouWillLearn: React.FC<WhatYouWillLearnProps> = ({ title, description, learningPoints }) => {
  const midPoint = Math.ceil(learningPoints.length / 2);
  const firstColumnPoints = learningPoints.slice(0, midPoint);
  const secondColumnPoints = learningPoints.slice(midPoint);

  return (
    <section className="py-16 px-6 md:px-12 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-blue-950 mb-4">{title}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        
        {learningPoints.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl shadow-lg p-8 md:p-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {firstColumnPoints.map((point, index) => (
                  <div key={`learn-${index}`} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-teal-500 flex-shrink-0 mt-1" />
                    <p className="text-lg text-blue-900">{point}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {secondColumnPoints.map((point, index) => (
                  <div key={`learn-${index + midPoint}`} className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-teal-500 flex-shrink-0 mt-1" />
                    <p className="text-lg text-blue-900">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WhatYouWillLearn;