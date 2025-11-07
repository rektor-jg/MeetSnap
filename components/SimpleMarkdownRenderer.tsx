import React from 'react';

interface SimpleMarkdownRendererProps {
    content: string;
}

export const SimpleMarkdownRenderer: React.FC<SimpleMarkdownRendererProps> = ({ content }) => {
    // Split by newlines and filter out empty lines that are not part of code blocks
    const lines = content.split('\n');

    const elements = lines.map((line, index) => {
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold mt-5 mb-3">{line.substring(3)}</h2>;
        }
        if (line.startsWith('- ')) {
            const itemContent = line.substring(2);
            const parts = itemContent.split('**');
            return (
                <li key={index}>
                    {parts.map((part, i) =>
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                    )}
                </li>
            );
        }
        if (line.trim() === '') {
            return <br key={index} />;
        }
        // Basic bold support in paragraphs
        const parts = line.split('**');
        return (
            <p key={index} className="my-2">
                {parts.map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>
                )}
            </p>
        );
    });

    // Group consecutive list items into <ul>
    const groupedElements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    elements.forEach((el, index) => {
        if (React.isValidElement(el) && el.type === 'li') {
            currentList.push(el);
        } else {
            if (currentList.length > 0) {
                groupedElements.push(<ul key={`ul-${index}`} className="list-disc pl-5 space-y-1 my-3">{currentList}</ul>);
                currentList = [];
            }
            if (React.isValidElement(el) && el.type !== 'br') {
                 groupedElements.push(el);
            }
        }
    });

    if (currentList.length > 0) {
        groupedElements.push(<ul key="ul-last" className="list-disc pl-5 space-y-1 my-3">{currentList}</ul>);
    }

    return <div className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{groupedElements}</div>;
};