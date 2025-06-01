'use client';
import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import WhatYouWillLearn from './components/WhatYouWillLearn';
import WhoShouldAttend from './components/WhoShouldAttend';
import WebinarDetails from './components/WebinarDetails';
import WhyAttend from './components/WhyAttend';
import RegistrationForm from './components/RegistrationForm';
import Footer from "@/components/Footer";

function App() {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showInitialPopup, setShowInitialPopup] = useState(false);

  useEffect(() => {
    // Show the popup after a short delay when the page loads
    const timer = setTimeout(() => {
      setShowInitialPopup(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const openRegistrationForm = () => {
    setShowRegistrationForm(true);
  };

  const closeRegistrationForm = () => {
    setShowRegistrationForm(false);
    setShowInitialPopup(false);
  };

  // Update document title
  useEffect(() => {
    document.title = "SchoolWave | Fee Collection Webinar";
    
    // Find the title element with the data-default attribute and update it
    const titleElement = document.querySelector('title[data-default]');
    if (titleElement) {
      titleElement.textContent = "SchoolWave | Fee Collection Webinar";
    }
  }, []);

  return (
    <div className="font-sans">
      
      <main>
        <Hero openRegistrationForm={openRegistrationForm} />
        <WhatYouWillLearn />
        <WhoShouldAttend />
        <WebinarDetails openRegistrationForm={openRegistrationForm} />
        <WhyAttend openRegistrationForm={openRegistrationForm} />
      </main>
      
      <Footer />
      
      {/* Registration form modal - shown either by initial popup or when user clicks register */}
      <RegistrationForm 
        isOpen={showRegistrationForm || showInitialPopup} 
        onClose={closeRegistrationForm} 
      />
    </div>
  );
}

export default App;