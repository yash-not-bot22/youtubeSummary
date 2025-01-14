import { nhost } from '../lib/nhost';

export async function fetchN8nData(video_id: string): Promise<any> {
  try {
    // Ensure the user is authenticated and refresh token if expired
    const session = await nhost.auth.getSession();
    if (!session) {
      throw new Error('User is not authenticated');
    }

    const token = session.accessToken; // This ensures you have a fresh token
    const response = await fetch(
      'https://jodjwamdtsdokxwwmdbi.hasura.ap-south-1.nhost.run/v1/graphql',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation SummarizeVideo($video_id: String!) {
              summarizeVideo(video_id: $video_id) {
                success
                summary
                error
              }
            }
          `,
          variables: {
            video_id,
          },
        }),
      }
    );

    const res = await response.json();
    const result = res.data.summarizeVideo;

    if (result.success==false) {
      throw new Error(
        result.error ? JSON.stringify(result.error) : 'Unknown error occurred'
      );
    }

    return result;
  } catch (error) {
    console.error('Error while connecting to Hasura:', error);
    throw new Error('Failed to connect to Hasura');
  }
}
