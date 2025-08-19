import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { AppContext } from '../../App';
import QuoteCard from '../QuoteCard';
import { Quote, Mood, JournalEntry } from '../../types';
import { MOODS, QUOTE_CATEGORIES } from '../../constants';
import { generateQuote } from '../../services/geminiService';

const HomeScreen: React.FC = () => {
    const context = useContext(AppContext);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [journalText, setJournalText] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood | null>(MOODS[0]);
    
    const isFetchingRef = useRef(false);

    const fetchMoreQuotes = useCallback(async (count = 1, isRetry = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setIsLoading(true);
        if (isRetry) {
            setError(null);
        }
        try {
            const categories = context?.favoriteCategories?.length ? context.favoriteCategories : QUOTE_CATEGORIES;
            const newQuotesPromises = Array.from({ length: count }).map(() => {
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                return generateQuote(randomCategory);
            });
            const newQuotes = await Promise.all(newQuotesPromises);
            const validQuotes = newQuotes.filter(Boolean) as Quote[];
            if (validQuotes.length > 0) {
                 setQuotes(prev => [...prev, ...validQuotes]);
            } else if (quotes.length === 0) {
                 setError("Could not fetch quotes. Please try again.");
            }
        } catch (err) {
            console.error("Failed to fetch more quotes for home screen:", err);
            setError("Something went wrong. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [context?.favoriteCategories, quotes.length]);

    useEffect(() => {
        const initialFetch = async () => {
            if (quotes.length === 0) {
                await fetchMoreQuotes(3);
            }
        };
        initialFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSaveJournal = () => {
        if (journalText.trim() && selectedMood) {
            const newEntry: JournalEntry = {
                id: `journal-${Date.now()}`,
                content: journalText,
                mood: selectedMood,
                date: new Date().toISOString(),
            };
            context?.setJournalEntries(prev => [newEntry, ...prev]);
            setJournalText('');
            setSelectedMood(MOODS[0]);
            alert('Journal entry saved!');
        }
    };
    
    const Loader = () => (
        <div className="flex flex-col justify-center items-center py-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="text-gray-400 mt-3">Finding inspiration for you...</p>
        </div>
    );
    
    const ErrorDisplay = () => (
         <div className="text-center py-6">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
                onClick={() => fetchMoreQuotes(1, true)} 
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                Retry
            </button>
        </div>
    );
    
    return (
        <div>
            {/* Habits & Journal now appear BEFORE the infinite scroll feed */}
            <div className="p-4 space-y-8">
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-300">Today's Habits</h2>
                        <button onClick={() => context?.setActiveScreen('habits')} className="text-sm text-cyan-400 hover:text-cyan-300">View All</button>
                    </div>
                    <div className="space-y-3">
                        {context?.habits.slice(0, 3).map(habit => (
                            <div key={habit.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-4">{habit.icon}</span>
                                    <div>
                                        <p className="font-medium text-white">{habit.name}</p>
                                        <p className="text-xs text-gray-400">Streak: {habit.streak} days</p>
                                    </div>
                                </div>
                                <button onClick={() => context?.setActiveScreen('habits')} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${habit.completed ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500'}`}>
                                    {habit.completed && <span className="text-white">✓</span>}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
                
                <section>
                    <h2 className="text-lg font-semibold text-gray-300 mb-4">Today's Journal</h2>
                    <div className="bg-gray-800 p-4 rounded-lg space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">How are you feeling?</label>
                            <div className="flex space-x-2">
                                {MOODS.map(mood => (
                                    <button key={mood.name} onClick={() => setSelectedMood(mood)} className={`p-2 rounded-full text-2xl transition-transform transform ${selectedMood?.name === mood.name ? 'scale-125 bg-cyan-500/20' : ''}`}>
                                        {mood.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea 
                            value={journalText}
                            onChange={(e) => setJournalText(e.target.value)}
                            placeholder="What did you learn today?" 
                            className="w-full h-24 bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                        <button onClick={handleSaveJournal} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Save Entry
                        </button>
                    </div>
                </section>
            </div>
            
            {/* Infinite Scroll for quotes */}
            <div className="px-4">
                <h2 className="text-lg font-semibold text-gray-300">For You</h2>
            </div>
            <InfiniteScroll
                dataLength={quotes.length}
                next={() => fetchMoreQuotes(1)}
                hasMore={true}
                loader={error ? <ErrorDisplay /> : <Loader />}
                scrollableTarget="main-content"
                className="space-y-8 p-4"
            >
                {quotes.map((quote) => (
                    <QuoteCard key={quote.id} quote={quote} />
                ))}
            </InfiniteScroll>
        </div>
    );
};

export default HomeScreen;