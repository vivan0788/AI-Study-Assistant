// frontend/js/api.js
const BASE_URL = 'https://ai-study-assistant-m4m7.onrender.com/api';

async function safeFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  console.log(`[API Request] Method: ${options.method || 'GET'} | URL: ${url}`);

  try {
    const response = await fetch(url, options);
    console.log(`[API Response Status] Code: ${response.status} ${response.statusText}`);

    // Read response as text first to prevent JSON parse crashes on HTML errors
    const rawBody = await response.text();
    console.log(`[API Response Body]:`, rawBody);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${rawBody || response.statusText}`);
    }

    // Check if the server mistakenly sent an HTML error page instead of JSON
    if (rawBody.trim().startsWith('<!DOCTYPE') || rawBody.trim().startsWith('<html')) {
      throw new Error("Server returned HTML markup instead of valid JSON data. Check your API configuration.");
    }

    return JSON.parse(rawBody);
  } catch (error) {
    console.error(`[API Error Log] Failed during request to ${url}:`, error);
    throw error;
  }
}

// Global scope initialization
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

  // Hits correctly: https://ai-study-assistant-m4m7.onrender.com/api/pdf/upload
  uploadPDF: async (formData) => {
    return safeFetch('/pdf/upload', {
      method: 'POST',
      body: formData, // Browser sets the multipart content-type boundary automatically
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
