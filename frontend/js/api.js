const API_BASE_URL = "https://ai-study-assistant-m4m7.onrender.com"; 

const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem("auth_token");
    const headers = {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
        ...options.headers
    };

    // Ensure endpoint starts with /
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Agar endpoint me pehle se '/api' nahi hai, to add karein
    if (!cleanEndpoint.startsWith('/api')) {
        cleanEndpoint = `/api${cleanEndpoint}`;
    }

    const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;

    try {
        const res = await fetch(fullUrl, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Something went wrong");
        return data;
    } catch (err) {
        console.error("Fetch failed for:", fullUrl, err.message);
        throw err;
    }
};
