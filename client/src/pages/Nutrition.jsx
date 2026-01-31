/**
 * NUTRITION PAGE - Track meals and macros
 */

import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mealAPI } from '../services/api';
import { Card, Button, Input, Toast } from '../components/ui';
import NavBar from '../components/NavBar';

export default function Nutrition() {
    const { user } = useAuth();
    const [meals, setMeals] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({
        name: '', mealType: 'snack', calories: '', protein: '', carbs: '', fats: ''
    });

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const response = await mealAPI.getToday();
                setMeals(response.data.meals);
                setSummary(response.data.summary);
            } catch (error) {
                console.error('Failed to fetch meals:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeals();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.calories) return;
        setSubmitting(true);
        try {
            const response = await mealAPI.create({
                name: formData.name, mealType: formData.mealType,
                calories: Number(formData.calories), protein: Number(formData.protein) || 0,
                carbs: Number(formData.carbs) || 0, fats: Number(formData.fats) || 0
            });
            setMeals(prev => [response.data.meal, ...prev]);
            setSummary(prev => ({
                ...prev,
                totalCalories: (prev?.totalCalories || 0) + Number(formData.calories),
                totalProtein: (prev?.totalProtein || 0) + (Number(formData.protein) || 0),
                totalCarbs: (prev?.totalCarbs || 0) + (Number(formData.carbs) || 0),
                totalFats: (prev?.totalFats || 0) + (Number(formData.fats) || 0)
            }));
            setNotification({ type: 'success', message: 'Meal logged!' });
            setFormData({ name: '', mealType: 'snack', calories: '', protein: '', carbs: '', fats: '' });
            setShowForm(false);
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to log meal' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (mealId) => {
        try {
            await mealAPI.delete(mealId);
            setMeals(prev => prev.filter(m => m._id !== mealId));
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const calorieGoal = user?.dailyCalorieGoal || 2000;
    const caloriesConsumed = summary?.totalCalories || 0;
    const calorieProgress = Math.min((caloriesConsumed / calorieGoal) * 100, 100);

    if (loading) {
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>;
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            <header className="px-6 py-6 max-w-5xl mx-auto border-b border-white/5">
                <h1 className="text-2xl font-bold">Nutrition</h1>
            </header>

            <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
                <Card className="border-green-500/20">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="text-3xl font-bold font-mono">{caloriesConsumed}</div>
                            <div className="text-xs text-zinc-400">of {calorieGoal} kcal</div>
                        </div>
                        <div className={`text-sm px-3 py-1 rounded-full ${caloriesConsumed > calorieGoal ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {calorieGoal - caloriesConsumed} remaining
                        </div>
                    </div>
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${caloriesConsumed > calorieGoal ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${calorieProgress}%` }} />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                        <div><div className="text-purple-400 font-bold">{summary?.totalProtein || 0}g</div><div className="text-xs text-zinc-500">Protein</div></div>
                        <div><div className="text-blue-400 font-bold">{summary?.totalCarbs || 0}g</div><div className="text-xs text-zinc-500">Carbs</div></div>
                        <div><div className="text-yellow-400 font-bold">{summary?.totalFats || 0}g</div><div className="text-xs text-zinc-500">Fats</div></div>
                    </div>
                </Card>

                {!showForm && <Button variant="system" onClick={() => setShowForm(true)} className="w-full"><Plus size={20} /> Log Meal</Button>}

                {showForm && (
                    <Card>
                        <form onSubmit={handleSubmit}>
                            <Input label="Meal Name" name="name" placeholder="Grilled Chicken" value={formData.name} onChange={handleChange} required />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Calories" name="calories" type="number" placeholder="450" value={formData.calories} onChange={handleChange} required />
                                <Input label="Protein (g)" name="protein" type="number" placeholder="30" value={formData.protein} onChange={handleChange} />
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button variant="secondary" type="button" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                                <Button variant="system" type="submit" disabled={submitting} className="flex-1">{submitting ? '...' : 'Log'}</Button>
                            </div>
                        </form>
                    </Card>
                )}

                <div>
                    <h3 className="text-xs text-zinc-500 uppercase mb-4">Today's Log</h3>
                    {meals.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500"><Utensils size={40} className="mx-auto mb-4 opacity-30" /><p>No meals yet</p></div>
                    ) : (
                        <div className="space-y-3">
                            {meals.map(meal => (
                                <div key={meal._id} className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border border-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><Utensils size={16} /></div>
                                        <div><div className="font-medium">{meal.name}</div><div className="text-xs text-zinc-500">{meal.calories} kcal</div></div>
                                    </div>
                                    <button onClick={() => handleDelete(meal._id)} className="opacity-0 group-hover:opacity-100 text-red-400 p-2"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <NavBar />
            {notification && <Toast message={notification.message} type={notification.type} />}
        </div>
    );
}
