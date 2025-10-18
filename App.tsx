import React, { useState, createContext, useMemo, useCallback } from 'react';
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
import { QUOTE_CATEGORIES } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';

interface AppContextType {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    savedQuotes: Quote[];
    likedQuotes: Quote[];
    habits: Habit[];
    journalEntries: JournalEntry[];
    user: User | null;
    favoriteCategories: string[];
    setFavoriteCategories: (categories: string[]) => void;
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
    logout: () => void;
    login: (email: string, pass: string) => Promise<void>;
    signup: (name: string, email: string, pass: string) => Promise<void>;
    completeOnboarding: (initialHabits: Omit<Habit, 'id'>[], favoriteCategories: string[]) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const calculateStreak = (dates: string[]): number => {
    if (!dates || dates.length === 0) return 0;

    const dateSet = new Set(dates);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedDates = dates.map(d => {
        const date = new Date(d);
        date.setHours(0,0,0,0);
        return date;
    }).sort((a, b) => b.getTime() - a.getTime());

    const mostRecentDate = sortedDates[0];

    const diffTime = today.getTime() - mostRecentDate.getTime();
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
    const [user, setUser] = useLocalStorage<User | null>('user', null);
    const [onboardingComplete, setOnboardingComplete] = useLocalStorage<boolean>('onboardingComplete', false);

    const [savedQuotes, setSavedQuotes] = useLocalStorage<Quote[]>('savedQuotes', []);
    const [likedQuotes, setLikedQuotes] = useLocalStorage<Quote[]>('likedQuotes', []);
    const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
    const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('journalEntries', []);
    const [favoriteCategories, setFavoriteCategoriesState] = useLocalStorage<string[]>('favoriteCategories', QUOTE_CATEGORIES.slice(0,3));
    const [refreshCallback, setRefreshCallback] = useState<{ fn: () => void }>({ fn: () => {} });

    const clearAppState = () => {
        setUser(null);
        setSavedQuotes([]);
        setLikedQuotes([]);
        setHabits([]);
        setJournalEntries([]);
        setFavoriteCategoriesState(QUOTE_CATEGORIES.slice(0, 3));
        setOnboardingComplete(false);
        setActiveScreen('home');
    };

    const login = async (email: string, pass: string) => {
        const mockUser: User = {
            id: Date.now().toString(),
            name: email.split('@')[0],
            email: email,
        };
        setUser(mockUser);
    };

    const signup = async (name: string, email: string, pass: string) => {
        const mockUser: User = {
            id: Date.now().toString(),
            name: name,
            email: email,
        };
        setUser(mockUser);
    };

    const logout = async () => {
        if (window.confirm("Are you sure you want to log out?")) {
            clearAppState();
        }
    };

    const completeOnboarding = useCallback((initialHabits: Omit<Habit, 'id'>[], categories: string[]) => {
        const habitsWithIds: Habit[] = initialHabits.map((h, i) => ({
            ...h,
            id: `habit-${Date.now()}-${i}`,
        }));
        setHabits(habitsWithIds);
        if (categories.length > 0) {
            setFavoriteCategoriesState(categories);
        }
        setOnboardingComplete(true);
    }, [setHabits, setFavoriteCategoriesState, setOnboardingComplete]);

    const setFavoriteCategories = useCallback((categories: string[]) => {
        setFavoriteCategoriesState(categories);
    }, [setFavoriteCategoriesState]);

    const toggleQuoteSaved = useCallback((quote: Quote) => {
        setSavedQuotes(prev => {
            const isSaved = prev.some(q => q.id === quote.id);
            return isSaved ? prev.filter(q => q.id !== quote.id) : [...prev, quote];
        });
    }, [setSavedQuotes]);

    const toggleQuoteLiked = useCallback((quote: Quote) => {
        setLikedQuotes(prev => {
            const isLiked = prev.some(q => q.id === quote.id);
            return isLiked ? prev.filter(q => q.id !== quote.id) : [...prev, quote];
        });
    }, [setLikedQuotes]);

    const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'completedDates' | 'streak'>) => {
        const newHabit: Habit = {
            ...habitData,
            id: `habit-${Date.now()}`,
            completedDates: [],
            streak: 0
        };
        setHabits(prev => [newHabit, ...prev]);
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

            const updatedHabit = { ...habit, completedDates: updatedDatesArray, streak: newStreak };
            return prev.map(h => h.id === habitId ? updatedHabit : h);
        });
    }, [setHabits]);

    const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id' | 'date'>) => {
        const newEntry: JournalEntry = {
            ...entry,
            id: `journal-${Date.now()}`,
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
        logout,
        login,
        signup,
        completeOnboarding,
    }), [
        activeScreen, savedQuotes, likedQuotes, habits, journalEntries, user, favoriteCategories, refreshCallback.fn,
        toggleQuoteSaved, toggleQuoteLiked, addHabit, updateHabit, deleteHabit, toggleHabitCompleted, addJournalEntry, deleteJournalEntry, setRefreshCallbackFn, setFavoriteCategories, logout,
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
