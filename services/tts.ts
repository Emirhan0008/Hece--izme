// This service now prioritizes local MP3 files for natural human voice.
// It falls back to Browser Native TTS if the MP3 file is not found.

let audioContext: AudioContext | null = null;

// Helper to ensure voices are loaded (for fallback)
const waitForVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    setTimeout(() => resolve([]), 1000);
  });
};

// Fallback: Use browser API
async function speakWithBrowser(text: string): Promise<boolean> {
    if (!('speechSynthesis' in window)) return false;
    
    const voices = await waitForVoices();
    const trVoice = voices.find(v => v.lang === 'tr-TR' || v.lang === 'tr_TR') || 
                    voices.find(v => v.lang.startsWith('tr'));

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.toLocaleLowerCase('tr-TR'));
    utterance.rate = 0.8; 
    utterance.lang = 'tr-TR';
    
    if (trVoice) {
        utterance.voice = trVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
}

export const playSyllable = async (text: string) => {
  // 1. Try to play the MP3 file first
  // Expects files to be in a folder named 'syllables' in the public directory
  // Naming convention: lowercase turkish (e.g., "ÇÖ" -> "çö.mp3")
  const filename = text.toLocaleLowerCase('tr-TR');
  const audioPath = `/syllables/${filename}.mp3`;
  
  const audio = new Audio(audioPath);

  try {
    // Attempt to play the audio file
    await audio.play();
  } catch (error) {
    // 2. If file is missing or error occurs, use fallback
    // console.warn(`MP3 not found for ${filename}, using fallback TTS.`);
    await speakWithBrowser(text);
  }
};