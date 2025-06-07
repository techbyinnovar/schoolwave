'use client';

import React, { useState, useEffect } from 'react';
import type { Webinar } from '@prisma/client';
// Local fallback for Prisma.JsonValue type
// See: https://github.com/prisma/prisma/issues/9207
// This is sufficient for client-side type checking
export type JsonValue = string | number | boolean | { [x: string]: JsonValue } | Array<JsonValue> | null;

// Component imports - assuming they are in src/app/webinar/components/
import Hero from '../components/Hero';
import WhatYouWillLearn from '../components/WhatYouWillLearn';
import WhoShouldAttend from '../components/WhoShouldAttend';
import WebinarDetailsComponent from '../components/WebinarDetails'; // Renamed to avoid potential naming conflicts
import WhyAttend from '../components/WhyAttend';
import RegistrationForm from '../components/RegistrationForm';
import Footer from "@/components/Footer"; // Assuming alias is configured

// Define Facilitator type (consistent with WebinarDetails.tsx)
interface Facilitator {
  name: string;
  title?: string;
  bio?: string;
  imageUrl?: string;
}

// Define WhyAttendReason type (consistent with WhyAttend.tsx)
interface WhyAttendReason { 
  title: string; 
  description: string; 
}

// Define TargetAudienceItem type
interface TargetAudienceItem {
  title: string;
  description: string;
}

export type ClientWebinarData = Webinar & {
  author?: { name?: string | null; } | null;
  // Assumed JSON fields on the Webinar model (add to Prisma schema if not present)
  learningObjectives?: JsonValue | null; // Should store string[]
  targetAudience?: JsonValue | null;   // Should store string[]
  whyAttendReasons?: JsonValue | null; // Should store WhyAttendReason[]
  // Assumed String fields for section titles/descriptions (add to Prisma schema if not present)
  whatYouWillLearnTitle?: string | null;
  whatYouWillLearnDescription?: string | null;
  whoShouldAttendTitle?: string | null;
  whyAttendTitle?: string | null;
  whyAttendParagraph?: string | null;
  whyAttendHighlight?: string | null;
  language?: string | null; // Added for WebinarDetailsComponent
};

interface WebinarClientContentProps {
  webinar: ClientWebinarData;
}

// Helper function to parse JSON arrays with type validation
const parseJsonArray = <T,>(jsonValue: unknown, itemValidator: (item: any) => item is T): T[] => {
  if (!jsonValue) return [];
  try {
    const parsed = typeof jsonValue === 'string' ? JSON.parse(jsonValue) : jsonValue;
    if (Array.isArray(parsed) && parsed.every(itemValidator)) {
      return parsed as T[];
    }
  } catch (error) {
    console.error("Failed to parse JSON array:", error);
  }
  return [];
};

// Type guards for parsed JSON data
const isFacilitator = (item: any): item is Facilitator => 
  typeof item === 'object' && item !== null && typeof item.name === 'string';

const isString = (item: any): item is string => typeof item === 'string';

const isWhyAttendReason = (item: any): item is WhyAttendReason => 
  typeof item === 'object' && item !== null && typeof item.title === 'string' && typeof item.description === 'string';

const isTargetAudienceItem = (item: any): item is TargetAudienceItem =>
  typeof item === 'object' && item !== null && typeof item.title === 'string' && typeof item.description === 'string';

const WebinarClientContent: React.FC<WebinarClientContentProps> = ({ webinar }) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const openRegistrationForm = () => setShowRegistrationForm(true);
  const closeRegistrationForm = () => setShowRegistrationForm(false);

  const formattedDate = webinar.dateTime ? new Date(webinar.dateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD';
  const formattedTime = webinar.dateTime ? new Date(webinar.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }) : 'Time TBD';

  // Use the helper functions defined outside the component
  const parsedFacilitators: Facilitator[] = parseJsonArray(webinar.facilitators, isFacilitator);
  const parsedLearningPoints: string[] = parseJsonArray(webinar.learningObjectives, isString);
  const parsedTargetAudience: TargetAudienceItem[] = parseJsonArray(webinar.targetAudience, isTargetAudienceItem);
  const parsedWhyAttendReasons: WhyAttendReason[] = parseJsonArray(webinar.whyAttendReasons, isWhyAttendReason);

  return (
    <div className="font-sans">
      <main>
        <Hero
          openRegistrationForm={openRegistrationForm}
          title={webinar.title}
          subtitle={webinar.subtitle || undefined}
          date={formattedDate}
          time={formattedTime}
          platform={webinar.platform || 'Online'}
          coverImage={webinar.coverImage || undefined}
        />
        <WhatYouWillLearn
          title={webinar.whatYouWillLearnTitle || "What You Will Learn"}
          description={webinar.whatYouWillLearnDescription || webinar.description || ""} // Fallback to main description or empty
          learningPoints={parsedLearningPoints}
        />
        {parsedTargetAudience && parsedTargetAudience.length > 0 && (
          <WhoShouldAttend
            title={webinar.whoShouldAttendTitle || "Who Should Attend?"}
            targetAudience={parsedTargetAudience}
          />
        )}
        <WebinarDetailsComponent
          openRegistrationForm={openRegistrationForm}
          facilitators={parsedFacilitators}
          platform={webinar.platform || 'Online'}
          dateTime={webinar.dateTime ? new Date(webinar.dateTime) : null} // Pass null if webinar.dateTime is null
          durationMinutes={webinar.durationMinutes || 60}
          language={webinar.language || 'English'}
          isFree={webinar.isFree}
          price={webinar.price || 0}
        />
        <WhyAttend
          openRegistrationForm={openRegistrationForm}
          title={webinar.whyAttendTitle || "Why You Shouldn't Miss This"}
          reasons={parsedWhyAttendReasons}
          whyAttendParagraph={webinar.whyAttendParagraph || undefined}
          whyAttendHighlight={webinar.whyAttendHighlight || undefined}
        />
      </main>
      <RegistrationForm
        isOpen={showRegistrationForm}
        onClose={closeRegistrationForm}
        webinarId={webinar.id}
        webinarTitle={webinar.title}
        isFree={webinar.isFree}
        price={webinar.price || 0}
      />
    </div>
  );
};

export default WebinarClientContent;
