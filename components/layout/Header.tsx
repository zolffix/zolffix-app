import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../App';
import { Screen } from '../../types';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const notifications = [
    { id: 1, text: "You've hit a 10-day streak on 'Morning Walk'!", time: "2h ago" },
    { id: 2, text: "New 'Motivation' quotes are available.", time: "1d ago" },
    { id: 3, text: "Reminder: Time for your evening journal.", time: "5h ago" },
];

const RefreshIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M21 21v-5h-5"></path></svg>
);

const FullscreenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
);

const screenTitles: { [key in Screen]: string } = {
    home: 'Home',
    quotes: 'Zolffix',
    habits: 'My Habits',
    journal: 'My Journal',
    profile: 'Profile'
};

const Header: React.FC = () => {
    const [greeting, setGreeting] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const context = useContext(AppContext);

    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    if (!context) return null;
    const { user, setActiveScreen, activeScreen, refreshQuotes } = context;

    const handleProfileClick = () => {
        setActiveScreen('profile');
    };
    
    const Title = () => {
        if (activeScreen === 'home') {
            return (
                <div>
                    <h1 className="text-xl font-bold text-white capitalize">{greeting}, {user?.name?.split(' ')[0]}</h1>
                    <p className="text-sm text-gray-400">Ready to conquer the day?</p>
                </div>
            );
        }
        if (activeScreen === 'quotes') {
            return <h1 className="text-2xl font-bold text-white font-serif">Zolffix</h1>;
        }
        return <h1 className="text-xl font-bold text-white">{screenTitles[activeScreen]}</h1>;
    };

    const Actions = () => {
        if (activeScreen === 'quotes') {
            return (
                 <div className="flex items-center space-x-4">
                    <button onClick={refreshQuotes} className="text-gray-400 hover:text-white transition-colors"><RefreshIcon /></button>
                    <button onClick={() => alert('Fullscreen mode coming soon!')} className="text-gray-400 hover:text-white transition-colors"><FullscreenIcon /></button>
                </div>
            );
        }
        return (
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="text-gray-400 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>
                    </button>
                    {showNotifications && (
                         <div className="absolute right-0 mt-2 w-72 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                            <div className="p-3 border-b border-gray-700">
                                <h4 className="font-semibold text-white">Notifications</h4>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <div key={notif.id} className="p-3 border-b border-gray-700/50 hover:bg-gray-700/50 cursor-pointer">
                                            <p className="text-sm text-gray-200">{notif.text}</p>
                                            <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                        </div>
                                    ))
                                ) : (
                                     <div className="p-4 text-center">
                                        <p className="text-white">No new notifications</p>
                                        <p className="text-xs text-gray-400 mt-1">Check back later for updates!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <button onClick={handleProfileClick} className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center font-bold text-gray-900 text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                </button>
            </div>
        );
    };

    return (
        <header className="bg-gray-900 fixed top-0 left-0 right-0 max-w-lg mx-auto z-40 p-4 flex justify-between items-center border-b border-gray-800 h-20">
            <Title />
            <Actions />
        </header>
    );
};

export default Header;