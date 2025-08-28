

import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppContext } from '../../App';
import QuoteCard from '../QuoteCard';
import { Quote, Mood, JournalEntry } from '../../types';
import { MOODS, QUOTE_CATEGORIES } from '../../constants';
import { generateQuotes } from '../../services/geminiService';

const HomeScreen: React.FC = () => {
    const context = useContext(AppContext);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    const [journalText, setJournalText] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood | null>(MOODS[0]);
    
    const sliderRef = useRef<HTMLDivElement>(null);

    const fetchQuotes = useCallback(async (count = 20) => {
        setIsLoading(true);
        setError(null);
        try {
            const categories = context?.favoriteCategories?.length ? context.favoriteCategories : QUOTE_CATEGORIES;
            const randomCategory = categories[Math.floor(Math.random() * categories.length)];
            const newQuotes = await generateQuotes(randomCategory, count);
            const validQuotes = newQuotes.filter(Boolean) as Quote[];
            
            if (validQuotes.length > 0) {
                setQuotes(validQuotes);
                setCurrentQuoteIndex(0);
                if (sliderRef.current) sliderRef.current.scrollTo({ left: 0 });
            } else {
                 setError("Could not fetch quotes. Please try again.");
            }
        } catch (err) {
            console.error("Failed to fetch quotes for home screen:", err);
            setError("Something went wrong. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    }, [context?.favoriteCategories]);
    
    // Initial fetch on mount (fulfills refresh on app open)
    useEffect(() => {
        fetchQuotes();
    }, [fetchQuotes]);

    const handleSaveJournal = () => {
        if (journalText.trim() && selectedMood) {
            // FIX: Property 'setJournalEntries' does not exist on type 'AppContextType'. Use `addJournalEntry` instead.
            context?.addJournalEntry({
                content: journalText,
                mood: selectedMood,
            });
            setJournalText('');
            setSelectedMood(MOODS[0]);
            alert('Journal entry saved!');
        }
    };
    
    const handleScroll = () => {
        if (sliderRef.current) {
            const cardWidth = sliderRef.current.offsetWidth;
            if (cardWidth === 0) return;
            const scrollLeft = sliderRef.current.scrollLeft;
            const newIndex = Math.round(scrollLeft / cardWidth);
            if (newIndex !== currentQuoteIndex) {
                setCurrentQuoteIndex(newIndex);
            }
        }
    };
    
    const Loader = () => (
        <div className="flex flex-col justify-center items-center py-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            <p className="text-gray-400 mt-3">Finding inspiration...</p>
        </div>
    );
    
    const ErrorDisplay = () => (
         <div className="text-center py-6 p-4">
            <p className="text-red-400 mb-4">{error}</p>
            <button 
                onClick={() => fetchQuotes()} 
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
                Retry
            </button>
        </div>
    );
    
    if (error && quotes.length === 0) {
        return <ErrorDisplay />;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div>
            {/* Quote Slider */}
            {isLoading && quotes.length === 0 ? (
                <div className="w-full aspect-square flex justify-center items-center">
                    <Loader />
                </div>
            ) : (
                <section className="pt-4">
                    <div
                        ref={sliderRef}
                        onScroll={handleScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
                    >
                        {quotes.map((quote) => (
                            <div key={quote.id} className="w-full flex-shrink-0 snap-center px-4">
                                <QuoteCard quote={quote} />
                            </div>
                        ))}
                    </div>
                    {quotes.length > 1 && (
                        <div className="flex justify-center items-center space-x-2 pt-4">
                            {quotes.slice(0, 6).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (sliderRef.current) {
                                            const cardWidth = sliderRef.current.offsetWidth;
                                            sliderRef.current.scrollTo({ left: index * cardWidth, behavior: 'smooth' });
                                        }
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${currentQuoteIndex === index ? 'bg-cyan-400 w-4' : 'bg-gray-600'}`}
                                    aria-label={`Go to quote ${index + 1}`}
                                ></button>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Habits & Journal sections */}
            <div className="p-4 space-y-8 mt-4">
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-300">Today's Habits</h2>
                        <button onClick={() => context?.setActiveScreen('habits')} className="text-sm text-cyan-400 hover:text-cyan-300">View All</button>
                    </div>
                    <div className="space-y-3">
                        {context?.habits.slice(0, 3).map(habit => {
                            const isCompletedToday = habit.completedDates.includes(todayStr);
                            return (
                                <div key={habit.id} className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-4">{habit.icon}</span>
                                        <div>
                                            <p className="font-medium text-white">{habit.name}</p>
                                            <p className="text-xs text-gray-400">Streak: {habit.streak} days</p>
                                        </div>
                                    </div>
                                    <button onClick={() => context?.setActiveScreen('habits')} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isCompletedToday ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500'}`}>
                                        {isCompletedToday && <span className="text-white">✓</span>}
                                    </button>
                                </div>
                            );
                        })}
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
        </div>
    );
};

export default HomeScreen;