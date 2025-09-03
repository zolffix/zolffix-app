
import React, { useState, createContext, useMemo, useCallback, useEffect } from 'react';
import { Screen, Quote, Habit, JournalEntry, User } from './types';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import HomeScreen from './components/screens/HomeScreen';
import QuotesScreen from './components/screens/QuotesScreen';
import HabitsScreen from './components/screens/HabitsScreen';
import JournalScreen from './components/screens/JournalScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import LoginScreen from './components/screens/LoginScreen';
import OnboardingScreen from './components/screens/OnboardingScreen';
import useLocalStorage from './hooks/useLocalStorage';
import { QUOTE_CATEGORIES } from './constants';

interface AppContextType {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    savedQuotes: Quote[];
    likedQuotes: Quote[];
    habits: Habit[];
    journalEntries: JournalEntry[];
    user: User | null;
    favoriteCategories: string[];
    setFavoriteCategories: React.Dispatch<React.SetStateAction<string[]>>;
    toggleQuoteSaved: (quote: Quote) => void;
    toggleQuoteLiked: (quote: Quote) => void;
    addHabit: (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak'>) => void;
    updateHabit: (habit: Habit) => void;
    deleteHabit: (habitId: string) => void;
    toggleHabitCompleted: (habitId: string) => void;
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
    deleteJournalEntry: (entryId: string) => void;
    refreshQuotes: () => void;
    setRefreshCallback: (callback: () => void) => void;
    resetData: () => void;
    login: (email: string, pass: string) => void;
    signup: (name: string, email: string) => void;
    completeOnboarding: (initialHabits: Omit<Habit, 'id'>[], favoriteCategories: string[]) => void;
}


export const AppContext = createContext<AppContextType | null>(null);

const calculateStreak = (dates: string[]): number => {
    if (!dates || dates.length === 0) return 0;
    
    const dateSet = new Set(dates);
    const today = new Date();
    
    const sortedDates = dates.map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
    const mostRecentDate = sortedDates[0];

    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const mostRecentDateOnly = new Date(mostRecentDate.getFullYear(), mostRecentDate.getMonth(), mostRecentDate.getDate());
    const diffTime = todayDate.getTime() - mostRecentDateOnly.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return 0;
    
    let streak = 0;
    let currentDate = mostRecentDate;
    while (true) {
        const dateString = currentDate.toISOString().split('T')[0];
        if (dateSet.has(dateString)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
};

const App: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>('home');
    const [user, setUser] = useLocalStorage<User | null>('zolffix-user', null);
    const [onboardingComplete, setOnboardingComplete] = useLocalStorage<boolean>('zolffix-onboarding-complete', false);
    
    const [savedQuotes, setSavedQuotes] = useLocalStorage<Quote[]>('zolffix-savedQuotes', []);
    const [likedQuotes, setLikedQuotes] = useLocalStorage<Quote[]>('zolffix-likedQuotes', []);
    const [habits, setHabits] = useLocalStorage<Habit[]>('zolffix-habits', []);
    const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('zolffix-journalEntries', []);
    const [favoriteCategories, setFavoriteCategories] = useLocalStorage<string[]>('zolffix-favoriteCategories', QUOTE_CATEGORIES.slice(0,3));
    const [refreshCallback, setRefreshCallback] = useState<{ fn: () => void }>({ fn: () => {} });
    
    // Effect for handling habit reminder notifications
    useEffect(() => {
        // Request permission on component mount if not already granted or denied.
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                }
            });
        }

        const checkReminders = () => {
            if (Notification.permission !== 'granted') return;

            const now = new Date();
            const currentDay = now.getDay(); // Sunday - 0, Monday - 1, etc.
            const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            const todayStr = now.toISOString().split('T')[0];

            habits.forEach(habit => {
                if (habit.reminderTime === currentTime) {
                    // If reminderDays is not set, default to all days.
                    const reminderDays = habit.reminderDays && habit.reminderDays.length > 0 ? habit.reminderDays : [0, 1, 2, 3, 4, 5, 6];
                    
                    if (reminderDays.includes(currentDay)) {
                        const lastNotifiedDate = localStorage.getItem(`zolffix-notified-${habit.id}`);
                        if (lastNotifiedDate !== todayStr) {
                             new Notification('Zolffix Habit Reminder', {
                                body: `It's time for: ${habit.name} ${habit.icon}`,
                                icon: '/vite.svg',
                            });
                            localStorage.setItem(`zolffix-notified-${habit.id}`, todayStr);
                        }
                    }
                }
            });
        };

        // Check reminders every minute.
        const intervalId = setInterval(checkReminders, 60000);

