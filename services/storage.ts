import { StudentProfile } from '../types';

const STORAGE_KEY = 'hece_ciz_profiles';

const AVATARS = ['🐶', '🐱', '🐭', '🐹', '🐰', 'fox', '🐻', '🐼', '🐨', 'tiger', '🦁', '🐮', '🐷', '🐸', '🐵'];

export const getProfiles = (): StudentProfile[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading profiles", e);
    return [];
  }
};

export const createProfile = (name: string): StudentProfile => {
  const profiles = getProfiles();
  
  // Pick a random avatar
  const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  
  const newProfile: StudentProfile = {
    id: Date.now().toString(),
    name: name.trim(),
    avatar: randomAvatar,
    totalCorrectAudio: 0,
    totalCorrectHint: 0,
    createdAt: Date.now()
  };

  profiles.push(newProfile);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  return newProfile;
};

export const deleteProfile = (id: string) => {
  const profiles = getProfiles().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
};

export const updateProgress = (profileId: string, type: 'audio' | 'hint') => {
  const profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === profileId);
  
  if (index !== -1) {
    if (type === 'audio') {
      profiles[index].totalCorrectAudio += 1;
    } else {
      profiles[index].totalCorrectHint += 1;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    return profiles[index];
  }
  return null;
};

export const getProfileById = (id: string): StudentProfile | undefined => {
  const profiles = getProfiles();
  return profiles.find(p => p.id === id);
};