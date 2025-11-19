/**
 * API Configuration
 * Uses Vite environment variables set at build time
 */

// Get API URL from Vite environment variables
// During build, VITE_API_URL is set as build argument in docker-compose.yml
const getAPIBaseURL = (): string => {
  // Priority:
  // 1. Vite environment variable (set during build)
  // 2. Fallback to external API domain
  const apiUrl = import.meta.env.VITE_API_URL || 'http://api-tabungan.muzakie.my.id';
  
  console.log('[API Config] Using base URL:', apiUrl);
  
  return apiUrl;
};

export const API_BASE_URL = getAPIBaseURL();
export const API_URL = `${API_BASE_URL}/api`;

// Debug: Log configuration on load
if (import.meta.env.DEV) {
  console.log('[API Config] Development mode');
  console.log('[API Config] VITE_API_URL:', import.meta.env.VITE_API_URL);
}

export default {
  baseURL: API_BASE_URL,
  apiURL: API_URL,
};
