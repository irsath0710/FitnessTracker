/**
 * PROFILE PAGE - User settings and body metrics
 */

import React, { useState } from 'react';
import { LogOut, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Card, Button, Toast } from '../components/ui';
import RankBadge, { calculateLevel } from '../components/RankBadge';
import NavBar from '../components/NavBar';

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [formData, setFormData] = useState({
        weight: user?.weight || 70,
        bodyFat: user?.bodyFat || 20,
        dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
        dailyBurnGoal: user?.dailyBurnGoal || 500
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await userAPI.updateProfile({
                weight: Number(formData.weight),
                bodyFat: Number(formData.bodyFat),
                dailyCalorieGoal: Number(formData.dailyCalorieGoal),
                dailyBurnGoal: Number(formData.dailyBurnGoal)
            });
            updateUser(response.data.user);
            setNotification({ type: 'success', message: 'Profile updated!' });
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    React.useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const level = calculateLevel(user?.xp || 0);

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            <main className="max-w-xl mx-auto px-4 pt-8 space-y-6">
                {/* Profile Header */}
                <div className="text-center mb-8 relative">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 mx-auto mb-6 border-[6px] border-zinc-900 shadow-2xl relative z-10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-blue-500/20 blur-xl rounded-full z-0" />
                    <h2 className="text-3xl font-bold mb-1">{user?.username}</h2>
                    <p className="text-blue-400 text-xs tracking-[0.3em] uppercase bg-blue-500/10 inline-block px-3 py-1 rounded-full border border-blue-500/20">
                        Rank {level.rank} Hunter
                    </p>
                </div>

                {/* Rank Card */}
                <Card className="border-blue-500/20 bg-blue-950/10">
                    <RankBadge xp={user?.xp || 0} />
                </Card>

                {/* Stats Card */}
                <Card title="Body Metrics">
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-zinc-400">Weight</span>
                                <span className="text-lg font-mono font-bold">{formData.weight} kg</span>
                            </div>
                            <input
                                type="range" min="40" max="150" value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-zinc-400">Body Fat</span>
                                <span className="text-lg font-mono font-bold">{formData.bodyFat}%</span>
                            </div>
                            <input
                                type="range" min="5" max="50" value={formData.bodyFat}
                                onChange={(e) => setFormData({ ...formData, bodyFat: Number(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    </div>
                </Card>

                {/* Goals Card */}
                <Card title="Daily Goals">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Calorie Goal</label>
                            <input
                                type="number"
                                value={formData.dailyCalorieGoal}
                                onChange={(e) => setFormData({ ...formData, dailyCalorieGoal: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Burn Goal</label>
                            <input
                                type="number"
                                value={formData.dailyBurnGoal}
                                onChange={(e) => setFormData({ ...formData, dailyBurnGoal: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white"
                            />
                        </div>
                    </div>
                </Card>

                <Button variant="system" onClick={handleSave} disabled={saving} className="w-full">
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </Button>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 text-center">
                        <div className="text-2xl font-bold">{user?.streak || 0}</div>
                        <div className="text-xs text-zinc-500">Day Streak</div>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 text-center">
                        <div className="text-2xl font-bold">{(user?.xp || 0).toLocaleString()}</div>
                        <div className="text-xs text-zinc-500">Total XP</div>
                    </div>
                </div>

                <Button variant="secondary" onClick={logout} className="w-full text-red-400 border-red-900/30 hover:bg-red-900/10">
                    <LogOut size={18} /> Log Out
                </Button>
            </main>
            <NavBar />
            {notification && <Toast message={notification.message} type={notification.type} />}
        </div>
    );
}
