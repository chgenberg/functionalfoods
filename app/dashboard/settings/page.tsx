'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { FiUser, FiMail, FiLock, FiBell, FiSave, FiLoader } from 'react-icons/fi';

export default function SettingsPage() {
    const { user, login } = useAuth();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        const payload: Record<string, any> = {};
        if (name !== user?.name) payload.name = name;
        if (email !== user?.email) payload.email = email;
        if (currentPassword && newPassword) {
            payload.currentPassword = currentPassword;
            payload.newPassword = newPassword;
        }

        if (Object.keys(payload).length === 0) {
            setErrorMessage('Du har inte gjort några ändringar.');
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/user/update', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Något gick fel.');
            }

            setSuccessMessage(data.message);
            setCurrentPassword('');
            setNewPassword('');

            // Om API:et returnerade en ny token, uppdatera kontexten
            if (data.token) {
                login(data.token);
            }

        } catch (error: any) {
            setErrorMessage(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const [notifications, setNotifications] = useState({
        newCourses: true,
        communityUpdates: true,
        coachingReminders: false,
    });
    const handleNotificationChange = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Inställningar</h1>
                <p className="text-gray-600 mt-1">Hantera dina kontouppgifter och notifikationer.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FiUser /> Personlig information</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="input-style" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="input-style" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FiLock /> Ändra lösenord</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="currentPassword">Nuvarande lösenord</label>
                        <input type="password" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" className="input-style mt-1" />
                    </div>
                    <div>
                        <label htmlFor="newPassword">Nytt lösenord</label>
                        <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="input-style mt-1" />
                    </div>
                 </div>
            </div>
            
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><FiBell /> Notifikationer</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-800">Nya kurser</h3>
                            <p className="text-sm text-gray-500">Få ett meddelande när nya kurser publiceras.</p>
                        </div>
                        <button onClick={() => handleNotificationChange('newCourses')} type="button" className={`${notifications.newCourses ? 'bg-primary' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
                            <span className={`${notifications.newCourses ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-800">Community-uppdateringar</h3>
                            <p className="text-sm text-gray-500">Få notiser om nya inlägg och svar i forumet.</p>
                        </div>
                        <button onClick={() => handleNotificationChange('communityUpdates')} type="button" className={`${notifications.communityUpdates ? 'bg-primary' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
                            <span className={`${notifications.communityUpdates ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium text-gray-800">Påminnelser om coaching</h3>
                            <p className="text-sm text-gray-500">Bli påmind om dina bokade coachingsamtal.</p>
                        </div>
                        <button onClick={() => handleNotificationChange('coachingReminders')} type="button" className={`${notifications.coachingReminders ? 'bg-primary' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}>
                            <span className={`${notifications.coachingReminders ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex justify-end items-center gap-4">
                {successMessage && <p className="text-green-600">{successMessage}</p>}
                {errorMessage && <p className="text-red-600">{errorMessage}</p>}
                <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={isLoading}>
                    {isLoading ? <FiLoader className="animate-spin" /> : <FiSave />}
                    <span>{isLoading ? 'Sparar...' : 'Spara ändringar'}</span>
                </button>
            </div>

            <style jsx global>{`
                .input-style {
                    @apply w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors;
                }
                .btn-primary {
                    @apply bg-primary hover:bg-accent text-white font-semibold px-5 py-3 rounded-lg transition-colors shadow-sm hover:shadow-md disabled:bg-gray-400;
                }
            `}</style>
        </form>
    );
} 