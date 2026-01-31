/**
 * ============================================
 * WORKOUT PAGE
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * This page allows users to:
 * - View available workout types
 * - Log completed workouts
 * - See workout history
 * - Earn XP and maintain streaks
 */

import React, { useState, useEffect } from 'react';
import { Zap, ChevronRight, Trophy, Clock, Flame, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../services/api';
import { Card, Button, Input, Toast } from '../components/ui';
import NavBar from '../components/NavBar';

// Workout type icons/colors
const workoutStyles = {
    running: { color: 'blue', icon: '🏃' },
    walking: { color: 'green', icon: '🚶' },
    cycling: { color: 'yellow', icon: '🚴' },
    pushups: { color: 'red', icon: '💪' },
    weight_lifting: { color: 'purple', icon: '🏋️' },
    yoga: { color: 'pink', icon: '🧘' },
    pullups: { color: 'cyan', icon: '🔺' },
    squats: { color: 'orange', icon: '🦵' },
    other: { color: 'zinc', icon: '🏅' }
};

export default function Workout() {
    const { user, updateUser } = useAuth();
    const [workoutTypes, setWorkoutTypes] = useState([]);
    const [recentWorkouts, setRecentWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [duration, setDuration] = useState(30);
    const [intensity, setIntensity] = useState('moderate');
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    // Fetch workout types and recent workouts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesRes, workoutsRes] = await Promise.all([
                    workoutAPI.getTypes(),
                    workoutAPI.getAll({ limit: 5 })
                ]);
                setWorkoutTypes(typesRes.data.types);
                setRecentWorkouts(workoutsRes.data.workouts);
            } catch (error) {
                console.error('Failed to fetch workout data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSelectWorkout = (type) => {
        setSelectedType(type);
        setShowForm(true);
    };

    const handleSubmitWorkout = async () => {
        if (!selectedType) return;

        setSubmitting(true);
        try {
            const response = await workoutAPI.create({
                type: selectedType.type,
                duration: Number(duration),
                intensity
            });

            // Update user XP
            if (response.data.user) {
                updateUser({
                    xp: response.data.user.xp,
                    streak: response.data.user.streak
                });
            }

            // Add to recent workouts
            setRecentWorkouts(prev => [response.data.workout, ...prev.slice(0, 4)]);

            // Show success notification
            setNotification({
                type: 'success',
                message: `Quest Complete! +${response.data.workout.xpEarned} XP`
            });

            // Reset form
            setShowForm(false);
            setSelectedType(null);
            setDuration(30);
            setIntensity('moderate');

        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to log workout'
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Clear notification after 3s
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            {/* Header */}
            <header className="px-6 py-6 max-w-5xl mx-auto border-b border-white/5">
                <h1 className="text-2xl font-bold">Daily Quests</h1>
                <p className="text-zinc-500 text-sm mt-1">Complete workouts to earn XP and maintain your streak</p>
            </header>

            <main className="max-w-xl mx-auto px-4 md:px-6 pt-6 space-y-6 animate-fade-in">

                {/* Workout Form Modal */}
                {showForm && selectedType && (
                    <Card className="border-blue-500/30">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-4xl">{workoutStyles[selectedType.type]?.icon || '🏅'}</div>
                            <div>
                                <h3 className="text-xl font-bold capitalize">{selectedType.type.replace('_', ' ')}</h3>
                                <p className="text-zinc-400 text-sm">
                                    ~{selectedType.caloriesPer30Min} kcal / 30 min
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                                    Duration: {duration} minutes
                                </label>
                                <input
                                    type="range"
                                    min="5"
                                    max="180"
                                    step="5"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                    <span>5 min</span>
                                    <span>180 min</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                                    Intensity
                                </label>
                                <div className="flex gap-2">
                                    {['low', 'moderate', 'high'].map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setIntensity(level)}
                                            className={`flex-1 py-2 px-4 rounded-xl capitalize transition-all ${intensity === level
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-zinc-800/50 rounded-xl p-4 mt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400">Estimated Calories</span>
                                    <span className="text-orange-400 font-mono">
                                        ~{Math.round(selectedType.caloriesPer30Min * (duration / 30) * (intensity === 'high' ? 1.2 : intensity === 'low' ? 0.8 : 1))} kcal
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-zinc-400">XP Reward</span>
                                    <span className="text-blue-400 font-mono">
                                        ~{Math.round(selectedType.caloriesPer30Min * (duration / 30) * 0.5)} XP
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowForm(false);
                                        setSelectedType(null);
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="system"
                                    onClick={handleSubmitWorkout}
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    {submitting ? 'Logging...' : 'Complete Quest'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Workout Types Grid */}
                {!showForm && (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-500 uppercase tracking-wider">Available Quests</span>
                            <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                                {workoutTypes.length} types
                            </span>
                        </div>

                        <div className="space-y-3">
                            {workoutTypes.slice(0, 8).map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => handleSelectWorkout(type)}
                                    className="w-full bg-zinc-900/60 hover:bg-zinc-800 backdrop-blur border border-white/5 hover:border-blue-500/30 p-5 rounded-2xl flex items-center justify-between group transition-all duration-300"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform border border-white/5">
                                            {workoutStyles[type.type]?.icon || '🏅'}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-lg capitalize">
                                                {type.type.replace('_', ' ')}
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                                <Flame size={10} className="text-orange-400" />
                                                ~{type.caloriesPer30Min} kcal / 30 min
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <ChevronRight size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Streak Bonus Card */}
                <div className="mt-8 p-6 rounded-3xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/10 text-center">
                    <Trophy className="mx-auto text-yellow-500 mb-2" size={32} />
                    <h3 className="font-bold text-lg">
                        {user?.streak > 0 ? 'Streak Bonus Active' : 'Start Your Streak'}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                        {user?.streak > 0
                            ? `You're on a ${user.streak}-day streak! Keep it going!`
                            : 'Complete a workout to start building your streak'}
                    </p>
                </div>

                {/* Recent Workouts */}
                {recentWorkouts.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Recent Activity</h3>
                        <div className="space-y-2">
                            {recentWorkouts.map(workout => (
                                <div
                                    key={workout.id || workout._id}
                                    className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-xl border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{workoutStyles[workout.type]?.icon || '🏅'}</span>
                                        <div>
                                            <div className="font-medium capitalize">{workout.type?.replace('_', ' ')}</div>
                                            <div className="text-xs text-zinc-500">
                                                {workout.duration} min • {new Date(workout.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-orange-400 text-sm font-mono">{workout.caloriesBurned} kcal</div>
                                        <div className="text-blue-400 text-xs">+{workout.xpEarned} XP</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <NavBar />

            {/* Notification Toast */}
            {notification && (
                <Toast message={notification.message} type={notification.type} />
            )}
        </div>
    );
}
