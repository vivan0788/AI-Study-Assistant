const API_BASE_URL = "https://ai-study-assistant-m4m7.onrender.com/api/"; // Render Endpoint after backend deploy

const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("auth_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Internal Server Request Error");
    return data;
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err.message);
    throw err;
  }
};
