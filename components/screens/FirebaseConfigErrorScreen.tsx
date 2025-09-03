import React from 'react';

const FirebaseConfigErrorScreen: React.FC = () => {
    const codeSnippet = `
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};`;

    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen font-sans flex flex-col items-center justify-center p-4 max-w-lg mx-auto">
            <div className="w-full bg-gray-800 border border-red-500/50 rounded-lg p-6 shadow-lg">
                <div className="flex items-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 mr-3 flex-shrink-0"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <h1 className="text-2xl font-bold text-red-400">Firebase Configuration Needed</h1>
                </div>
                <p className="text-gray-300 mb-4">
                    The app cannot connect to Firebase because the configuration is missing or incorrect.
                    You must add your personal Firebase project keys to continue.
                </p>

                <h2 className="text-lg font-semibold text-cyan-400 mt-6 mb-2">How to Fix This:</h2>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                    <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">Firebase Console</a> and select your project.</li>
                    <li>In the project menu, click the gear icon for <strong>Project settings</strong>.</li>
                    <li>Under the "General" tab, scroll down to the "Your apps" section.</li>
                    <li>Find your web app (or create one) and copy the <code className="bg-gray-700 px-1 rounded">firebaseConfig</code> object.</li>
                    <li>Open the file <code className="bg-gray-700 text-yellow-300 px-2 py-1 rounded-md text-sm">firebaseConfig.ts</code> in this project.</li>
                    <li>Replace the placeholder content with the config object you copied.</li>
                </ol>

                <div className="mt-6">
                    <p className="text-sm text-gray-400 mb-2">Your <code className="bg-gray-700 px-1 rounded">firebaseConfig.ts</code> should look like this (with your real values):</p>
                    <pre className="bg-gray-900 p-4 rounded-md text-sm text-yellow-300 overflow-x-auto">
                        <code>
                            {codeSnippet.trim()}
                        </code>
                    </pre>
                </div>
                
                <p className="text-gray-400 mt-6 text-sm">
                    After you save the file with your credentials, the app will automatically reload and work correctly.
                </p>
            </div>
        </div>
    );
};

export default FirebaseConfigErrorScreen;
