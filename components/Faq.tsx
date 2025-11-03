import React, { useState, useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';
import { STRINGS } from '../utils/i18n';
import { FAQ_DATA, FaqContent } from '../data/faqData';
import { ChevronDownIcon } from './icons';
import type { AppView } from '../types';

interface FaqProps {
    setView: (view: AppView) => void;
}

export const Faq: React.FC<FaqProps> = ({ setView }) => {
    const { lang } = useContext(SettingsContext);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const faqData = FAQ_DATA[lang] || FAQ_DATA.en;

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    
    const renderAnswer = (answerParts: FaqContent[]) => {
        return (
            <p className="text-gray-600 dark:text-zinc-300 leading-relaxed">
              {answerParts.map((part, index) => {
                if (typeof part === 'string') {
                  return <span key={index}>{part}</span>;
                }
                if (part.type === 'link') {
                  return (
                    <button 
                        key={index} 
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent closing the accordion
                            setView(part.view);
                        }} 
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded-sm"
                    >
                      {part.text}
                    </button>
                  );
                }
                return null;
              })}
            </p>
        );
    };

    return (
        <div className="mt-12">
            <h3 className="text-xl font-bold text-black dark:text-white mb-4">{STRINGS[lang].faqTitle}</h3>
            <div className="space-y-3">
                {faqData.map((item, index) => (
                    <div key={index} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl overflow-hidden transition-all duration-300">
                        <button
                            onClick={() => handleToggle(index)}
                            className="w-full flex justify-between items-center text-left p-4 font-semibold text-gray-800 dark:text-white focus:outline-none focus:bg-gray-50 dark:focus:bg-zinc-800/70"
                            aria-expanded={openIndex === index}
                            aria-controls={`faq-answer-${index}`}
                        >
                            <span className="pr-4">{item.q}</span>
                            <ChevronDownIcon
                                className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <div
                            id={`faq-answer-${index}`}
                            role="region"
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-[500px]' : 'max-h-0'}`}
                        >
                            <div className="p-4 pt-0">
                                {renderAnswer(item.a)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};