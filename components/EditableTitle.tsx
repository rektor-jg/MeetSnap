import React, { useState, useRef, useEffect } from 'react';
import { EditIcon, CheckIcon } from './icons';
import { STRINGS } from '../utils/i18n';
import { useSettings } from '../context/SettingsContext';

interface EditableTitleProps {
  initialTitle: string;
  onSave: (newTitle: string) => void;
  placeholder?: string;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({ initialTitle, onSave, placeholder }) => {
  const { lang } = useSettings();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle) {
      onSave(trimmedTitle);
    } else {
      setTitle(initialTitle); // Revert if empty
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setTitle(initialTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
    } else if (e.key === 'Escape') {
        handleCancel();
    }
  };
  
  const handleStartEditing = () => {
    setIsEditing(true);
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            if(isEditing) {
                handleSave();
            }
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, title]);


  if (isEditing) {
    return (
      <div ref={wrapperRef} className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="text-xl sm:text-2xl font-bold bg-gray-100 dark:bg-zinc-800 text-black dark:text-white w-full rounded-md p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Edit session title"
          placeholder={placeholder}
        />
        <button 
          onClick={handleSave} 
          className="p-1.5 rounded-full text-green-600 dark:text-green-500 hover:bg-green-100 dark:hover:bg-green-500/10 focus:outline-none focus:ring-2 focus:ring-green-500 flex-shrink-0"
          aria-label="Save title"
        >
          <CheckIcon className="w-5 h-5"/>
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={handleStartEditing}
      onKeyDown={(e) => { if (e.key === 'Enter') handleStartEditing(); }}
      className="flex items-center gap-2 cursor-pointer p-1 -m-1 rounded-md hover:bg-gray-200/50 dark:hover:bg-zinc-800/50 group min-w-0"
      title={STRINGS[lang].editTitleTooltip}
      tabIndex={0}
      role="button"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white truncate">
        {title || placeholder}
      </h2>
      <EditIcon className="w-5 h-5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
};