import React, { useContext, useState } from 'react';
import { AppContext } from '../../App';
import { JournalEntry, Mood } from '../../types';
import { MOODS } from '../../constants';

const AddJournalEntryForm: React.FC<{ onAdd: (entry: Omit<JournalEntry, 'id' | 'date'>) => void; onCancel: () => void }> = ({ onAdd, onCancel }) => {
    const [journalText, setJournalText] = useState('');
    const [selectedMood, setSelectedMood] = useState<Mood>(MOODS[0]);

    const handleSave = () => {
        if (journalText.trim() && selectedMood) {
            onAdd({
                content: journalText,
                mood: selectedMood,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">New Journal Entry</h3>
                <div className="space-y-4">
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
                        placeholder="What's on your mind?" 
                        className="w-full h-32 bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                     <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancel</button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500">Save Entry</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const JournalScreen: React.FC = () => {
    const context = useContext(AppContext);
    const [isAdding, setIsAdding] = useState(false);

    if (!context) return null;

    const { journalEntries, setJournalEntries } = context;
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this journal entry?')) {
            setJournalEntries(prev => prev.filter(entry => entry.id !== id));
        }
    };

    const handleAddEntry = (newEntryData: Omit<JournalEntry, 'id' | 'date'>) => {
        const newEntry: JournalEntry = {
            id: `journal-${Date.now()}`,
            date: new Date().toISOString(),
            ...newEntryData
        };
        setJournalEntries(prev => [newEntry, ...prev]);
        setIsAdding(false);
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold text-white mb-6">My Journal</h2>
            <div className="space-y-4">
                {journalEntries.length > 0 ? (
                    journalEntries.map(entry => (
                        <div key={entry.id} className="bg-gray-800 p-4 rounded-lg relative group">
                            <div className="absolute top-2 right-2 flex items-center space-x-2">
                                <span className="text-2xl">{entry.mood.emoji}</span>
                                <button onClick={() => handleDelete(entry.id)} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                </button>
                            </div>
                            <p className="text-gray-300 whitespace-pre-wrap">{entry.content}</p>
                            <p className="text-xs text-gray-500 mt-3 text-right">
                                {new Date(entry.date).toLocaleString()}
                            </p>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 mt-8">
                        <p>Your journal is empty.</p>
                        <p>Press the '+' button to add your first entry.</p>
                    </div>
                )}
            </div>
            
            <button
                onClick={() => setIsAdding(true)}
                className="fixed bottom-24 right-5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg z-20"
                aria-label="Add new journal entry"
            >
                +
            </button>
            {isAdding && <AddJournalEntryForm onAdd={handleAddEntry} onCancel={() => setIsAdding(false)} />}
        </div>
    );
};

export default JournalScreen;