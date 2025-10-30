import { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';

export const useMatrixEasterEgg = () => {
  const { theme, setTheme } = useSettings();
  const [clickCount, setClickCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isMatrix, setIsMatrix] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isMatrix) {
      root.classList.add('matrix-theme');
      root.classList.remove('dark'); // Matrix theme handles its own dark mode
    } else {
      root.classList.remove('matrix-theme');
      // Re-apply standard theme when matrix is off
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, isMatrix]);

  const handleThemeToggle = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
    
    if (!isMatrix) {
        const newCount = clickCount + 1;
        setClickCount(newCount);
    
        if (newCount >= 10) {
            setIsActive(true);
        }
    }
  }, [clickCount, isMatrix, setTheme]);

  const activateMatrixTheme = useCallback(() => {
    setIsActive(false);
    setIsMatrix(true);
    setClickCount(0); // Reset for re-triggering after refresh
  }, []);

  return {
    isEasterEggActive: isActive,
    isMatrixTheme: isMatrix,
    activateMatrixTheme,
    handleThemeToggle,
  };
};