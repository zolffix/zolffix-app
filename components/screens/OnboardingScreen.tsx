import React, { useState, useContext } from 'react';
import { AppContext } from '../../App';
import { Habit } from '../../types';
import { QUOTE_CATEGORIES } from '../../constants';

const OnboardingScreen: React.FC = () => {
    const [step, setStep] = useState(1);
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
    const context = useContext(AppContext);

    const goals = [
        { id: 'habits', label: 'Build Better Habits', icon: '🎯' },
        { id: 'motivation', label: 'Find Daily Motivation', icon: '🔥' },
        { id: 'journaling', label: 'Practice Mindful Journaling', icon: '✍️' },
        { id: 'growth', label: 'Focus on Personal Growth', icon: '🌱' },
    ];

    const handleToggleGoal = (goalId: string) => {
        setSelectedGoals(prev =>
            prev.includes(goalId)
                ? prev.filter(id => id !== goalId)
                : [...prev, goalId]
        );
    };

    const handleToggleCategory = (category: string) => {
        setFavoriteCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleNext = () => {
        if (selectedGoals.length > 0) {
            setStep(2);
        }
    };

    const handleComplete = () => {
        if (!context) return;
        const initialHabits: Habit[] = [];
        if (selectedGoals.includes('habits')) {
            initialHabits.push({ id: `onboard-${Date.now()}-1`, name: 'Drink 8 glasses of water', icon: '💧', completed: false, streak: 0 });
            initialHabits.push({ id: `onboard-${Date.now()}-2`, name: 'Read for 15 minutes', icon: '📚', completed: false, streak: 0 });
        }
        if (selectedGoals.includes('journaling')) {
            initialHabits.push({ id: `onboard-${Date.now()}-3`, name: 'Write a journal entry', icon: '✏️', completed: false, streak: 0 });
        }
        if (selectedGoals.includes('growth')) {
            initialHabits.push({ id: `onboard-${Date.now()}-4`, name: 'Learn something new', icon: '🧠', completed: false, streak: 0 });
        }

        context.completeOnboarding(initialHabits, favoriteCategories);
    };

    const renderStepOne = () => (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome, {context?.user?.name}!</h1>
                <p className="text-gray-400">Let's personalize your journey. What's your main focus?</p>
            </div>

            <div className="space-y-3 mb-10">
                {goals.map(goal => (
                    <button
                        key={goal.id}
                        onClick={() => handleToggleGoal(goal.id)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center ${selectedGoals.includes(goal.id) ? 'bg-cyan-500/20 border-cyan-500 scale-105' : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
                    >
                        <span className="text-2xl mr-4">{goal.icon}</span>
                        <span className="font-semibold">{goal.label}</span>
                    </button>
                ))}
            </div>

            <button
                onClick={handleNext}
                disabled={selectedGoals.length === 0}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg disabled:bg-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
                Next
            </button>
        </>
    );

    const renderStepTwo = () => (
        <>
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">What inspires you?</h1>
                <p className="text-gray-400">Select a few quote categories you enjoy.</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center mb-10">
                {QUOTE_CATEGORIES.slice(0, 12).map(category => (
                    <button
                        key={category}
                        onClick={() => handleToggleCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${favoriteCategories.includes(category)
                                ? 'bg-cyan-500 text-gray-900'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <div className="flex space-x-4">
                <button
                    onClick={() => setStep(1)}
                    className="w-1/3 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
                >
                    Back
                </button>
                <button
                    onClick={handleComplete}
                    className="w-2/3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg"
                >
                    Let's Go!
                </button>
            </div>

        </>
    );


    return (
        <div className="bg-gray-900 text-gray-100 min-h-screen font-sans flex flex-col items-center justify-center p-4 max-w-lg mx-auto">
            <div className="w-full">
                {step === 1 ? renderStepOne() : renderStepTwo()}
            </div>
        </div>
    );
};

export default OnboardingScreen;