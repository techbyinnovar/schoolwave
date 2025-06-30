import { db as prisma } from '@/lib/db';

export const WAAPI_BASE_URL = "https://waapi.app/api/v1";
export const WAAPI_TOKEN = process.env.WHATSAPP_API_KEY;
export const INSTANCE_ID = process.env.WHATSAPP_INSTANCE_ID;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Check for WhatsApp configuration
const isWhatsAppConfigured = () => {
  return !!WAAPI_TOKEN && !!INSTANCE_ID;
};

interface WhatsAppResponse {
  data: {
    status: "success" | "error";
    message: string;
    instanceId: string;
  };
  links: {
    self: string;
  };
  status: string;
}

interface WhatsAppResult {
  success: boolean;
  error?: string;
  data?: any;
}

interface ImageObject {
  url: string;
  description: string;
}

/**
 * Formats a phone number for WhatsApp API with Nigerian format
 * 
 * Converts phone numbers to the format +234xxxxxxxxxx where:
 * - If the number starts with 0, it removes the 0 and adds +234
 * - If the number starts with 234, it adds +
 * - If the number already starts with +234, it leaves it as is
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // First remove all non-digit characters except the + sign
  let cleaned = phoneNumber.replace(/[^0-9+]/g, "");
  
  // Handle Nigerian number formats
  if (cleaned.startsWith("0")) {
    // Remove the leading 0 and add +234
    return "+234" + cleaned.substring(1);
  } else if (cleaned.startsWith("234") && !cleaned.startsWith("+234")) {
    // Add + to numbers starting with 234
    return "+" + cleaned;
  } else if (cleaned.startsWith("+234")) {
    // Already in the correct format
    return cleaned;
  } else {
    // If none of the above, assume international format and ensure + is present
    return cleaned.startsWith("+") ? cleaned : "+" + cleaned;
  }
}

/**
 * Send a WhatsApp message with optional media
 */
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  media?: ImageObject[] | string | string[]
) {
  // Check if WhatsApp is configured
  if (!isWhatsAppConfigured()) {
    console.warn('WhatsApp API not configured: Missing API key or Instance ID');
    return { success: false, error: 'WhatsApp API not configured' };
  }
  
  const formattedNumber = formatPhoneNumber(phoneNumber);

  if (media) {
    let mediaUrl: string;
    let caption = message;

    if (typeof media === "string") {
      mediaUrl = media;
    } else if (Array.isArray(media)) {
      if (media.length > 0 && typeof media[0] === "object" && "url" in media[0]) {
        mediaUrl = (media as ImageObject[])[0].url;
        if ((media as ImageObject[])[0].description) {
          caption = `${message}\n\n${(media as ImageObject[])[0].description}`;
        }
      } else {
        mediaUrl = media[0] as string;
      }
    } else {
      return sendTextMessage(formattedNumber, message);
    }

    const url = `${WAAPI_BASE_URL}/instances/${INSTANCE_ID}/client/action/send-media`;

    console.log(`[WhatsApp API] Sending media message to ${formattedNumber}`, { 
      mediaUrl: mediaUrl?.substring(0, 50) + '...', 
      hasCaption: !!caption,
      captionLength: caption?.length
    });

    // Create request payload
    const payload: Record<string, any> = {
      chatId: `${formattedNumber}@c.us`,
      mediaUrl: mediaUrl
    };
    
    // Only add caption if we have message text
    if (message && message.trim().length > 0) {
      payload.caption = message;
    }
    
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${WAAPI_TOKEN}`
      },
      body: JSON.stringify(payload)
    };

    try {
      const res = await fetch(url, options);
      const json = await res.json() as WhatsAppResponse;
      
      console.log(`[WhatsApp API] Media message response status: ${json.data?.status || 'unknown'}`);
      
      // Check if json.data exists and has the expected structure
      if (!json.data) {
        console.warn('WhatsApp API Error: Unexpected response format', json);
        return { success: false, error: 'Invalid API response format', data: json };
      }
      
      // Handle error status if it exists
      if (json.data && json.data.status === "error") {
        console.warn(`WhatsApp API Error: ${json.data.message}`);
        return { success: false, error: json.data.message, data: json };
      }

      if (Array.isArray(media) && media.length > 1) {
        const remainingMedia = media.slice(1);
        for (const item of remainingMedia) {
          const nextMediaUrl = typeof item === "object" && "url" in item ? item.url : item;
          const nextCaption = typeof item === "object" && "description" in item ? item.description : "";

          await sendWhatsAppMessage(phoneNumber, nextCaption, nextMediaUrl);
        }
      }

      return { success: true, data: json };
    } catch (err) {
      console.error("Error sending WhatsApp media message:", err);
      return sendTextMessage(formattedNumber, message);
    }
  } else {
    return sendTextMessage(formattedNumber, message);
  }
}

/**
 * Send a text-only WhatsApp message
 */
async function sendTextMessage(formattedNumber: string, message: string) {
  // Check if WhatsApp is configured
  if (!isWhatsAppConfigured()) {
    console.warn('WhatsApp API not configured: Missing API key or Instance ID');
    return { success: false, error: 'WhatsApp API not configured' };
  }

  const url = `${WAAPI_BASE_URL}/instances/${INSTANCE_ID}/client/action/send-message`;

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${WAAPI_TOKEN}`
    },
    body: JSON.stringify({
      chatId: `${formattedNumber}@c.us`,
      message: message
    })
  };

  try {
    const res = await fetch(url, options);
    const json = await res.json() as WhatsAppResponse;

    if (json.data.status === "error") {
      console.warn(`WhatsApp API Error: ${json.data.message}`);
      return { success: false, error: json.data.message, data: json };
    }

    return { success: true, data: json };
  } catch (err) {
    console.error("Error sending WhatsApp message:", err);
    if (err instanceof Error) {
      return { success: false, error: `Failed to send WhatsApp message: ${err.message}` };
    } else {
      return { success: false, error: "Failed to send WhatsApp message: Unknown error" };
    }
  }
}
