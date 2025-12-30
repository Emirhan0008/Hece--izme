import React, { useState } from 'react';
import SyllableGame from './components/SyllableGame';
import TeacherMode from './components/TeacherMode';
import ProfileManager from './components/ProfileManager';
import { StudentProfile } from './types';

type ViewMode = 'profiles' | 'menu' | 'game' | 'teacher';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('profiles');
  const [activeProfile, setActiveProfile] = useState<StudentProfile | null>(null);

  const handleProfileSelect = (profile: StudentProfile) => {
    setActiveProfile(profile);
    setCurrentView('menu');
  };

  const handleGuestPlay = () => {
    setActiveProfile(null);
    setCurrentView('menu');
  };

  if (currentView === 'profiles') {
    return (
       <div className="min-h-screen bg-slate-50 py-2 px-4 select-none">
         <ProfileManager 
           onSelectProfile={handleProfileSelect} 
           onPlayAsGuest={handleGuestPlay}
           onEnterTeacherMode={() => setCurrentView('teacher')} 
         />
       </div>
    );
  }

  if (currentView === 'game') {
    return (
      <div className="min-h-screen bg-slate-50 py-2 px-4 select-none">
        <SyllableGame 
          profile={activeProfile}
          onUpdateScore={(updated) => setActiveProfile(updated)}
          onBack={() => setCurrentView('menu')} 
        />
      </div>
    );
  }

  if (currentView === 'teacher') {
    return (
      <div className="min-h-screen bg-slate-50 py-2 px-4 select-none">
        <TeacherMode onBack={() => {
           // Return to profiles if no user/guest selected, else menu
           (activeProfile !== null) ? setCurrentView('menu') : setCurrentView('profiles');
        }} />
      </div>
    );
  }

  // Menu View
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-4 px-4 select-none">
       
       <div className="mb-6 text-center">
         <h1 className="text-5xl font-black text-indigo-500 tracking-wider handwritten rotate-[-3deg]">Hece Çiz</h1>
         
         {/* Active Profile Header */}
         {activeProfile ? (
           <div className="mt-4 flex items-center justify-center gap-3 bg-white px-6 py-2 rounded-full shadow-sm border border-indigo-100">
             <span className="text-3xl">{activeProfile.avatar}</span>
             <div className="text-left">
               <div className="text-xs text-slate-400 font-bold uppercase">Öğrenci</div>
               <div className="text-xl font-black text-slate-700 leading-none">{activeProfile.name}</div>
             </div>
           </div>
         ) : (
            <div className="mt-4 flex items-center justify-center gap-3 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-200">
              <span className="text-3xl">👤</span>
              <div className="text-left">
                <div className="text-xs text-slate-400 font-bold uppercase">Mod</div>
                <div className="text-xl font-black text-slate-600 leading-none">Misafir</div>
              </div>
            </div>
         )}
       </div>

       <div className="w-full max-w-sm flex flex-col gap-6">
          
          <button 
            onClick={() => setCurrentView('game')}
            className="w-full group relative bg-white rounded-3xl p-6 shadow-xl border-b-8 border-indigo-200 hover:border-indigo-300 transition-all active:border-b-0 active:translate-y-2 text-left flex items-center gap-4"
          >
             <div className="bg-indigo-100 p-4 rounded-2xl text-indigo-600 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
               </svg>
             </div>
             <div>
               <h2 className="text-2xl font-black text-slate-700">Heceleri Öğren</h2>
               <p className="text-slate-400 font-semibold text-sm">Sesli hece çizim oyunu</p>
             </div>
             
             <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
               </svg>
             </div>
          </button>

          <button 
            onClick={() => setCurrentView('teacher')}
            className="w-full group relative bg-white rounded-3xl p-6 shadow-xl border-b-8 border-orange-200 hover:border-orange-300 transition-all active:border-b-0 active:translate-y-2 text-left flex items-center gap-4"
          >
             <div className="bg-orange-100 p-4 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
               </svg>
             </div>
             <div>
               <h2 className="text-2xl font-black text-slate-700">Serbest Çizim</h2>
               <p className="text-slate-400 font-semibold text-sm">Öğretmen / Sınıf Modu</p>
             </div>

             <div className="absolute right-6 opacity-0 group-hover:opacity-100 transition-opacity text-orange-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
               </svg>
             </div>
          </button>

          {/* Change User Button */}
          <button 
             onClick={() => {
               setActiveProfile(null);
               setCurrentView('profiles');
             }}
             className="w-full text-center py-3 text-slate-400 font-bold hover:text-indigo-500 hover:bg-white rounded-xl transition-colors"
          >
            {activeProfile ? "← Farklı Öğrenci Seç" : "← Profil Seç / Oluştur"}
          </button>

       </div>
    </div>
  );
};

export default App;