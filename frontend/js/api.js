const API_BASE_URL = "https://ai-study-assistant-m4m7.onrender.com"; 

const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem("auth_token");
    const headers = {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
        ...options.headers
    };

    // Clean structural pathing logic
    let cleanEndpoint = endpoint.trim();
    
    // Agar endpoint ke start mein /api/ hai, toh use safe clean karein taaki duplicate na ho
    if (cleanEndpoint.startsWith('/api')) {
        cleanEndpoint = cleanEndpoint.replace('/api', '');
    } else if (cleanEndpoint.startsWith('api')) {
        cleanEndpoint = cleanEndpoint.replace('api', '');
    }

    // Force secure routing format: /api/ + endpoint without extra slashes
    if (!cleanEndpoint.startsWith('/')) {
        cleanEndpoint = `/${cleanEndpoint}`;
    }
    
    const fullUrl = `${API_BASE_URL}/api${cleanEndpoint}`;

    try {
        const res = await fetch(fullUrl, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data;
    } catch (err) {
        console.error("API Fetch Target Error:", fullUrl, err.message);
        throw err;
    }
};
