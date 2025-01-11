// API endpoints (to be configured)
const API_URL = '';

interface AuthResponse {
  token?: string;
  error?: string;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    return await response.json();
  } catch (error) {
    return { error: 'Failed to connect to server' };
  }
}

export async function signupUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    return await response.json();
  } catch (error) {
    return { error: 'Failed to connect to server' };
  }
}


export async function fetchN8nData(data: any): Promise<any> {
  try {
    const response = await fetch(`https://yashbaghelaai.app.n8n.cloud/webhook/ytube`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
       
      },
      body: JSON.stringify(data),
    });
    
    return await response.json();
  } catch (error) {
    throw new Error('Failed to connect to n8n server');
  }
}