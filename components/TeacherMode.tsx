import React, { useState, useRef } from 'react';
import DrawingPad, { DrawingPadRef } from './DrawingPad';
import FeedbackOverlay from './FeedbackOverlay';
import { FeedbackState } from '../types';

interface TeacherModeProps {
  onBack: () => void;
}

// Sound helper duplicated for autonomy
const playSound = (type: 'correct' | 'wrong') => {
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

const TeacherMode: React.FC<TeacherModeProps> = ({ onBack }) => {
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [feedback, setFeedback] = useState<FeedbackState>(FeedbackState.IDLE);
  const drawingRef = useRef<DrawingPadRef>(null);

  const handleClear = () => {
    drawingRef.current?.clear();
    setTool('pen');
    setFeedback(FeedbackState.IDLE);
  };

  const handleManualResult = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setFeedback(FeedbackState.CORRECT);
      playSound('correct');
      // Wait a bit then clear automatically
      setTimeout(() => {
        handleClear();
      }, 2000);
    } else {
      setWrongCount(prev => prev + 1);
      setFeedback(FeedbackState.WRONG);
      playSound('wrong');
      // Wait a bit then clear
      setTimeout(() => {
        handleClear();
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto h-full">
      
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-4">
         <button 
           onClick={onBack}
           className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl"
           title="Menüye Dön"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
         </button>
         
         <h1 className="text-2xl font-black text-indigo-500 tracking-wider">Serbest Çizim</h1>
         
         <div className="w-10"></div> {/* Spacer for alignment */}
      </header>

      {/* Drawing Area - Larger in Teacher Mode */}
      <div className="flex-1 w-full min-h-[400px] bg-white rounded-3xl p-2 shadow-xl border-4 border-indigo-200 relative mb-4">
        <DrawingPad 
          ref={drawingRef} 
          disabled={feedback !== FeedbackState.IDLE}
          showHint={false} 
          tool={tool}
        />
      </div>

      {/* Controls Row */}
      <div className="w-full flex items-center gap-2 mb-4">
         
         {/* Wrong Button */}
         <button 
           onClick={() => handleManualResult(false)}
           className="h-20 w-20 bg-red-500 hover:bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-md border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
           title="Yanlış"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
         </button>

         {/* Tools (Middle) */}
         <div className="flex-1 flex gap-2">
            <button 
                onClick={() => setTool('pen')}
                className={`flex-1 h-20 rounded-2xl flex items-center justify-center shadow-sm border-b-4 transition-all active:border-b-0 active:translate-y-1
                  ${tool === 'pen' 
                    ? 'bg-blue-500 text-white border-blue-700 ring-2 ring-blue-200 ring-offset-2' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                 </svg>
            </button>
            <button 
                onClick={() => setTool('eraser')}
                className={`flex-1 h-20 rounded-2xl flex items-center justify-center shadow-sm border-b-4 transition-all active:border-b-0 active:translate-y-1
                  ${tool === 'eraser' 
                    ? 'bg-pink-500 text-white border-pink-700 ring-2 ring-pink-200 ring-offset-2' 
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
              >
                 <svg width="32" height="32" viewBox="0 0 24 24" fill={tool === 'eraser' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path fill={tool === 'eraser' ? "white" : "none"} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                 </svg>
            </button>
            <button 
              onClick={handleClear}
              className="w-16 h-20 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl flex items-center justify-center shadow-sm border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 transition-all"
              title="Temizle"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
         </div>

         {/* Correct Button */}
         <button 
           onClick={() => handleManualResult(true)}
           className="h-20 w-20 bg-green-500 hover:bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-md border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
           title="Doğru"
         >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
         </button>
      </div>

      {/* Simple Scoreboard */}
      <div className="flex gap-4">
        <div className="bg-red-100 text-red-700 px-6 py-2 rounded-full font-bold shadow-sm border border-red-200 text-xl">
           ✗ {wrongCount}
        </div>
        <div className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-bold shadow-sm border border-green-200 text-xl">
           ✓ {correctCount}
        </div>
      </div>

      <FeedbackOverlay state={feedback} />
    </div>
  );
};

export default TeacherMode;