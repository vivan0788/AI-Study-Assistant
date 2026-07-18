const API_BASE_URL = "https://ai-study-assistant-m4m7.onrender.com"; 

const apiCall = async (endpoint, options = {}) => {
    const token = localStorage.getItem("auth_token");
    const headers = {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
        ...options.headers
    };

    // Slash parameters clean up
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullUrl = `${API_BASE_URL}${cleanEndpoint}`;

    try {
        const res = await fetch(fullUrl, { ...options, headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Internal Server Error");
        return data;
    } catch (err) {
        console.error("Fetch failed path:", fullUrl, err.message);
        throw err;
    }
};
