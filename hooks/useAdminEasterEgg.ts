import { useState, useCallback } from 'react';

// This hook manages the state for the Admin Panel easter egg.
export const useAdminEasterEgg = () => {
  const [clickCount, setClickCount] = useState(0);
  // We use sessionStorage to keep the panel unlocked during the session.
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem('isAdminUnlocked') === 'true';
    }
    return false;
  });

  const handleClick = useCallback(() => {
    if (isUnlocked) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount >= 5) {
      setIsUnlocked(true);
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('isAdminUnlocked', 'true');
      }
      console.log("Admin Panel Unlocked for this session!");
    }
  }, [clickCount, isUnlocked]);

  return {
    isAdminUnlocked: isUnlocked,
    handleAdminUnlockClick: handleClick,
  };
};
