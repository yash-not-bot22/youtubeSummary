import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Youtube, Send, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSignOut, useUserId } from '@nhost/react';
import { fetchN8nData } from '../lib/api';
import toast from 'react-hot-toast';
import { nhost } from '../lib/nhost';

interface VideoSummary {
  id: string;
  video_id: string;
  summary: string;
  created_at: string;
}

function extractYouTubeVideoId(url: string): string | null {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|embed|e)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  return url.match(regex)?.[1] || null;
}

export function HomePage() {
  const [youtubeLink, setYoutubeLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [history, setHistory] = useState<VideoSummary[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [reload, setreload] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useSignOut();
  const userId = useUserId();

  
  const validateSession = async () => {
    const token = localStorage.getItem('accessToken');
    const isAuthenticated = await nhost.auth.isAuthenticatedAsync();

    // Check if user is verified

    if (token && isAuthenticated) {
      
      setIsVerified(true);
      
    }
  };

  useEffect(() => {
    if(isVerified){
      navigate('/home');
      setreload(true);
    }
   
  }, [isVerified]);

  useEffect(() => {
    if(isVerified)
    {
      navigate('/home');
    }
    
  }, []);

  useEffect(() => {
    if(reload){
      fetchHistory();
    }
  }, [reload]);

 

  useEffect(() => {
    validateSession();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Access token not found');
  
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
              query {
                video_summaries(where: { user_id: { _eq: "${userId}" } }, order_by: { created_at: desc }) {
                  id
                  video_id
                  summary
                  created_at
                }
              }
            `,
          }),
        }
      );
  
      const { data } = await response.json();
      if (data?.video_summaries) {
        setHistory(data.video_summaries);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Could not load history');
      setHistory([]);
    }
  };

  function wait() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSummary('');

    try {
      const videoId = extractYouTubeVideoId(youtubeLink);
      if (!videoId) throw new Error('Invalid YouTube URL');

      const n8nResponse = await fetchN8nData(youtubeLink);

      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Access token not found');

      await fetch('https://jodjwamdtsdokxwwmdbi.hasura.ap-south-1.nhost.run/v1/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation {
              insert_video_summaries_one(object: { user_id: "${userId}", video_id: "${videoId}", summary: ${JSON.stringify(
                n8nResponse.summary
              )} }) {
                id
              }
            }
          `,
        }),
      });

      setHistory((prev) => [
        { id: crypto.randomUUID(), video_id: videoId, summary: n8nResponse.summary, created_at: new Date().toISOString() },
        ...prev,
      ]);

      setSummary(n8nResponse.summary);
      toast.success('YouTube link processed successfully!');
      setYoutubeLink('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to process link');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
   
    localStorage.setItem('accessToken','');
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-white rounded-lg shadow-md p-4 mr-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          { 'History' }
        </h2>
        {(
          <ul className="space-y-4">
            {history.map((item) => (
              <li
                key={item.id}
                className="cursor-pointer p-2 border rounded-lg hover:bg-gray-100"
                onClick={() => setSummary(item.summary)}
              >
                <p className="font-medium text-sm text-gray-700 truncate">
                  {(item.summary ?? '').split('\n')[0] || item.video_id}
                </p>
                <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Main Content */}
      <div className="w-3/4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              {
                 'YouTube Video Summary'
                 }
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>

          {(
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="youtubeLink">
                  YouTube Link
                </label>
                <div className="relative">
                  <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="youtubeLink"
                    type="url"
                    value={youtubeLink}
                    onChange={(e) => setYoutubeLink(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                    title="Please enter a valid YouTube video URL"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Processing...' : <><Send className="h-5 w-5" /> Process Link</>}
              </button>
            </form>
          )}

          {summary && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Summary for your YouTube video</h2>
              <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
