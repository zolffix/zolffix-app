
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import QuoteCard from '../QuoteCard';
import { Quote, Mood, JournalEntry } from '../../types';
import { MOODS } from '../../constants';

const HomeScreen: React.FC = () => {
    const context = useContext(AppContext);
    const [featuredQuotes, setFeaturedQuotes] = useState<Quote[]>([]);
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    const [journalText, setJournalText] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood | null>(MOODS[0]);

    useEffect(() => {
        // Mock fetching most liked/saved quotes
        setFeaturedQuotes([
            { id: 'feat-1', text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', category: 'Motivation', imageUrl: 'https://picsum.photos/seed/home1/1080/1080' },
            { id: 'feat-2', text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'Success', imageUrl: 'https://picsum.photos/seed/home2/1080/1080' },
            { id: 'feat-3', text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt', category: 'Confidence', imageUrl: 'https://picsum.photos/seed/home3/1080/1080' },
        ]);
    }, []);

    const handleSwipe = (direction: 'left' | 'right') => {
        if (direction === 'right') {
            setCurrentQuoteIndex((prev) => (prev + 1) % featuredQuotes.length);
        } else {
            setCurrentQuoteIndex((prev) => (prev - 1 + featuredQuotes.length) % featuredQuotes.length);
        }
    };
    
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

    return (
        <div className="p-4 space-y-8">
            {/* Quote Carousel */}
            <section>
                <h2 className="text-lg font-semibold text-gray-300 mb-4">Featured Quotes</h2>
                <div className="relative">
                    {featuredQuotes.length > 0 && (
                        <QuoteCard quote={featuredQuotes[currentQuoteIndex]} />
                    )}
                    <button onClick={() => handleSwipe('left')} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white z-30">‹</button>
                    <button onClick={() => handleSwipe('right')} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full text-white z-30">›</button>
                </div>
            </section>
            
            {/* Today's Habits */}
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
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${habit.completed ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500'}`}>
                                {habit.completed && <span className="text-white">✓</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
            
            {/* Today's Journal */}
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
    );
};

export default HomeScreen;