        // Clean up the interval when the component unmounts.
        return () => clearInterval(intervalId);
    }, [habits]);

    const login = useCallback((email: string, pass: string) => {
        // Mock login for a local app. It creates a user profile to proceed.
        const loggedInUser: User = {
            id: `user-${Date.now()}`,
            name: email.split('@')[0], // Generate a name from the email
            email: email,
        };
        setUser(loggedInUser);
    }, [setUser]);

    const signup = useCallback((name: string, email: string) => {
        // Creates a new user profile in local storage.
        const newUser: User = {
            id: `user-${Date.now()}`,
            name: name,
            email: email,
        };
        setUser(newUser);
    }, [setUser]);

    const completeOnboarding = useCallback((initialHabits: Omit<Habit, 'id'>[], categories: string[]) => {
        const habitsWithIds: Habit[] = initialHabits.map((h, i) => ({
            ...h,
            id: `habit-${Date.now()}-${i}`,
        }));
        setHabits(habitsWithIds);
        if (categories.length > 0) {
            setFavoriteCategories(categories);
        }
        setOnboardingComplete(true);
    }, [setHabits, setFavoriteCategories, setOnboardingComplete]);

    const toggleQuoteSaved = useCallback((quote: Quote) => {
        setSavedQuotes(prev => {
            const isSaved = prev.some(q => q.id === quote.id);
            if (isSaved) {
                return prev.filter(q => q.id !== quote.id);
            } else {
                return [...prev, quote];
            }
        });
    }, [setSavedQuotes]);
    
    const toggleQuoteLiked = useCallback((quote: Quote) => {
        setLikedQuotes(prev => {
            const isLiked = prev.some(q => q.id === quote.id);
            if (isLiked) {
                return prev.filter(q => q.id !== quote.id);
            } else {
                return [...prev, quote];
            }
        });
    }, [setLikedQuotes]);

    const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'completedDates' | 'streak'>) => {
        const newHabit: Habit = { 
            id: `habit-${Date.now()}`,
            ...habitData, 
            completedDates: [], 
            streak: 0 
        };
        setHabits(prev => [...prev, newHabit]);
    }, [setHabits]);

    const updateHabit = useCallback((habit: Habit) => {
        setHabits(prev => prev.map(h => h.id === habit.id ? habit : h));
    }, [setHabits]);

    const deleteHabit = useCallback((habitId: string) => {
        setHabits(prev => prev.filter(h => h.id !== habitId));
    }, [setHabits]);

    const toggleHabitCompleted = useCallback((habitId: string) => {
        setHabits(prev => {
            const habit = prev.find(h => h.id === habitId);
            if (!habit) return prev;

            const todayStr = new Date().toISOString().split('T')[0];
            const newCompletedDates = new Set(habit.completedDates);
            if (newCompletedDates.has(todayStr)) {
                newCompletedDates.delete(todayStr);
            } else {
                newCompletedDates.add(todayStr);
            }
            
            const updatedDatesArray = Array.from(newCompletedDates);
            const newStreak = calculateStreak(updatedDatesArray);

            return prev.map(h => h.id === habitId ? { ...h, completedDates: updatedDatesArray, streak: newStreak } : h);
        });
    }, [setHabits]);

    const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'date'>) => {
        const newEntry: JournalEntry = { 
            id: `journal-${Date.now()}`,
            ...entry, 
            date: new Date().toISOString() 
        };
        setJournalEntries(prev => [newEntry, ...prev]);
    }, [setJournalEntries]);

    const deleteJournalEntry = useCallback((entryId: string) => {
        setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
    }, [setJournalEntries]);

    const setRefreshCallbackFn = useCallback((callback: () => void) => {
        setRefreshCallback({ fn: callback });
    }, []);

    const resetData = useCallback(() => {
        if (window.confirm("Are you sure you want to log out and reset all your data? This cannot be undone.")) {
            localStorage.clear();
            window.location.reload();
        }
    }, []);

    const renderScreen = () => {
        switch (activeScreen) {
            case 'home': return <HomeScreen />;
            case 'quotes': return <QuotesScreen />;
            case 'habits': return <HabitsScreen />;
            case 'journal': return <JournalScreen />;
            case 'profile': return <ProfileScreen />;
            default: return <HomeScreen />;
        }
    };
    
    const contextValue = useMemo(() => ({
        activeScreen,
        setActiveScreen,
        savedQuotes,
        likedQuotes,
        habits,
        journalEntries,
        user,
        favoriteCategories,
        setFavoriteCategories,
        toggleQuoteSaved,
        toggleQuoteLiked,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitCompleted,
        addJournalEntry,
        deleteJournalEntry,
        refreshQuotes: refreshCallback.fn,
        setRefreshCallback: setRefreshCallbackFn,
        resetData,
        login,
        signup,
        completeOnboarding,
    }), [
        activeScreen, savedQuotes, likedQuotes, habits, journalEntries, user, favoriteCategories, refreshCallback.fn,
        toggleQuoteSaved, toggleQuoteLiked, addHabit, updateHabit, deleteHabit, toggleHabitCompleted, addJournalEntry, deleteJournalEntry, setRefreshCallbackFn, setFavoriteCategories, resetData,
        login, signup, completeOnboarding
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {!user ? (
                <LoginScreen />
            ) : !onboardingComplete ? (
                <OnboardingScreen />
            ) : (
                <div className="bg-gray-900 text-gray-100 min-h-screen font-sans flex flex-col max-w-lg mx-auto shadow-2xl shadow-cyan-500/10">
                    <Header />
                    <main id="main-content" className="flex-grow overflow-y-auto pb-20 pt-20">
                        {renderScreen()}
                    </main>
                    <BottomNav />
                </div>
            )}
        </AppContext.Provider>
    );
};

export default App;
