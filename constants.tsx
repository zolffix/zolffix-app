
import { Screen, Mood } from './types';

export const QUOTE_CATEGORIES = [
  "Sad", "Emotional", "Heart-touching", "Love", "Heartbreak", "Motivation", "Self-Respect", "Life", "Success", "Family", "Self-Improvement", "Friendship", "Failure", "Loneliness", "Growth", "Confidence", "Healing", "Moving On", "Mindset", "Attitude", "Silence"
];

export const NAV_ITEMS: { name: Screen; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    { name: 'home', label: 'Home', icon: (active) => <HomeIcon active={active} /> },
    { name: 'quotes', label: 'Quotes', icon: (active) => <QuoteIcon active={active} /> },
    { name: 'habits', label: 'Habits', icon: (active) => <HabitsIcon active={active} /> },
    { name: 'journal', label: 'Journal', icon: (active) => <JournalIcon active={active} /> },
    { name: 'profile', label: 'Profile', icon: (active) => <ProfileIcon active={active} /> },
];

export const MOODS: Mood[] = [
    { name: 'Happy', emoji: '😊' },
    { name: 'Sad', emoji: '😢' },
    { name: 'Anxious', emoji: '😟' },
    { name: 'Excited', emoji: '🤩' },
    { name: 'Calm', emoji: '😌' },
    { name: 'Angry', emoji: '😠' },
];

// SVG Icons
const HomeIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-cyan-400" : "text-gray-400"}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
);
const QuoteIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-cyan-400" : "text-gray-400"}>
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 2v12c0 1.25.75 2 2 2z"></path><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.75-2.017-2-2h-4c-1.25 0-2 .75-2 2v12c0 1.25.75 2 2 2z"></path>
    </svg>
);
const HabitsIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-cyan-400" : "text-gray-400"}>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path>
    </svg>
);
const JournalIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-cyan-400" : "text-gray-400"}>
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
    </svg>
);
const ProfileIcon = ({ active }: { active: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-cyan-400" : "text-gray-400"}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
    </svg>
);
