import React, { useMemo, useState, useRef } from 'react';
import type { Session, AppView } from '../types';
import { ChevronLeftIcon, TrashIcon, ArrowPathIcon, CodeBracketIcon, UploadIcon, DownloadIcon, ExclamationTriangleIcon } from './icons';
import { useSettings } from '../context/SettingsContext';
import { ApiKeyManager } from './ApiKeyManager';

interface AdminViewProps {
  sessions: Session[];
  setView: (view: AppView) => void;
  deleteSession: (id: string) => void;
  reprocessSession: (id: string) => void;
  deleteAllSessions: () => void;
  importSessions: (sessions: Record<string, Session>) => void;
}

const StatCard: React.FC<{ title: string; value: number | string, colorClass: string }> = ({ title, value, colorClass }) => (
    <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50">
        <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${colorClass}`}>{value}</p>
    </div>
);

export const AdminView: React.FC<AdminViewProps> = ({ sessions, setView, deleteSession, reprocessSession, deleteAllSessions, importSessions }) => {
    const [expandedJsonId, setExpandedJsonId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { lang } = useSettings();

    const stats = useMemo(() => {
        return {
            total: sessions.length,
            done: sessions.filter(s => s.status === 'DONE').length,
            processing: sessions.filter(s => s.status === 'PROCESSING').length,
            queued: sessions.filter(s => s.status === 'QUEUED').length,
            error: sessions.filter(s => s.status === 'ERROR').length,
        };
    }, [sessions]);
    
    const handleExport = () => {
        const dataStr = JSON.stringify(sessions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `meetsnap_sessions_export_${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (typeof result === 'string') {
                    const parsed = JSON.parse(result);
                    // The useSessions hook expects an object, not an array
                    if (Array.isArray(parsed)) {
                        const sessionsObject = parsed.reduce((acc, session) => {
                            acc[session.id] = session;
                            return acc;
                        }, {});
                        importSessions(sessionsObject);
                    } else {
                        importSessions(parsed);
                    }
                }
            } catch (err) {
                alert('Failed to parse JSON file.');
                console.error(err);
            }
        };
        reader.readAsText(file);
        // Reset file input
        event.target.value = '';
    };

    return (
        <div className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800/50 rounded-xl shadow-lg p-4 sm:p-6 space-y-8">
            <header className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800/50">
                <button
                    onClick={() => setView({ type: 'home' })}
                    className="p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-black dark:text-white">Admin Panel</h2>
            </header>

            {/* Statistics Section */}
            <section>
                <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <StatCard title="Total Sessions" value={stats.total} colorClass="text-black dark:text-white" />
                    <StatCard title="Done" value={stats.done} colorClass="text-green-600 dark:text-green-400" />
                    <StatCard title="Processing" value={stats.processing} colorClass="text-blue-600 dark:text-blue-400" />
                    <StatCard title="Queued" value={stats.queued} colorClass="text-yellow-600 dark:text-yellow-400" />
                    <StatCard title="Error" value={stats.error} colorClass="text-red-600 dark:text-red-400" />
                </div>
            </section>
            
            {/* Configuration Section */}
            <section>
                <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Configuration</h3>
                <ApiKeyManager />
            </section>

            {/* Session Management Section */}
            <section>
                <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Session Management</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-zinc-700/50">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-zinc-400">
                        <thead className="text-xs text-gray-700 dark:text-zinc-300 uppercase bg-gray-100 dark:bg-zinc-800">
                            <tr>
                                <th scope="col" className="px-6 py-3">Title</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Created At</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map(session => (
                                <React.Fragment key={session.id}>
                                    <tr className="bg-white dark:bg-zinc-900/50 hover:bg-gray-50 dark:hover:bg-zinc-800/70 border-b dark:border-zinc-700/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">{session.title || 'Untitled'}</td>
                                        <td className="px-6 py-4">{session.status}</td>
                                        <td className="px-6 py-4">{new Date(session.createdAt).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button onClick={() => setExpandedJsonId(expandedJsonId === session.id ? null : session.id)} className="p-1.5 text-gray-500 hover:text-indigo-500 rounded-md" title="View JSON"><CodeBracketIcon className="w-5 h-5"/></button>
                                            <button onClick={() => reprocessSession(session.id)} className="p-1.5 text-gray-500 hover:text-blue-500 rounded-md disabled:opacity-30 disabled:cursor-not-allowed" title="Reprocess" disabled={!session.audioBlob}><ArrowPathIcon className="w-5 h-5"/></button>
                                            <button onClick={() => { if(window.confirm('Delete this session?')) deleteSession(session.id) }} className="p-1.5 text-gray-500 hover:text-red-500 rounded-md" title="Delete"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                    {expandedJsonId === session.id && (
                                        <tr className="bg-gray-100 dark:bg-zinc-800">
                                            <td colSpan={4} className="p-4">
                                                <pre className="text-xs bg-white dark:bg-black/50 p-4 rounded-md overflow-x-auto text-gray-800 dark:text-zinc-200 border border-gray-200 dark:border-zinc-700">
                                                    <code>{JSON.stringify(session, (key, value) => key === 'audioBlob' ? '[Blob]' : value, 2)}</code>
                                                </pre>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

             {/* Global Actions Section */}
            <section>
                <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">Global Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-800/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-700/50 space-y-2">
                        <h4 className="font-semibold text-black dark:text-white">Export / Import</h4>
                        <p className="text-xs text-gray-500 dark:text-zinc-400">Save or load all session data from a JSON file.</p>
                        <div className="flex items-center gap-2 pt-2">
                            <button onClick={handleExport} className="w-full flex items-center justify-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-black dark:text-white font-bold py-2 px-4 rounded-lg">
                                <DownloadIcon className="w-4 h-4"/> Export
                            </button>
                            <button onClick={handleImportClick} className="w-full flex items-center justify-center gap-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-black dark:text-white font-bold py-2 px-4 rounded-lg">
                                <UploadIcon className="w-4 h-4"/> Import
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                        </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-500/20 space-y-2">
                         <h4 className="font-semibold text-red-800 dark:text-red-300 flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5" /> Danger Zone</h4>
                         <p className="text-xs text-red-700 dark:text-red-400">These actions are irreversible. Be careful!</p>
                         <div className="pt-2">
                            <button onClick={deleteAllSessions} className="w-full flex items-center justify-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                                <TrashIcon className="w-4 h-4" /> Delete All Sessions
                            </button>
                         </div>
                    </div>
                </div>
            </section>

        </div>
    );
};