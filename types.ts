
export type Screen = 'home' | 'quotes' | 'habits' | 'journal' | 'profile';

export interface User {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  email: string;
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
  id:string;
  name: string;
  icon: string;
  completedDates: string[]; // e.g., ["2023-10-27", "2023-10-26"]
  streak: number;
  reminderTime?: string; // e.g., "14:30"
  reminderDays?: number[]; // [0, 1, 2, 3, 4, 5, 6] for Sun -> Sat
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