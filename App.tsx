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
import useLocalStorage from './hooks/useLocalStorage';

interface AppContextType {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    savedQuotes: Quote[];
    setSavedQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
    likedQuotes: Quote[];
    setLikedQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
    habits: Habit[];
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
    journalEntries: JournalEntry[];
    setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => boolean;
    logout: () => void;
    signup: (newUser: Omit<User, 'id' | 'password'>, password: string) => { success: boolean; message: string };
    completeOnboarding: (initialHabits: Habit[], categories: string[]) => void;
    favoriteCategories: string[];
    setFavoriteCategories: React.Dispatch<React.SetStateAction<string[]>>;
    refreshQuotes: () => void;
    setRefreshCallback: (callback: () => void) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const App: React.FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>('home');
    const [users, setUsers] = useLocalStorage<User[]>('zolffix-users', []);
    const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('zolffix-auth', false);
    const [user, setUser] = useLocalStorage<User | null>('zolffix-user', null);
    const [showOnboarding, setShowOnboarding] = useLocalStorage<boolean>('zolffix-show-onboarding', false);
    
    const [savedQuotes, setSavedQuotes] = useLocalStorage<Quote[]>('zolffix-saved-quotes', []);
    const [likedQuotes, setLikedQuotes] = useLocalStorage<Quote[]>('zolffix-liked-quotes', []);
    const [habits, setHabits] = useLocalStorage<Habit[]>('zolffix-habits', [
        { id: '1', name: 'Drink Water', icon: '💧', completed: true, streak: 5 },
        { id: '2', name: 'Read 10 Pages', icon: '📚', completed: false, streak: 2 },
        { id: '3', name: 'Morning Walk', icon: '🚶‍♂️', completed: false, streak: 12 },
    ]);
    const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>('zolffix-journal', []);
    const [favoriteCategories, setFavoriteCategories] = useLocalStorage<string[]>('zolffix-fav-categories', []);
    const [refreshCallback, setRefreshCallback] = useState<{ fn: () => void }>({ fn: () => {} });

    const login = useCallback((email: string, password: string): boolean => {
        const foundUser = users.find(u =>
            u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (foundUser) {
            setUser(foundUser);
            setIsAuthenticated(true);
            setShowOnboarding(false);
            setActiveScreen('home');
            return true;
        }
        return false;
    }, [users, setUser, setIsAuthenticated, setShowOnboarding, setActiveScreen]);

    const signup = useCallback((newUser: Omit<User, 'id' | 'password'>, password: string): { success: boolean; message: string } => {
        if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
            return { success: false, message: 'Email already exists.' };
        }
        const userToSave: User = { ...newUser, id: `user-${Date.now()}`, password };
        setUsers(prev => [...prev, userToSave]);
        setUser(userToSave);
        setIsAuthenticated(true);
        setShowOnboarding(true);
        return { success: true, message: 'Signup successful!' };
    }, [users, setUsers, setUser, setIsAuthenticated, setShowOnboarding]);

    const logout = useCallback(() => {
        setUser(null);
        setIsAuthenticated(false);
        setShowOnboarding(false);
        setActiveScreen('home');
    }, [setUser, setIsAuthenticated, setActiveScreen, setShowOnboarding]);

     const completeOnboarding = useCallback((initialHabits: Habit[], categories: string[]) => {
        if (initialHabits.length > 0) {
            const existingHabitNames = new Set(habits.map(h => h.name));
            const habitsToAdd = initialHabits.filter(h => !existingHabitNames.has(h.name));
            setHabits(prev => [...prev, ...habitsToAdd]);
        }
        setFavoriteCategories(categories);
        setShowOnboarding(false);
    }, [setHabits, setShowOnboarding, habits, setFavoriteCategories]);
    
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
        setSavedQuotes,
        likedQuotes,
        setLikedQuotes,
        habits,
        setHabits,
        journalEntries,
        setJournalEntries,
        isAuthenticated,
        user,
        login,
        logout,
        signup,
        completeOnboarding,
        favoriteCategories,
        setFavoriteCategories,
        refreshQuotes: refreshCallback.fn,
        setRefreshCallback: setRefreshCallbackFn,
    }), [activeScreen, savedQuotes, setSavedQuotes, likedQuotes, setLikedQuotes, habits, setHabits, journalEntries, setJournalEntries, isAuthenticated, user, login, logout, signup, completeOnboarding, favoriteCategories, setFavoriteCategories, refreshCallback.fn, setRefreshCallbackFn]);

    const renderContent = () => {
        if (!isAuthenticated) {
            return <LoginScreen />;
        }
        if (showOnboarding) {
            return <OnboardingScreen />;
        }
        return (
            <div className="bg-gray-900 text-gray-100 min-h-screen font-sans flex flex-col max-w-lg mx-auto shadow-2xl shadow-cyan-500/10">
                <Header />
                <main id="main-content" className="flex-grow overflow-y-auto pb-20 pt-20">
                    {renderScreen()}
                </main>
                <BottomNav />
            </div>
        );
    };

    return (
        <AppContext.Provider value={contextValue}>
            {renderContent()}
        </AppContext.Provider>
    );
};

export default App;