export type Language = 'en' | 'hi' | 'bn' | 'hinglish';

export interface Lesson {
  id: string;
  title: string;
  titleHi?: string;
  titleBn?: string;
  duration: string;
  category: string;
  content: {
    en: string;
    hi: string;
    bn: string;
    hinglish?: string;
  };
  scenario: {
    en: string;
    hi: string;
    bn: string;
  };
  tips: {
    do: string[];
    dont: string[];
  };
  recap: {
    en: string;
    hi: string;
    bn: string;
  };
}

export interface Module {
  id: string;
  title: string;
  titleHi: string;
  icon: string;
  description: string;
  lessons: Lesson[];
}

export interface UserProgress {
  completedLessons: string[];
  bookmarks: string[];
  goals: string[];
  streak: number;
}
