import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../App';
import QuoteCard from '../QuoteCard';

const ProfileScreen: React.FC = () => {
    const context = useContext(AppContext);

    if (!context) return null;
    
    const { user, savedQuotes, likedQuotes, habits, resetData } = context;
    
    const longestStreak = useMemo(() => {
        return habits.reduce((max, habit) => habit.streak > max ? habit.streak : max, 0);
    }, [habits]);

    return (
        <div className="p-4 space-y-8">
            {/* Profile Header */}
            <section className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center font-bold text-gray-900 text-5xl mb-4">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-white capitalize">{user?.name}</h2>
                <p className="text-gray-400">{user?.email}</p>
            </section>

            {/* Achievements */}
            <section>
                 <h3 className="text-lg font-semibold text-gray-300 mb-4">Achievements</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-cyan-400">{longestStreak}</p>
                        <p className="text-sm text-gray-400">Longest Streak</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <p className="text-3xl font-bold text-cyan-400">{savedQuotes.length}</p>
                        <p className="text-sm text-gray-400">Quotes Saved</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg col-span-2 md:col-span-1">
                        <p className="text-3xl font-bold text-cyan-400">{likedQuotes.length}</p>
                        <p className="text-sm text-gray-400">Quotes Liked</p>
                    </div>
                 </div>
            </section>
            
            {/* Settings */}
            <section>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Settings</h3>
                <div className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                        <label htmlFor="language" className="text-gray-300">Language</label>
                        <select id="language" className="bg-gray-700 text-white p-2 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Urdu</option>
                            <option>Tamil</option>
                        </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Language selection is for display purposes. Quote language support is coming soon.</p>
                </div>
            </section>

            {/* Reset Data Button */}
            <section>
                 <button 
                    onClick={resetData} 
                    className="w-full bg-red-600/80 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
                >
                    Logout & Reset Data
                </button>
            </section>

            {/* Saved Quotes */}
            <section>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Saved Quotes</h3>
                {savedQuotes.length > 0 ? (
                    <div className="space-y-4">
                        {savedQuotes.map(quote => (
                            <QuoteCard key={quote.id} quote={quote} isInteractive={true} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-400">You haven't saved any quotes yet.</p>
                )}
            </section>

            {/* Liked Quotes */}
            <section>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Liked Quotes</h3>
                {likedQuotes.length > 0 ? (
                    <div className="space-y-4">
                        {likedQuotes.map(quote => (
                            <QuoteCard key={quote.id} quote={quote} isInteractive={true} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-400">You haven't liked any quotes yet.</p>
                )}
            </section>
        </div>
    );
};

export default ProfileScreen;