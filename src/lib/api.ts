





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