// frontend/js/api.js
const BASE_URL = 'https://ai-study-assistant-m4m7.onrender.com/api';

async function safeFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  console.log(`[API Request] Method: ${options.method || 'GET'} | URL: ${url}`);

  try {
    const response = await fetch(url, options);
    console.log(`[API Response Status] Code: ${response.status} ${response.statusText}`);

    const rawBody = await response.text();
    console.log(`[API Response Body]:`, rawBody);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${rawBody || response.statusText}`);
    }

    if (rawBody.trim().startsWith('<!DOCTYPE') || rawBody.trim().startsWith('<html')) {
      throw new Error("Server returned HTML markup instead of valid JSON data.");
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

  // FIX: Bheje jaane wale JSON body mein backend ke saare possible name configurations targets inject kar diye hain
  register: async (username, email, password) => {
    const payload = {
      username: username,
      name: username,      // Kuch backend architectures 'name' field expect karte hain
      email: email,
      password: password
    };
    
    console.log("[Register Payload Debug]:", payload);

    return safeFetch('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  uploadPDF: async (formData) => {
    return safeFetch('/pdf/upload', {
      method: 'POST',
      body: formData,
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
