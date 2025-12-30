import React, { useEffect, useState } from 'react';
import { FeedbackState } from '../types';

interface FeedbackOverlayProps {
  state: FeedbackState;
}

const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({ state }) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; speed: number; wobble: number }[]>([]);

  useEffect(() => {
    if (state === FeedbackState.CORRECT) {
      // Generate confetti particles
      const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
      const newParticles = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 50, // Start above screen
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 2 + Math.random() * 3,
        wobble: Math.random() * 10
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [state]);

  if (state === FeedbackState.IDLE || state === FeedbackState.CHECKING) return null;

  if (state === FeedbackState.WRONG) {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
        <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse"></div>
        <div className="bg-red-100 border-4 border-red-500 p-8 rounded-full transform animate-bounce shadow-2xl z-10">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </div>
      </div>
    );
  }

  if (state === FeedbackState.CORRECT) {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {/* Celebration Message */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
             <div className="bg-green-100 border-4 border-green-500 p-8 rounded-full transform animate-bounce shadow-2xl">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
             </div>
        </div>

        {/* CSS-only Confetti */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-3 h-3 rounded-sm animate-fall"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              animation: `fall ${p.speed}s linear forwards`,
              transform: `rotate(${p.wobble}deg)`
            }}
          />
        ))}
        
        <style>{`
          @keyframes fall {
            0% { transform: translateY(0) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
          }
          .animate-fall {
             /* Animation is applied inline for dynamic duration */
          }
        `}</style>
      </div>
    );
  }

  return null;
};

export default FeedbackOverlay;