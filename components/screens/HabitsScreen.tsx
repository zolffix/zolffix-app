import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../App';
import { Habit } from '../../types';

const formatTime = (time24: string | undefined): string => {
    if (!time24) return '';
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour}:${minute} ${ampm}`;
};

const HabitForm: React.FC<{ onSave: (habit: Habit) => void; onCancel: () => void; habitToEdit: Habit | null }> = ({ onSave, onCancel, habitToEdit }) => {
    const [name, setName] = useState('');
    const [icon, setIcon] = useState('💪');
    const [reminderTime, setReminderTime] = useState('');
    const popularIcons = ['💪', '💧', '📚', '🚶‍♂️', '🧘', '🍎', '☀️', '✏️', '❤️', '😊', '⭐', '🏆'];
    
    useEffect(() => {
        if (habitToEdit) {
            setName(habitToEdit.name);
            setIcon(habitToEdit.icon);
            setReminderTime(habitToEdit.reminderTime || '');
        }
    }, [habitToEdit]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onSave({
                ...habitToEdit,
                id: habitToEdit ? habitToEdit.id : `habit-${Date.now()}`,
                name: name.trim(),
                icon,
                completed: habitToEdit ? habitToEdit.completed : false,
                streak: habitToEdit ? habitToEdit.streak : 0,
                reminderTime: reminderTime || undefined,
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">{habitToEdit ? 'Edit Habit' : 'Add New Habit'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Habit name (e.g., Meditate)"
                        className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        required
                    />
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Choose an icon</label>
                        <div className="flex flex-wrap gap-2">
                            {popularIcons.map(i => (
                                <button type="button" key={i} onClick={() => setIcon(i)} className={`p-2 text-2xl rounded-full transition-transform transform ${icon === i ? 'bg-cyan-500/30 scale-110' : 'bg-gray-700'}`}>{i}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="reminder" className="text-sm text-gray-400 mb-2 block">Set a daily reminder (optional)</label>
                        <div className="flex items-center">
                            <input
                                id="reminder"
                                type="time"
                                value={reminderTime}
                                onChange={(e) => setReminderTime(e.target.value)}
                                className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                            />
                            {reminderTime && (
                                <button type="button" onClick={() => setReminderTime('')} className="ml-2 text-gray-400 hover:text-white p-2 rounded-full" aria-label="Clear reminder time">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-cyan-600 rounded-lg hover:bg-cyan-500">{habitToEdit ? 'Save Changes' : 'Add Habit'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const HabitItem: React.FC<{ habit: Habit; onToggle: (id: string) => void; onEdit: (habit: Habit) => void; onDelete: (id: string) => void }> = ({ habit, onToggle, onEdit, onDelete }) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between transition-all hover:bg-gray-700/80">
            <div className="flex items-center">
                <span className="text-3xl mr-4">{habit.icon}</span>
                <div>
                    <p className="font-medium text-white">{habit.name}</p>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span>Streak: {habit.streak} days</span>
                        {habit.reminderTime && (
                            <div className="flex items-center text-cyan-400/80">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                <span className="ml-1">{formatTime(habit.reminderTime)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <button onClick={() => onEdit(habit)} className="text-gray-500 hover:text-cyan-400 p-1" aria-label={`Edit ${habit.name} habit`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button onClick={() => onDelete(habit.id)} className="text-gray-500 hover:text-red-500 p-1" aria-label={`Delete ${habit.name} habit`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
                 <button onClick={() => onToggle(habit.id)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-transform transform active:scale-90 ${habit.completed ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500 hover:border-cyan-400'}`} aria-label={`Mark ${habit.name} as ${habit.completed ? 'incomplete' : 'complete'}`}>
                    {habit.completed && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </button>
            </div>
        </div>
    );
};

const HabitsScreen: React.FC = () => {
    const context = useContext(AppContext);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    if (!context) return null;
    
    const { habits, setHabits } = context;

    const handleToggleHabit = (id: string) => {
        setHabits(habits.map(h => {
            if (h.id === id) {
                const isCompleting = !h.completed;
                return { 
                    ...h, 
                    completed: isCompleting, 
                    streak: isCompleting ? h.streak + 1 : Math.max(0, h.streak - 1) 
                };
            }
            return h;
        }));
    };
    
    const handleDeleteHabit = (id: string) => {
        if (window.confirm("Are you sure you want to delete this habit? This cannot be undone.")) {
            setHabits(habits.filter(h => h.id !== id));
        }
    };
    
    const handleEditHabit = (habit: Habit) => {
        setEditingHabit(habit);
        setIsFormVisible(true);
    };

    const handleSaveHabit = (habitToSave: Habit) => {
        if (habits.some(h => h.id === habitToSave.id)) {
            // Editing existing habit
            setHabits(habits.map(h => h.id === habitToSave.id ? habitToSave : h));
        } else {
            // Adding new habit
            setHabits([habitToSave, ...habits]);
        }
        setIsFormVisible(false);
        setEditingHabit(null);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">My Habits</h2>
                <button onClick={() => { setEditingHabit(null); setIsFormVisible(true); }} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center text-2xl w-12 h-12" aria-label="Add new habit">+</button>
            </div>
            <div className="space-y-3">
                {habits.length > 0 ? (
                    habits.map(habit => (
                        <HabitItem key={habit.id} habit={habit} onToggle={handleToggleHabit} onEdit={handleEditHabit} onDelete={handleDeleteHabit} />
                    ))
                ) : (
                    <div className="text-center text-gray-400 mt-8 py-8 border-2 border-dashed border-gray-700 rounded-lg">
                        <p className="text-4xl mb-4">🎯</p>
                        <p className="font-semibold">No habits yet.</p>
                        <p>Add one to get started on your journey!</p>
                    </div>
                )}
            </div>
            {isFormVisible && <HabitForm onSave={handleSaveHabit} onCancel={() => { setIsFormVisible(false); setEditingHabit(null); }} habitToEdit={editingHabit} />}
        </div>
    );
};

export default HabitsScreen;