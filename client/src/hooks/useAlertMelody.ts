import { useCallback, useRef } from 'react';

/**
 * Hook for playing a gentle melody when alerts are triggered
 * Uses Web Audio API to generate pleasant tones
 */
export const useAlertMelody = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context when needed
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a gentle melody with soft bell-like tones
  const playMelody = useCallback(async () => {
    try {
      const audioContext = getAudioContext();
      
      // Resume audio context if suspended (required by browsers for user interaction)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Define a gentle melody with pleasant frequencies
      const notes = [
        { frequency: 523.25, duration: 0.3 }, // C5
        { frequency: 659.25, duration: 0.3 }, // E5
        { frequency: 783.99, duration: 0.5 }, // G5
      ];

      let startTime = audioContext.currentTime;

      notes.forEach((note, index) => {
        // Create oscillator for each note
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Connect audio nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configure oscillator for a soft, bell-like sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.frequency, startTime);

        // Create smooth volume envelope for gentle sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05); // Soft attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration); // Gentle decay

        // Schedule note playback
        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration);

        // Next note starts with slight overlap for smoothness
        startTime += note.duration * 0.8;
      });
    } catch (error) {
      // Fail silently if audio is not supported or blocked
      console.warn('Could not play alert melody:', error);
    }
  }, [getAudioContext]);

  // Cleanup function to close audio context
  const cleanup = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  return {
    playMelody,
    cleanup,
  };
};