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

import { auth, db } from './firebaseConfig';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    User as FirebaseUser,
} from 'firebase/auth';
import {
    doc,
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    getDoc,
    writeBatch,
} from 'firebase/firestore';

interface AppContextType {
    activeScreen: Screen;
    setActiveScreen: (screen: Screen) => void;
    savedQuotes: Quote[];
    likedQuotes: Quote[];
    habits: Habit[];
    journalEntries: JournalEntry[];
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    signup: (newUser: Omit<User, 'id'>, password: string) => Promise<void>;
    completeOnboarding: (initialHabits: Omit<Habit, 'id'>[], categories: string[]) => Promise<void>;
    favoriteCategories: string[];
    toggleQuoteSaved: (quote: Quote) => Promise<void>;
    toggleQuoteLiked: (quote: Quote) => Promise<void>;
    addHabit: (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak'>) => Promise<void>;
    updateHabit: (habit: Habit) => Promise<void>;
    deleteHabit: (habitId: string) => Promise<void>;
    toggleHabitCompleted: (habitId: string) => Promise<void>;
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => Promise<void>;
    deleteJournalEntry: (entryId: string) => Promise<void>;
    refreshQuotes: () => void;
    setRefreshCallback: (callback: () => void) => void;
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
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
    
    const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
    const [likedQuotes, setLikedQuotes] = useState<Quote[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
    const [refreshCallback, setRefreshCallback] = useState<{ fn: () => void }>({ fn: () => {} });
    
    useEffect(() => {
        const unsubscribers: (() => void)[] = [];

        const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            // Unsubscribe from previous listeners
            unsubscribers.forEach(unsub => unsub());
            unsubscribers.length = 0;

            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const currentUser: User = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || userData.name,
                        email: firebaseUser.email || userData.email,
                    };
                    setUser(currentUser);
                    setFavoriteCategories(userData.favoriteCategories || []);
                    setShowOnboarding(false);
                } else {
                     // This is a new user from signup, onboarding will handle doc creation
                    const newUser: User = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || '',
                        email: firebaseUser.email || '',
                    };
                    setUser(newUser);
                    setShowOnboarding(true);
                }
                
                setIsAuthenticated(true);

                // Setup new Firestore listeners
                const collections = ['habits', 'journalEntries', 'savedQuotes', 'likedQuotes'];
                const setters:any = { habits: setHabits, journalEntries: setJournalEntries, savedQuotes: setSavedQuotes, likedQuotes: setLikedQuotes };
                
                collections.forEach(col => {
                    const q = collection(db, 'users', firebaseUser.uid, col);
                    const unsub = onSnapshot(q, (querySnapshot) => {
                        const items: any[] = [];
                        querySnapshot.forEach((doc) => {
                            items.push({ id: doc.id, ...doc.data() });
                        });
                        if (col === 'journalEntries') items.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        setters[col](items);
                    });
                    unsubscribers.push(unsub);
                });
            } else {
                setUser(null);
                setIsAuthenticated(false);
                setHabits([]);
                setJournalEntries([]);
                setSavedQuotes([]);
                setLikedQuotes([]);
                setFavoriteCategories([]);
                setActiveScreen('home');
            }
        });

        return () => {
            authUnsubscribe();
            unsubscribers.forEach(unsub => unsub());
        };
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    }, []);

    const signup = useCallback(async (newUser: Omit<User, 'id'>, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, password);
        await updateProfile(userCredential.user, { displayName: newUser.name });
        // The onAuthStateChanged listener will handle the rest
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
    }, []);

    const completeOnboarding = useCallback(async (initialHabits: Omit<Habit, 'id'>[], categories: string[]) => {
        if (!user) return;
        
        const userDocRef = doc(db, 'users', user.id);
        await setDoc(userDocRef, {
            name: user.name,
            email: user.email,
            favoriteCategories: categories,
        }, { merge: true });

        if (initialHabits.length > 0) {
            const batch = writeBatch(db);
            const habitsColRef = collection(db, 'users', user.id, 'habits');
            initialHabits.forEach(habit => {
                const newHabitRef = doc(habitsColRef);
                batch.set(newHabitRef, habit);
            });
            await batch.commit();
        }
        setFavoriteCategories(categories);
        setShowOnboarding(false);
    }, [user]);

    const toggleQuoteSaved = useCallback(async (quote: Quote) => {
        if (!user) return;
        const quoteRef = doc(db, 'users', user.id, 'savedQuotes', quote.id);
        const isSaved = savedQuotes.some(q => q.id === quote.id);
        if (isSaved) await deleteDoc(quoteRef);
        else await setDoc(quoteRef, { ...quote, id: quote.id }); // Ensure id is part of the doc data
    }, [user, savedQuotes]);
    
    const toggleQuoteLiked = useCallback(async (quote: Quote) => {
        if (!user) return;
        const quoteRef = doc(db, 'users', user.id, 'likedQuotes', quote.id);
        const isLiked = likedQuotes.some(q => q.id === quote.id);
        if (isLiked) await deleteDoc(quoteRef);
        else await setDoc(quoteRef, { ...quote, id: quote.id });
    }, [user, likedQuotes]);

    const addHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak'>) => {
        if (!user) return;
        const newHabit = { ...habitData, completedDates: [], streak: 0 };
        await addDoc(collection(db, 'users', user.id, 'habits'), newHabit);
    }, [user]);

    const updateHabit = useCallback(async (habit: Habit) => {
        if (!user) return;
        const { id, ...habitData } = habit;
        await setDoc(doc(db, 'users', user.id, 'habits', id), habitData);
    }, [user]);

    const deleteHabit = useCallback(async (habitId: string) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.id, 'habits', habitId));
    }, [user]);

    const toggleHabitCompleted = useCallback(async (habitId: string) => {
        if (!user) return;
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const newCompletedDates = new Set(habit.completedDates);
        if (newCompletedDates.has(todayStr)) newCompletedDates.delete(todayStr);
        else newCompletedDates.add(todayStr);
        
        const updatedDatesArray = Array.from(newCompletedDates);
        const newStreak = calculateStreak(updatedDatesArray);

        const habitRef = doc(db, 'users', user.id, 'habits', habitId);
        await updateDoc(habitRef, { completedDates: updatedDatesArray, streak: newStreak });
    }, [user, habits]);

    const addJournalEntry = useCallback(async (entry: Omit<JournalEntry, 'id' | 'date'>) => {
        if (!user) return;
        const newEntry = { ...entry, date: new Date().toISOString() };
        await addDoc(collection(db, 'users', user.id, 'journalEntries'), newEntry);
    }, [user]);

    const deleteJournalEntry = useCallback(async (entryId: string) => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.id, 'journalEntries', entryId));
    }, [user]);

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
        isAuthenticated,
        user,
        login,
        logout,
        signup,
        completeOnboarding,
        favoriteCategories,
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
    }), [
        activeScreen, savedQuotes, likedQuotes, habits, journalEntries, isAuthenticated, user, favoriteCategories, refreshCallback.fn,
        login, logout, signup, completeOnboarding, toggleQuoteSaved, toggleQuoteLiked, addHabit, updateHabit, deleteHabit, toggleHabitCompleted, addJournalEntry, deleteJournalEntry, setRefreshCallbackFn
    ]);

    const renderContent = () => {
        if (!isAuthenticated) return <LoginScreen />;
        if (showOnboarding) return <OnboardingScreen />;
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