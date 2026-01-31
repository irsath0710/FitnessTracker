/**
 * ============================================
 * DASHBOARD PAGE
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * This is the main page users see after logging in.
 * It displays:
 * - 3D body visualization
 * - Current stats (calories, workouts)
 * - Progress charts
 * - Gamification rank
 * 
 * useEffect hooks fetch data when component mounts.
 */

import React, { useState, useEffect } from 'react';
import { Flame, Utensils, Target } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { userAPI, progressAPI } from '../services/api';
import { Card, StatCard, LoadingScreen } from '../components/ui';
import RankBadge from '../components/RankBadge';
import BodyVisualizer from '../components/BodyVisualizer';
import NavBar from '../components/NavBar';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await userAPI.getStats();
                setStats(response.data.stats);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    // Format weekly data for chart
    const chartData = stats?.weekly?.meals?.map(day => ({
        day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
        calories: day.calories
    })) || [];

    // Add burn data if available
    const weeklyBurnData = stats?.recentWorkouts?.reduce((acc, workout) => {
        const day = new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short' });
        acc[day] = (acc[day] || 0) + workout.caloriesBurned;
        return acc;
    }, {});

    const combinedChartData = chartData.length > 0 ? chartData : [
        { day: 'Mon', calories: 0, burn: 0 },
        { day: 'Tue', calories: 0, burn: 0 },
        { day: 'Wed', calories: 0, burn: 0 },
        { day: 'Thu', calories: 0, burn: 0 },
        { day: 'Fri', calories: 0, burn: 0 },
        { day: 'Sat', calories: 0, burn: 0 },
        { day: 'Sun', calories: 0, burn: 0 }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center max-w-5xl mx-auto border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-40">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">{user?.username}</h2>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                            <Flame size={10} fill="currentColor" /> {user?.streak || 0} Day Streak
                        </span>
                        <span className="bg-zinc-800 px-2 py-0.5 rounded-full border border-white/5">
                            {stats?.user?.level?.rank || 'E'} Rank
                        </span>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 ring-2 ring-black ring-offset-2 ring-offset-zinc-800" />
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">

                    {/* Left Column: 3D Visualizer & Rank */}
                    <div className="md:col-span-5 space-y-6">
                        {/* 3D Body Card */}
                        <Card className="h-[500px] relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-0 border-blue-500/20">
                            <BodyVisualizer
                                weight={user?.weight || 70}
                                bodyFat={user?.bodyFat || 20}
                                gender={user?.gender || 'male'}
                                height={user?.height || 170}
                            />
                        </Card>

                        {/* Rank Card */}
                        <Card className="border-blue-500/20 bg-blue-950/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
                            <RankBadge xp={user?.xp || 0} />
                        </Card>
                    </div>

                    {/* Right Column: Stats & Charts */}
                    <div className="md:col-span-7 space-y-6">

                        {/* Daily Overview Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                icon={<Flame size={20} />}
                                value={stats?.today?.caloriesBurned || 0}
                                label="kcal burned today"
                                goal={user?.dailyBurnGoal || 500}
                                color="orange"
                            />
                            <StatCard
                                icon={<Utensils size={20} />}
                                value={stats?.today?.caloriesConsumed || 0}
                                label="kcal consumed"
                                goal={user?.dailyCalorieGoal || 2000}
                                color="green"
                            />
                        </div>

                        {/* Activity Chart */}
                        <Card title="Activity Analysis" className="min-h-[300px]">
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={combinedChartData}>
                                        <defs>
                                            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis
                                            dataKey="day"
                                            stroke="#525252"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#525252"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#09090b',
                                                borderColor: '#27272a',
                                                borderRadius: '8px',
                                                fontSize: '12px'
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="calories"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorCalories)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Macro Split */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { name: 'Protein', value: stats?.today?.protein || 0, color: 'bg-purple-500' },
                                { name: 'Carbs', value: stats?.today?.carbs || 0, color: 'bg-blue-500' },
                                { name: 'Fats', value: stats?.today?.fats || 0, color: 'bg-yellow-500' }
                            ].map((macro) => (
                                <div
                                    key={macro.name}
                                    className="bg-zinc-900/40 rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:bg-zinc-800/60 transition-colors"
                                >
                                    <div className={`absolute top-0 left-0 w-1 h-full ${macro.color}`} />
                                    <div className="text-[10px] text-zinc-500 uppercase mb-2 tracking-widest">
                                        {macro.name}
                                    </div>
                                    <div className="text-lg font-bold">{macro.value}g</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <NavBar />
        </div>
    );
}
