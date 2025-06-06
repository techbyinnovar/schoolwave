import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

interface RegistrationFormProps {
  isOpen: boolean;
  onClose: () => void;
  webinarId: string;
  webinarTitle: string;
  isFree: boolean;
  price: number; // Or string if it includes currency
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  isOpen, 
  onClose,
  webinarId,
  webinarTitle,
  isFree,
  price 
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: '',
    email: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/lead/webinar-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.whatsappNumber,
          email: formData.email,
          webinarId: webinarId, // Include webinarId
          schoolName: '', 
          address: '',    
        }),
      });
      if (res.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          onClose();
          setIsSubmitted(false); // Reset for next open
          setFormData({ fullName: '', whatsappNumber: '', email: '' }); // Clear form
          setIsSubmitting(false); // Reset submitting state
        }, 3000); // Increased timeout for user to read success message
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Registration failed. Please try again.' }));
        alert(errorData.message || 'Registration failed. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Registration submission error:', error);
      alert('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
    // setIsSubmitting(false); // Moved into try/catch/finally or individual paths
  };

  if (!isOpen) return null;

  const registrationFeeText = isFree ? 'FREE' : `for $${price}`; // Basic price display

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-blue-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {!isSubmitted ? (
          <>
            <div className="absolute top-4 right-4">
              <button 
                onClick={onClose}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition"
                aria-label="Close registration form"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-blue-950">Register for: {webinarTitle}</h2>
                <p className="text-gray-600 mt-2">
                  Secure your spot {isFree ? 'for this insightful session' : `for only $${price}`}.
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="whatsappNumber">
                    WhatsApp Number
                  </label>
                  <input
                    id="whatsappNumber"
                    name="whatsappNumber"
                    type="tel"
                    required
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="Enter your WhatsApp number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                    placeholder="Enter your email address"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-lg shadow transition ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Registering...' : `REGISTER NOW ${registrationFeeText}`}
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mt-4 flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-teal-500 flex-shrink-0" />
                  <span>We&apos;ll send you the joining link and reminders via WhatsApp and Email.</span>
                </p>
              </form>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-teal-100 p-3">
                <CheckCircle className="h-12 w-12 text-teal-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-blue-950 mb-2">Registration Successful!</h2>
            <p className="text-gray-600">
              Thank you for registering for {webinarTitle}! Check your email and WhatsApp for webinar details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;