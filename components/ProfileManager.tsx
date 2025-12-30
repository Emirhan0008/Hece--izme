import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { getProfiles, createProfile, deleteProfile } from '../services/storage';

interface ProfileManagerProps {
  onSelectProfile: (profile: StudentProfile) => void;
  onEnterTeacherMode: () => void;
  onPlayAsGuest: () => void;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ onSelectProfile, onEnterTeacherMode, onPlayAsGuest }) => {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    setProfiles(getProfiles());
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    const profile = createProfile(newName);
    setNewName('');
    setIsAdding(false);
    loadProfiles();
    // Auto select newly created profile
    onSelectProfile(profile);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bu öğrenci profilini silmek istediğine emin misin?')) {
      deleteProfile(id);
      loadProfiles();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full max-w-4xl mx-auto p-4">
      
      <div className="text-center mb-8">
         <h1 className="text-5xl font-black text-indigo-500 tracking-wider handwritten rotate-[-3deg] mb-2">Hece Çiz</h1>
         <h2 className="text-2xl font-bold text-slate-600">Kim Oynuyor?</h2>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full mb-10">
        
        {/* Existing Profiles */}
        {profiles.map(profile => (
          <button
            key={profile.id}
            onClick={() => onSelectProfile(profile)}
            className="relative group bg-white rounded-3xl p-4 shadow-lg border-b-8 border-indigo-100 hover:border-indigo-300 transition-all active:border-b-0 active:translate-y-2 flex flex-col items-center gap-3"
          >
            {/* Avatar */}
            <div className="text-6xl bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-sm group-hover:scale-110 transition-transform">
              {profile.avatar}
            </div>
            
            {/* Name */}
            <div className="text-xl font-black text-slate-700 truncate w-full text-center">
              {profile.name}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-3 bg-slate-50 px-3 py-1 rounded-xl w-full justify-center">
              <div className="flex items-center gap-1" title="Yardımsız Doğrular">
                 <span className="text-yellow-500 text-lg">★</span>
                 <span className="font-bold text-slate-600">{profile.totalCorrectAudio}</span>
              </div>
              <div className="w-px h-4 bg-slate-300"></div>
              <div className="flex items-center gap-1" title="İpucu ile Doğrular">
                 <span className="text-blue-400 text-lg">★</span>
                 <span className="font-bold text-slate-600">{profile.totalCorrectHint}</span>
              </div>
            </div>

            {/* Delete Button (Visible on hover) */}
            <div 
              onClick={(e) => handleDelete(e, profile.id)}
              className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Profili Sil"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </button>
        ))}

        {/* Add New Profile Card */}
        {isAdding ? (
           <form onSubmit={handleCreate} className="bg-white rounded-3xl p-4 shadow-lg border-4 border-dashed border-green-200 flex flex-col items-center justify-center gap-4 animate-fade-in">
              <div className="text-lg font-bold text-green-600">İsim Giriniz:</div>
              <input 
                autoFocus
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-center text-xl font-bold p-2 border-b-2 border-green-300 outline-none placeholder-green-200"
                placeholder="Öğrenci Adı"
                maxLength={12}
              />
              <div className="flex gap-2 w-full">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={!newName.trim()}
                  className="flex-1 py-2 rounded-xl bg-green-500 text-white font-bold hover:bg-green-600 disabled:opacity-50"
                >
                  Ekle
                </button>
              </div>
           </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-slate-50 rounded-3xl p-4 shadow-inner border-4 border-dashed border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group flex flex-col items-center justify-center gap-2 min-h-[200px]"
          >
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-green-500 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
               </svg>
            </div>
            <span className="font-bold text-slate-400 group-hover:text-green-600">Yeni Öğrenci</span>
          </button>
        )}

      </div>

      {/* Guest Play Button */}
      <button 
        onClick={onPlayAsGuest}
        className="w-full max-w-md bg-white border-2 border-slate-200 text-slate-500 font-bold py-3 px-6 rounded-2xl hover:bg-slate-50 hover:text-indigo-500 hover:border-indigo-200 transition-colors mb-6 shadow-sm flex items-center justify-center gap-2"
      >
        <span className="text-xl">👤</span>
        Misafir Olarak Oyna (Kaydedilmez)
      </button>

      {/* Footer: Teacher Mode */}
      <button 
        onClick={onEnterTeacherMode}
        className="text-slate-400 hover:text-indigo-500 font-bold text-sm flex items-center gap-2 px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
        Öğretmen / Sınıf Modu
      </button>

    </div>
  );
};

export default ProfileManager;