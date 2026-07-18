// frontend/js/api.js
const BASE_URL = 'https://ai-study-assistant-m4m7.onrender.com/api';

/**
 * Ek common helper function jo response ko safely text format mein nikalta hai,
 * use log karta hai, aur check karta hai ki HTML (jaise Vercel ka 404 page) toh nahi aa raha.
 */
async function safeFetch(endpoint, options = {}) {
  // Check karein ki endpoint proper format mein hai ya nahi
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  console.log(`[API Request] Method: ${options.method || 'GET'} | URL: ${url}`);

  try {
    const response = await fetch(url, options);
    console.log(`[API Response Status] Code: ${response.status} ${response.statusText}`);

    // Response ko sabse pehle raw text mein read karein taaki HTML hone par crash na ho
    const rawBody = await response.text();
    console.log(`[API Response Body]:`, rawBody);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${rawBody || response.statusText}`);
    }

    // Agar server ne HTML return kiya hai (jo '<' se start hota hai) toh error throw karein
    if (rawBody.trim().startsWith('<!DOCTYPE') || rawBody.trim().startsWith('<html')) {
      throw new Error("Server returned HTML instead of valid JSON. Check your API routes.");
    }

    // Agar sab sahi hai, tabhi JSON parse karein
    return JSON.parse(rawBody);
  } catch (error) {
    console.error(`[API Error Log] Failed during request to ${url}:`, error);
    throw error;
  }
}

// Global window object par expose kar rahe hain taaki auth.js aur app.js ise use kar sakein
window.apiService = {
  login: async (email, password) => {
    return safeFetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (username, email, password) => {
    return safeFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
  },

  // /pdf/upload endpoint ab correctly '/api/pdf/upload' par hit karega
  uploadPDF: async (formData) => {
    return safeFetch('/pdf/upload', {
      method: 'POST',
      body: formData, // FormData ke sath Content-Type header manually nahi lagate
    });
  },

  generateQuestions: async (documentId) => {
    return safeFetch('/ai/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId }),
    });
  }
};
