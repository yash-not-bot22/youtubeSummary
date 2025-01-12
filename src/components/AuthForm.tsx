import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { nhost } from '../lib/nhost';
import { useSignOut} from '@nhost/react';

type AuthMode = 'login' | 'signup';

export function AuthForm() {
  const { signOut } = useSignOut();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    
  };



function clearAllSiteData() {
  // Clear Local Storage
  localStorage.clear();

  // Clear Session Storage
  sessionStorage.clear();

  // Clear Cookies
  document.cookie.split(";").forEach((cookie) => {
    const [name] = cookie.split("=");
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  });

  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }


  

  // (Optional) Reload the Page
}

function wait() {
  return new Promise((resolve) => setTimeout(resolve, 500));
}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);



    try {
      if (mode === 'login') {


        
        
        const isAuthenticated2  = await nhost.auth.isAuthenticatedAsync();


        if(isAuthenticated2){
            handleLogout();
            clearAllSiteData();
            
          await wait();
            
            
          
        }

        // Handle login
        const { error } = await nhost.auth.signIn({
          email,
          password,
        });
        if (error) throw new Error(error.message);

        const token =  nhost.auth.getAccessToken();
        if (token) {
          localStorage.setItem('accessToken', token);
        }

        const isAuthenticated = await nhost.auth.isAuthenticatedAsync();
        if (isAuthenticated && token) {
          toast.success('Logged in successfully!');
          navigate('/home'); // Navigate to home only for login
        }
      } else {
        // Handle signup

        const isAuthenticated2  = await nhost.auth.isAuthenticatedAsync();
        if(isAuthenticated2)
        {
          handleLogout();
            clearAllSiteData();
            
          await wait();
        }
        const { error } = await nhost.auth.signUp({
          email,
          password,
        });

        
        clearAllSiteData();
        if (error) throw new Error(error.message);

        toast.success('Signup successful! Please verify your email to login.');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                  aria-label="Email"
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                  aria-label="Password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mx-auto" />
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              {mode === 'login'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
