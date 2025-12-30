import React, { useState, useEffect, useRef } from 'react';
import DrawingPad, { DrawingPadRef } from './DrawingPad';
import FeedbackOverlay from './FeedbackOverlay';
import { generateSyllables } from '../services/syllables';
import { playSyllable } from '../services/tts';
import { analyzeHandwriting } from '../services/gemini';
import { updateProgress } from '../services/storage'; // Import storage service
import { Syllable, FeedbackState, StudentProfile } from '../types';

interface SyllableGameProps {
  profile: StudentProfile | null; // Profile is now optional (Guest mode)
  onBack: () => void;
  onUpdateScore: (updatedProfile: StudentProfile) => void; 
}

// Helper to play synthesized beeps for UI feedback
const playSound = (type: 'correct' | 'wrong' | 'skip') => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  if (type === 'correct') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } else if (type === 'skip') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } else {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }
};

const SyllableGame: React.FC<SyllableGameProps> = ({ profile, onBack, onUpdateScore }) => {
  const [syllables, setSyllables] = useState<Syllable[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Local session scores (just for this run)
  const [sessionScoreAudio, setSessionScoreAudio] = useState(0); 
  const [sessionScoreHint, setSessionScoreHint] = useState(0); 

  const [feedback, setFeedback] = useState<FeedbackState>(FeedbackState.IDLE);
  const [showHint, setShowHint] = useState(false);
  const [hasPeeked, setHasPeeked] = useState(false); 
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const drawingRef = useRef<DrawingPadRef>(null);

  // Initialize game
  useEffect(() => {
    const list = generateSyllables();
    setSyllables(list);
  }, []);

  // Play audio when syllable changes
  useEffect(() => {
    if (syllables.length > 0 && feedback === FeedbackState.IDLE) {
      const timer = setTimeout(() => {
        playSyllable(syllables[currentIndex].text);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, syllables, feedback]);

  const handleClear = () => {
    drawingRef.current?.clear();
    setFeedback(FeedbackState.IDLE);
    setTool('pen');
  };

  const handleSkip = () => {
    playSound('skip');
    nextSyllable();
  };

  const handleRepeatSound = () => {
     if (syllables[currentIndex]) {
        playSyllable(syllables[currentIndex].text);
     }
  };

  const toggleHint = () => {
    const nextState = !showHint;
    if (nextState) {
      setHasPeeked(true); 
    }
    setShowHint(nextState);
  };

  const handleCheck = async () => {
    if (feedback !== FeedbackState.IDLE || !drawingRef.current) return;
    
    if (drawingRef.current.isEmpty()) {
       alert("Lütfen önce çizim yap!");
       return;
    }

    const imageData = drawingRef.current.getImageData();
    if (!imageData) return;

    setFeedback(FeedbackState.CHECKING);

    const currentSyllable = syllables[currentIndex].text;
    const result = await analyzeHandwriting(imageData, currentSyllable);

    if (result.isCorrect) {
      setFeedback(FeedbackState.CORRECT);
      
      // Determine score type
      const type = hasPeeked ? 'hint' : 'audio';

      // Update Session State (visual only for this run)
      if (type === 'hint') {
        setSessionScoreHint(prev => prev + 1);
      } else {
        setSessionScoreAudio(prev => prev + 1);
      }

      // Only save to storage if a profile exists
      if (profile) {
        const updatedProfile = updateProgress(profile.id, type);
        if (updatedProfile) {
          onUpdateScore(updatedProfile);
        }
      }

      playSound('correct');
      setTimeout(() => {
        nextSyllable();
      }, 2500);
    } else {
      setFeedback(FeedbackState.WRONG);
      playSound('wrong');
      setTimeout(() => {
        setFeedback(FeedbackState.IDLE);
      }, 1500);
    }
  };

  const nextSyllable = () => {
    setFeedback(FeedbackState.IDLE);
    drawingRef.current?.clear();
    setTool('pen');
    setShowHint(false); 
    setHasPeeked(false); 
    setCurrentIndex((prev) => (prev + 1) % syllables.length);
  };

  if (syllables.length === 0) {
    return <div className="flex items-center justify-center h-full text-2xl font-bold text-blue-400">Yükleniyor...</div>;
  }

  const currentText = syllables[currentIndex].text;

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto h-full">
      
      {/* Header Info */}
      <header className="w-full flex justify-between items-center mb-3">
        {/* Back Button */}
        <button 
           onClick={onBack}
           className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl flex items-center gap-2"
           title="Menüye Dön"
        >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
        </button>

        {/* Profile Badge (Conditional) */}
        {profile ? (
          <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            <span className="text-2xl">{profile.avatar}</span>
            <span className="font-bold text-indigo-700">{profile.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
            <span className="text-2xl">👤</span>
            <span className="font-bold text-gray-500">Misafir</span>
          </div>
        )}
        
        {/* Hint & Skip */}
        <div className="flex gap-2">
          <button 
            onClick={toggleHint}
            className={`p-2 rounded-xl transition-colors shadow-sm border ${showHint ? 'bg-indigo-100 border-indigo-300 text-indigo-600' : 'bg-white border-slate-200 text-slate-400'}`}
          >
            {showHint ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>

          <button 
            onClick={handleSkip}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl shadow-sm border border-slate-300 flex flex-col items-center justify-center min-w-[50px]"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
             </svg>
          </button>
        </div>
      </header>

      {/* Target Display */}
      <div className="bg-white rounded-3xl p-2 shadow-lg border-b-4 border-indigo-100 flex flex-col items-center justify-center relative h-32 w-full mb-3">
        <div className={`text-6xl font-black text-slate-800 tracking-widest font-sans transition-opacity duration-300 flex items-center justify-center h-full w-full ${showHint ? 'opacity-100' : 'opacity-0 blur-xl select-none'}`}>
          {currentText}
        </div>
      </div>

      {/* Drawing Area */}
      <div className="flex-1 w-full min-h-[300px] bg-white rounded-3xl p-2 shadow-xl border-4 border-indigo-200 relative mb-3">
          <DrawingPad 
            ref={drawingRef} 
            disabled={feedback === FeedbackState.CHECKING || feedback === FeedbackState.CORRECT} 
            showHint={showHint}
            highlightBackground={showHint || hasPeeked} 
            hintText={currentText}
            tool={tool}
          />
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 justify-between items-center px-1 w-full mb-3">
            <button 
              onClick={handleRepeatSound}
              className="w-16 h-16 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-2xl flex items-center justify-center shadow-sm border-b-4 border-yellow-300 active:border-b-0 active:translate-y-1 transition-all flex-shrink-0"
              title="Tekrar Dinle"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            </button>
            <div className="w-px h-10 bg-slate-200 mx-1"></div>
            <button 
              onClick={() => setTool('pen')}
              className={`flex-1 h-16 rounded-2xl flex items-center justify-center shadow-sm border-b-4 transition-all active:border-b-0 active:translate-y-1
                ${tool === 'pen' 
                  ? 'bg-blue-500 text-white border-blue-700 ring-2 ring-blue-200 ring-offset-2' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              title="Kalem"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>
            <button 
              onClick={() => setTool('eraser')}
              className={`flex-1 h-16 rounded-2xl flex items-center justify-center shadow-sm border-b-4 transition-all active:border-b-0 active:translate-y-1
                ${tool === 'eraser' 
                  ? 'bg-pink-500 text-white border-pink-700 ring-2 ring-pink-200 ring-offset-2' 
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              title="Silgi"
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill={tool === 'eraser' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path fill={tool === 'eraser' ? "white" : "none"} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
            </button>
            <div className="w-px h-10 bg-slate-200 mx-1"></div>
            <button 
              onClick={handleClear}
              className="w-16 h-16 bg-red-100 hover:bg-red-200 text-red-600 rounded-2xl flex items-center justify-center shadow-sm border-b-4 border-red-300 active:border-b-0 active:translate-y-1 transition-all flex-shrink-0"
              title="Hepsini Sil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
      </div>

      {/* Action Button */}
      <div className="w-full">
        <button
          onClick={handleCheck}
          disabled={feedback !== FeedbackState.IDLE}
          className={`w-full py-4 rounded-2xl text-2xl font-black shadow-lg transform transition-all active:scale-95 active:translate-y-1
            ${feedback === FeedbackState.CHECKING 
              ? 'bg-yellow-400 text-white cursor-wait' 
              : feedback === FeedbackState.CORRECT
              ? 'bg-green-500 text-white'
              : 'bg-indigo-500 hover:bg-indigo-600 text-white border-b-8 border-indigo-700 active:border-b-0'
            }
          `}
        >
          {feedback === FeedbackState.CHECKING ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Kontrol Ediliyor...
            </span>
          ) : feedback === FeedbackState.CORRECT ? (
            "HARİKA! 🎉"
          ) : (
            "KONTROL ET"
          )}
        </button>
      </div>

      {/* Footer Score (Session Stats) */}
      <footer className="w-full max-w-lg mt-3 flex justify-center pb-2 gap-4">
        {/* Audio Score */}
        <div className="bg-green-100 text-green-700 px-5 py-2 rounded-full font-bold shadow-sm border border-green-200 flex items-center gap-2" title="Bu oturumda yardımsız yapılanlar">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
           </svg>
           <span className="text-xl">{sessionScoreAudio}</span>
        </div>

        {/* Hint Score */}
        <div className="bg-blue-100 text-blue-700 px-5 py-2 rounded-full font-bold shadow-sm border border-blue-200 flex items-center gap-2" title="Bu oturumda ipucu ile yapılanlar">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
           </svg>
           <span className="text-xl">{sessionScoreHint}</span>
        </div>
      </footer>

      <FeedbackOverlay state={feedback} />
    </div>
  );
};

export default SyllableGame;