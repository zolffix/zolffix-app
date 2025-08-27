
export type Screen = 'home' | 'quotes' | 'habits' | 'journal' | 'profile';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  category: string;
  imageUrl: string;
  liked?: boolean;
  saved?: boolean;
  imageKeyword?: string;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  streak: number;
  reminderTime?: string; // e.g., "14:30"
}

export interface JournalEntry {
    id: string;
    content: string;
    mood: Mood;
    date: string;
}

export interface Mood {
    name: string;
    emoji: string;
}