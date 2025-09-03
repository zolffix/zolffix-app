import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';

const LoginScreen: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const context = useContext(AppContext);

    // Login state
    const [email, setEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup state
    const [name, setName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !loginPassword) {
            setError('Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        context?.login(email, loginPassword);
    };
    
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !signupEmail || !signupPassword) {
            setError('Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        context?.signup(name, signupEmail);
    };

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setError('');
    };

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen font-sans flex flex-col items-center justify-center p-4 max-w-lg mx-auto">
            <div className="w-full text-center">
                <h1 className="text-5xl font-bold text-cyan-400 mb-2 font-serif">Zolffix</h1>
                <p className="text-gray-400 mb-10">{isLoginView ? 'Welcome back to your journey.' : 'Start your journey today.'}</p>
                
                {isLoginView ? (
                    <form onSubmit={handleLogin} className="space-y-5">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            aria-label="Email"
                        />
                        <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            aria-label="Password"
                        />
                        <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors text-lg disabled:bg-gray-700 disabled:cursor-not-allowed">
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSignup} className="space-y-5">
                         <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            aria-label="Full Name"
                        />
                        <input
                            type="email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            aria-label="Email"
                        />
                        <input
                            type="password"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-gray-800 text-white p-4 rounded-lg border border-gray-700 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            aria-label="Password"
                        />
                        <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors text-lg disabled:bg-gray-700 disabled:cursor-not-allowed">
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>
                )}
                
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                
                <button onClick={toggleView} className="mt-6 text-cyan-400 hover:text-cyan-300 text-sm">
                    {isLoginView ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            </div>
        </div>
    );
};

export default LoginScreen;