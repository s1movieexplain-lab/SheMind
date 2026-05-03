/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  MessageCircle, 
  Heart, 
  Settings, 
  Bookmark, 
  Play, 
  Pause, 
  ChevronLeft, 
  Sparkles,
  User,
  AudioWaveform as Waveform,
  CheckCircle2,
  TrendingUp,
  Search,
  Volume2,
  Send,
  LogIn,
  LogOut
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { INITIAL_MODULES, ETHICAL_DISCLAIMER } from './constants';
import { Module, Lesson, UserProgress, Language } from './types';
import { generateLessonAudio, chatWithMentor, getLessonAdvice, playPCM } from './services/ai';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Components
const WaveformAnimation = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex items-center gap-1 h-8">
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="w-1 bg-brand-gold rounded-full"
        animate={{
          height: isPlaying ? [10, 32, 12, 28, 16] : 8
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "mirror",
          delay: i * 0.1,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

export default function App() {
  const [view, setView] = useState<'home' | 'lesson' | 'profile' | 'chat' | 'login'>('login');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [language, setLanguage] = useState<Language>('hinglish');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [lessonAdvice, setLessonAdvice] = useState<string | null>(null);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState<UserProgress>({
    completedLessons: [],
    bookmarks: [],
    goals: ['Improve Communication'],
    streak: 3
  });

  // Firebase Auth & Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setView('home');
        // Initial sync from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setProgress(userDoc.data() as UserProgress);
        } else {
          // Create initial user doc
          const initialProgress: UserProgress = {
            completedLessons: [],
            bookmarks: [],
            goals: ['Improve Communication'],
            streak: 1
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...initialProgress,
            lastActive: serverTimestamp()
          });
          setProgress(initialProgress);
        }
      } else {
        setView('login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Update Firestore on progress change
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      setDoc(userRef, {
        ...progress,
        lastActive: serverTimestamp()
      }, { merge: true });
    }
  }, [progress, user]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setView('login');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setView('lesson');
    setLessonAdvice(null);
    stopAudio();
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playLesson = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setIsLoadingAudio(true);
    const content = language === 'hi' ? selectedLesson?.content.hi : (language === 'bn' ? selectedLesson?.content.bn : selectedLesson?.content.en);
    if (content) {
      const base64 = await generateLessonAudio(content, language);
      if (base64) {
        const source = await playPCM(base64);
        if (source) {
          audioSourceRef.current = source;
          setIsPlaying(true);
          source.onended = () => {
            setIsPlaying(false);
            if (selectedLesson) markCompleted(selectedLesson.id);
          };
        }
      }
    }
    setIsLoadingAudio(false);
  };

  const fetchLessonAdvice = async () => {
    if (!selectedLesson || isAdviceLoading) return;
    setIsAdviceLoading(true);
    const advice = await getLessonAdvice(selectedLesson.title, progress.goals[0] || "Better Relationships");
    setLessonAdvice(advice);
    setIsAdviceLoading(false);
  };

  const markCompleted = (id: string) => {
    if (!progress.completedLessons.includes(id)) {
      setProgress(prev => ({
        ...prev,
        completedLessons: [...prev.completedLessons, id]
      }));
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', parts: [{ text: userMessage }] }]);
    setIsChatLoading(true);
    stopAudio(); // Stop any existing lesson audio

    const botResponse = await chatWithMentor(userMessage, chatHistory, language);
    setChatHistory(prev => [...prev, { role: 'model', parts: [{ text: botResponse || '' }] }]);
    setIsChatLoading(false);
 
    // Speak the bot's response independently
    if (botResponse) {
      const base64 = await generateLessonAudio(botResponse, language);
      if (base64) {
        const source = await playPCM(base64);
        if (source) {
          audioSourceRef.current = source;
          setIsPlaying(true);
          source.onended = () => setIsPlaying(false);
        }
      }
    }
  };

  const toggleBookmark = (id: string) => {
    setProgress(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.includes(id) 
        ? prev.bookmarks.filter(b => b !== id)
        : [...prev.bookmarks, id]
    }));
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans selection:bg-brand-red/30 overflow-x-hidden">
      <div className="bg-atmosphere" />
      <div className="bg-noise" />

      {/* Decorative Graphics */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-brand-red/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-[100px]"
        />
      </div>

      {/* Header */}
      <header className="max-w-md mx-auto px-6 pt-8 pb-4 flex justify-between items-center sticky top-0 bg-black/50 backdrop-blur-md z-40">
        <div onClick={() => setView('home')} className="cursor-pointer">
          <h1 className="text-xl font-bold gold-gradient-text tracking-tight uppercase">SheMind</h1>
          <p className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Mentor for Emotional Intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setView('profile')} className="p-2 bg-gray-900/50 rounded-full border border-white/5">
            <User size={20} className="text-brand-gold" />
          </button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className={`relative z-10 max-w-md mx-auto pb-32 px-6 ${view === 'chat' ? 'h-[calc(100vh-180px)]' : ''}`}>
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Daily Insight Section */}
              <section className="mt-4">
                <div className="glass-card rounded-[32px] p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Sparkles size={160} className="text-brand-gold" />
                  </div>
                  <h2 className="text-[10px] font-black text-brand-gold tracking-[0.2em] uppercase mb-4 opacity-70">Daily Mastery</h2>
                  <p className="text-xl font-medium leading-snug mb-6 tracking-tight italic">
                    "Respect is the soil in which attraction grows."
                  </p>
                  <button className="flex items-center gap-3 text-xs font-black uppercase tracking-widest bg-brand-gold/10 text-brand-gold py-3 px-6 rounded-2xl hover:bg-brand-gold/20 transition-all">
                    <Play size={14} fill="currentColor" /> Play Daily Lesson
                  </button>
                </div>
              </section>

              {/* Modules List */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-wider uppercase opacity-60">Learning Pathways</h3>
                  <button className="text-xs text-brand-gold">See All</button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {INITIAL_MODULES.map((module) => (
                    <motion.div
                      key={module.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedModule(selectedModule?.id === module.id ? null : module)}
                      className={`glass-card rounded-[32px] overflow-hidden cursor-pointer transition-all ${
                        selectedModule?.id === module.id ? 'ring-1 ring-brand-gold/50 bg-white/5' : ''
                      }`}
                    >
                      <div className="p-6 flex items-center gap-5">
                        <div className="w-14 h-14 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-brand-gold rotate-3 group-hover:rotate-0 transition-transform">
                          {module.icon === 'Brain' ? <Brain size={28} /> : <MessageCircle size={28} />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg tracking-tight">{module.title}</h4>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{module.titleHi}</p>
                        </div>
                        <ChevronLeft className={`transition-transform opacity-30 ${selectedModule?.id === module.id ? '-rotate-90' : 'rotate-180'}`} />
                      </div>

                      <AnimatePresence>
                        {selectedModule?.id === module.id && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden bg-brand-red/5"
                          >
                            <div className="p-5 pt-0 space-y-3">
                              <p className="text-xs text-gray-400 mb-4">{module.description}</p>
                              {module.lessons.map(lesson => (
                                <button
                                  key={lesson.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLessonSelect(lesson);
                                  }}
                                  className="w-full flex items-center justify-between p-4 bg-black/40 rounded-xl hover:bg-black/60 transition-colors text-left group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-gold group-hover:text-brand-gold transition-all">
                                      <Play size={12} fill="currentColor" />
                                    </div>
                                    <div>
                                      <h5 className="font-medium text-sm group-hover:text-brand-gold transition-colors">{lesson.title}</h5>
                                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{lesson.duration}</span>
                                    </div>
                                  </div>
                                  {progress.completedLessons.includes(lesson.id) && (
                                    <CheckCircle2 size={16} className="text-green-500" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'lesson' && selectedLesson && (
            <motion.div
              key="lesson"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="fixed inset-0 bg-black z-50 flex flex-col pt-12"
            >
              <div className="px-6 flex items-center justify-between mb-8">
                <button 
                  onClick={() => setView('home')}
                  className="p-3 bg-white/5 rounded-full"
                >
                  <ChevronLeft />
                </button>
                <div className="flex gap-2 bg-white/5 p-1 rounded-full">
                  {(['en', 'hi', 'bn', 'hinglish'] as Language[]).map(l => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight transition-all ${
                        language === l ? 'bg-brand-gold text-black' : 'text-gray-500'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-40 space-y-8">
                <div className="flex flex-col items-center">
                  <div className="w-64 h-64 rounded-3xl bg-brand-red/10 border border-brand-red/20 mb-8 flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 to-transparent" />
                    <Waveform size={64} className="text-brand-gold/40 group-hover:scale-110 transition-transform" />
                    {isLoadingAudio && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="flex items-center gap-1">
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity }} className="w-2 h-2 bg-brand-gold rounded-full" />
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, delay: 0.2 }} className="w-2 h-2 bg-brand-gold rounded-full" />
                          <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, delay: 0.4 }} className="w-2 h-2 bg-brand-gold rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-center mb-1">{selectedLesson.title}</h2>
                  <p className="text-brand-gold text-xs font-bold uppercase tracking-widest">{selectedLesson.category}</p>
                </div>

                <div className="space-y-6">
                      <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">The Concept</h3>
                    <p className="text-lg text-gray-200 leading-relaxed italic">
                      "{language === 'hi' ? selectedLesson.content.hi : (language === 'bn' ? selectedLesson.content.bn : selectedLesson.content.en)}"
                    </p>
                  </section>

                  <section className="glass-surface p-6 rounded-2xl border-l-4 border-brand-red">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-red mb-3">Relatable Scenario</h3>
                    <p className="text-sm text-gray-300">
                      {language === 'hi' ? selectedLesson.scenario.hi : (language === 'bn' ? selectedLesson.scenario.bn : selectedLesson.scenario.en)}
                    </p>
                  </section>

                  {/* AI Lesson Feature */}
                  <section className="space-y-4">
                    <button
                      onClick={fetchLessonAdvice}
                      disabled={isAdviceLoading}
                      className="w-full py-4 px-6 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl flex items-center justify-between group hover:bg-brand-gold/20 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles size={20} className="text-brand-gold" />
                        <span className="text-sm font-bold text-brand-gold uppercase tracking-wider">SheMind's Contextual Advice</span>
                      </div>
                      {isAdviceLoading && (
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                          <Waveform size={16} className="text-brand-gold" />
                        </motion.div>
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {lessonAdvice && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-surface p-5 rounded-2xl bg-brand-gold/5 border border-brand-gold/10 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Brain size={48} className="text-brand-gold" />
                          </div>
                          <p className="text-sm text-gray-200 leading-relaxed relative z-10 font-medium">
                            {lessonAdvice}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/10">
                      <h4 className="text-[10px] font-bold uppercase text-green-500 mb-2">What to do</h4>
                      <ul className="text-xs space-y-2">
                        {selectedLesson.tips.do.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-green-500 mt-1.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-4 bg-brand-red/5 rounded-2xl border border-brand-red/10">
                      <h4 className="text-[10px] font-bold uppercase text-brand-red mb-2">What to avoid</h4>
                      <ul className="text-xs space-y-2">
                        {selectedLesson.tips.dont.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-brand-red mt-1.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5 text-center">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    {language === 'en' ? ETHICAL_DISCLAIMER.en : (language === 'hi' ? ETHICAL_DISCLAIMER.hi : ETHICAL_DISCLAIMER.bn)}
                  </p>
                </div>
              </div>

              <div className="fixed bottom-0 left-0 right-0 glass-surface pb-12 pt-6 px-8 rounded-t-[40px] z-[60]">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-center gap-4">
                    <WaveformAnimation isPlaying={isPlaying} />
                  </div>
                  <div className="flex items-center justify-between">
                    <button onClick={() => toggleBookmark(selectedLesson.id)}>
                      <Bookmark 
                        size={24} 
                        className={progress.bookmarks.includes(selectedLesson.id) ? 'text-brand-gold fill-brand-gold' : 'text-gray-500'} 
                      />
                    </button>
                    <button 
                      onClick={playLesson}
                      disabled={isLoadingAudio}
                      className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-xl disabled:opacity-50"
                    >
                      {isPlaying ? <Pause size={32} /> : <Play size={32} fill="black" className="ml-1" />}
                    </button>
                    <button>
                      <Settings size={24} className="text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col items-center pt-8">
                <div className="w-24 h-24 rounded-full bg-brand-gold/10 flex items-center justify-center border-2 border-brand-gold/30 mb-4 p-1 overflow-hidden relative">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-brand-gold/20 rounded-full flex items-center justify-center">
                      <User size={40} className="text-brand-gold" />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{user?.displayName || 'Apprentice Mentor'}</h2>
                <div className="flex items-center gap-2 text-brand-gold mt-1">
                  <TrendingUp size={14} />
                  <span className="text-xs font-bold uppercase tracking-widest">{progress.streak} Day Streak</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-[28px] border-white/5">
                  <h4 className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-widest">Completed</h4>
                  <p className="text-2xl font-black gold-gradient-text">{progress.completedLessons.length}</p>
                </div>
                <div className="glass-card p-6 rounded-[28px] border-white/5">
                  <h4 className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-widest">Bookmarks</h4>
                  <p className="text-2xl font-black gold-gradient-text">{progress.bookmarks.length}</p>
                </div>
              </div>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Learning Language</h3>
                <div className="flex gap-2 p-2 bg-white/5 rounded-[24px]">
                  {(['en', 'hi', 'bn', 'hinglish'] as Language[]).map(l => (
                    <button
                      key={l}
                      onClick={() => setLanguage(l)}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        language === l ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40">Your Growth Goals</h3>
                <div className="space-y-3">
                  {progress.goals.map(goal => (
                    <div key={goal} className="glass-card p-5 rounded-[24px] flex items-center justify-between border-white/5">
                      <span className="text-sm font-bold tracking-tight">{goal}</span>
                      <div className="w-6 h-6 bg-brand-gold/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-brand-gold" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <button 
                onClick={logout}
                className="w-full py-4 text-brand-red font-bold text-sm uppercase tracking-widest bg-brand-red/5 rounded-2xl border border-brand-red/20 shadow-lg mt-8 flex items-center justify-center gap-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black z-[100] flex items-center justify-center px-8"
            >
              <div className="text-center space-y-12 max-w-sm w-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 bg-brand-gold/10 rounded-[40px] flex items-center justify-center rotate-12 mb-4">
                    <Brain size={48} className="text-brand-gold -rotate-12" />
                  </div>
                  <h1 className="text-4xl font-black gold-gradient-text tracking-tighter uppercase leading-none">SheMind</h1>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">
                    Master the art of emotional intelligence and respectful communication.
                  </p>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={login}
                    className="w-full py-5 bg-white text-black rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-4 hover:scale-[1.02] transition-all"
                  >
                    <LogIn size={20} /> Continue with Google
                  </button>
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                    Secure login to save your progress
                  </p>
                </div>

                <div className="pt-12 grid grid-cols-3 gap-8 opacity-20">
                  <div className="flex flex-col items-center gap-2">
                    <Heart size={20} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Empathy</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Brain size={20} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Growth</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <MessageCircle size={20} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Listen</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-full overflow-hidden"
            >
              <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
                {chatHistory.length === 0 && (
                  <div className="glass-surface rounded-3xl p-8 flex flex-col justify-center items-center text-center my-12">
                     <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mb-6">
                      <Sparkles size={40} className="text-brand-gold" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Ask Your AI Mentor</h2>
                    <p className="text-sm text-gray-400 max-w-[240px] leading-relaxed">
                      "I help you understand emotional depth with empathy and respect. How can I assist you today?"
                    </p>
                  </div>
                )}
                {chatHistory.map((chat, i) => (
                  <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                      chat.role === 'user' 
                        ? 'bg-brand-red text-white rounded-tr-none' 
                        : 'glass-surface text-gray-200 rounded-tl-none border-l-2 border-brand-gold'
                    }`}>
                      {chat.parts[0].text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="glass-surface p-4 rounded-2xl rounded-tl-none border-l-2 border-brand-gold">
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity }} className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4 bg-black">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask your mentor..." 
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 ring-brand-gold/50"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-brand-gold text-black p-4 rounded-2xl font-bold disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-surface border-t border-white/5 px-8 pt-4 pb-12 flex justify-between items-center z-50">
        <button 
          onClick={() => setView('home')} 
          className={`group flex flex-col items-center gap-1 ${view === 'home' ? 'text-brand-gold' : 'text-gray-500'}`}
        >
          <Brain size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-tight">Learn</span>
        </button>
        <button 
          onClick={() => setView('chat')}
          className={`group flex flex-col items-center gap-1 ${view === 'chat' ? 'text-brand-gold' : 'text-gray-500'}`}
        >
          <Sparkles size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-tight">AI Guide</span>
        </button>
        <button 
          onClick={() => setView('profile')}
          className={`group flex flex-col items-center gap-1 ${view === 'profile' ? 'text-brand-gold' : 'text-gray-500'}`}
        >
          <TrendingUp size={24} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-tight">Growth</span>
        </button>

        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
            NAYAN CREATION
          </span>
        </div>
      </nav>
    </div>
  );
}
