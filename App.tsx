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
import { QUOTE_CATEGORIES } from './constants';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, writeBatch, updateDoc, Timestamp, query, orderBy } from 'firebase/firestore';


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
    const [user, setUser] = useState<User | null>(null);
    const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);
    
    const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);
    const [likedQuotes, setLikedQuotes] = useState<Quote[]>([]);
    const [habits, setHabits] = useState<Habit[]>([]);
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
    const [favoriteCategories, _setFavoriteCategories] = useState<string[]>(QUOTE_CATEGORIES.slice(0,3));
    const [refreshCallback, setRefreshCallback] = useState<{ fn: () => void }>({ fn: () => {} });
    
    const clearAppState = () => {
        setUser(null);
        setSavedQuotes([]);
        setLikedQuotes([]);
        setHabits([]);
        setJournalEntries([]);
        _setFavoriteCategories(QUOTE_CATEGORIES.slice(0, 3));
        setOnboardingComplete(false);
        setActiveScreen('home');
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const appUser: User = {
                        id: firebaseUser.uid,
                        name: userData.name,
                        email: userData.email,
                    };
                    setUser(appUser);
                    setOnboardingComplete(userData.onboardingComplete || false);
                    _setFavoriteCategories(userData.favoriteCategories || QUOTE_CATEGORIES.slice(0, 3));

                    // Fetch subcollections
                    const collections = {
                        savedQuotes: setSavedQuotes,
                        likedQuotes: setLikedQuotes,
                        habits: setHabits,
                        journalEntries: setJournalEntries,
                    };

                    for (const [key, setter] of Object.entries(collections)) {
                        let q = collection(db, 'users', firebaseUser.uid, key);
                        // Sort journal entries by date descending
                        if (key === 'journalEntries') {
                            const journalQuery = query(q, orderBy('date', 'desc'));
                             const querySnapshot = await getDocs(journalQuery);
                             const data = querySnapshot.docs.map(d => ({...d.data(), id: d.id, date: (d.data().date as Timestamp).toDate().toISOString()})) as JournalEntry[];
                             // Fix: Cast data to any to resolve TypeScript error with union of setter types.
                             setter(data as any);
                        } else {
                             const querySnapshot = await getDocs(q);
                             const data = querySnapshot.docs.map(d => ({...d.data(), id: d.id}));
                             setter(data as any);
                        }
                    }

                }
            } else {
                clearAppState();
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const signup = async (name: string, email: string, pass: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;
        await setDoc(doc(db, "users", firebaseUser.uid), {
          name,
          email,
          onboardingComplete: false,
          favoriteCategories: QUOTE_CATEGORIES.slice(0,3)
        });
    };
    
    const logout = async () => {
        if (window.confirm("Are you sure you want to log out?")) {
            await signOut(auth);
        }
    };
    
    const completeOnboarding = useCallback(async (initialHabits: Omit<Habit, 'id'>[], categories: string[]) => {
        if (!user) return;
        const batch = writeBatch(db);
        
        initialHabits.forEach(h => {
            const habitRef = doc(collection(db, 'users', user.id, 'habits'));
            batch.set(habitRef, h);
        });

        const userDocRef = doc(db, 'users', user.id);
        batch.update(userDocRef, { onboardingComplete: true, favoriteCategories: categories });

        await batch.commit();

        // Optimistically update local state
        const habitsWithIds: Habit[] = initialHabits.map((h, i) => ({
            ...h,
            id: `habit-temp-${Date.now()}-${i}`,
        }));
        setHabits(habitsWithIds);
        if (categories.length > 0) {
            _setFavoriteCategories(categories);
        }
        setOnboardingComplete(true);
    }, [user]);

    const setFavoriteCategories = useCallback(async (categories: string[]) => {
        if (!user) return;
        _setFavoriteCategories(categories);
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, { favoriteCategories: categories });
    }, [user]);

    const toggleQuoteSaved = useCallback(async (quote: Quote) => {
        if (!user) return;
        const isSaved = savedQuotes.some(q => q.id === quote.id);
        setSavedQuotes(prev => isSaved ? prev.filter(q => q.id !== quote.id) : [...prev, quote]);
        const quoteRef = doc(db, 'users', user.id, 'savedQuotes', quote.id);
        if (isSaved) await deleteDoc(quoteRef);
        else await setDoc(quoteRef, quote);
    }, [user, savedQuotes]);
    
    const toggleQuoteLiked = useCallback(async (quote: Quote) => {
        if (!user) return;
        const isLiked = likedQuotes.some(q => q.id === quote.id);
        setLikedQuotes(prev => isLiked ? prev.filter(q => q.id !== quote.id) : [...prev, quote]);
        const quoteRef = doc(db, 'users', user.id, 'likedQuotes', quote.id);
        if (isLiked) await deleteDoc(quoteRef);
        else await setDoc(quoteRef, quote);
    }, [user, likedQuotes]);

    const addHabit = useCallback(async (habitData: Omit<Habit, 'id' | 'completedDates' | 'streak'>) => {
        if (!user) return;
        const newHabit: Omit<Habit, 'id'> = { ...habitData, completedDates: [], streak: 0 };
        const habitCollRef = collection(db, 'users', user.id, 'habits');
        const newDocRef = doc(habitCollRef);
        await setDoc(newDocRef, newHabit);
        setHabits(prev => [{...newHabit, id: newDocRef.id}, ...prev]);
    }, [user]);

    const updateHabit = useCallback(async (habit: Habit) => {
        if (!user) return;
        setHabits(prev => prev.map(h => h.id === habit.id ? habit : h));
        const habitRef = doc(db, 'users', user.id, 'habits', habit.id);
        const { id, ...habitToSave } = habit;
        await setDoc(habitRef, habitToSave);
    }, [user]);

    const deleteHabit = useCallback(async (habitId: string) => {
        if (!user) return;
        setHabits(prev => prev.filter(h => h.id !== habitId));
        await deleteDoc(doc(db, 'users', user.id, 'habits', habitId));
    }, [user]);

    const toggleHabitCompleted = useCallback(async (habitId: string) => {
         if (!user) return;
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;

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
        setHabits(prev => prev.map(h => h.id === habitId ? updatedHabit : h));

        const habitRef = doc(db, 'users', user.id, 'habits', habitId);
        await updateDoc(habitRef, { completedDates: updatedDatesArray, streak: newStreak });
    }, [user, habits]);

    const addJournalEntry = useCallback(async (entry: Omit<JournalEntry, 'id' | 'date'>) => {
        if (!user) return;
        const newEntry: Omit<JournalEntry, 'id'> = { ...entry, date: new Date().toISOString() };
        const journalCollRef = collection(db, 'users', user.id, 'journalEntries');
        const newDocRef = doc(journalCollRef);
        // Firestore specific timestamp for ordering
        await setDoc(newDocRef, { ...entry, date: Timestamp.now() }); 
        setJournalEntries(prev => [{...newEntry, id: newDocRef.id}, ...prev]);
    }, [user]);

    const deleteJournalEntry = useCallback(async (entryId: string) => {
        if (!user) return;
        setJournalEntries(prev => prev.filter(entry => entry.id !== entryId));
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
    
    if (isLoading) {
        return (
            <div className="bg-gray-900 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
            </div>
        );
    }

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