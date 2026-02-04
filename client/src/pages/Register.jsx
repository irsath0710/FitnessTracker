/**
 * ============================================
 * REGISTER PAGE - Enhanced with Visual Body Fat Selector
 * ============================================
 * 
 * Features:
 * - Multi-step registration form
 * - Interactive 3D body fat visualization
 * - Visual body fat percentage selector with reference images
 * - Real-time preview of body proportions
 */

import React, { useState, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { Scale, Ruler, User, Target, ChevronLeft, ChevronRight } from 'lucide-react';

// Lazy load BodyVisualizer for registration preview
const BodyVisualizer = React.lazy(() => import('../components/BodyVisualizer'));

export default function Register() {
    const navigate = useNavigate();
    const { register, error } = useAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        height: 170,
        weight: 70,
        age: 25,
        gender: 'male',
        bodyFat: 20,
        goal: 'maintenance'
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};

        if (!formData.username || formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }
        if (!formData.email || !formData.email.includes('@')) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            height: Number(formData.height),
            weight: Number(formData.weight),
            age: Number(formData.age),
            gender: formData.gender,
            bodyFat: Number(formData.bodyFat),
            goal: formData.goal
        });

        if (result.success) {
            navigate('/');
        }

        setLoading(false);
    };

    // Enhanced body fat reference with visual descriptions and body type
    const bodyFatRanges = formData.gender === 'female' ? [
        { value: 14, label: '10-15%', desc: 'Essential fat, very lean', emoji: '🏆', category: 'Essential' },
        { value: 18, label: '16-20%', desc: 'Athletes, visible abs', emoji: '💪', category: 'Athletic' },
        { value: 24, label: '21-25%', desc: 'Fitness level, toned', emoji: '🏃‍♀️', category: 'Fitness' },
        { value: 28, label: '26-30%', desc: 'Average, healthy', emoji: '✨', category: 'Average' },
        { value: 34, label: '31-35%', desc: 'Above average', emoji: '🌟', category: 'Above Avg' },
        { value: 40, label: '36%+', desc: 'Higher body fat', emoji: '💫', category: 'High' },
    ] : [
        { value: 8, label: '6-10%', desc: 'Competition ready, veins visible', emoji: '🏆', category: 'Essential' },
        { value: 12, label: '10-14%', desc: 'Athletes, six-pack visible', emoji: '💪', category: 'Athletic' },
        { value: 18, label: '15-19%', desc: 'Fit, some ab definition', emoji: '🏃', category: 'Fitness' },
        { value: 23, label: '20-24%', desc: 'Average, soft look', emoji: '✨', category: 'Average' },
        { value: 28, label: '25-29%', desc: 'Above average', emoji: '🌟', category: 'Above Avg' },
        { value: 35, label: '30%+', desc: 'Higher body fat', emoji: '💫', category: 'High' },
    ];

    // Get current body fat category
    const getCurrentCategory = () => {
        const bf = formData.bodyFat;
        const ranges = formData.gender === 'female' 
            ? { essential: 15, athletic: 20, fitness: 25, average: 30 }
            : { essential: 10, athletic: 14, fitness: 19, average: 24 };
        
        if (bf <= ranges.essential) return { name: 'Essential', color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/30' };
        if (bf <= ranges.athletic) return { name: 'Athletic', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' };
        if (bf <= ranges.fitness) return { name: 'Fitness', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
        if (bf <= ranges.average) return { name: 'Average', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' };
        return { name: 'Above Average', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    };

    const category = getCurrentCategory();

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-4xl z-10">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter mb-2 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                        CREATE ACCOUNT
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Step {step} of 2: {step === 1 ? 'Account Info' : 'Body Profile'}
                    </p>

                    {/* Progress Indicator */}
                    <div className="flex gap-2 justify-center mt-4">
                        <div className={`h-1 w-16 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-zinc-700'}`} />
                        <div className={`h-1 w-16 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-zinc-700'}`} />
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        /* Step 1: Account Info - Centered */
                        <div className="max-w-md mx-auto bg-zinc-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Username"
                                name="username"
                                placeholder="Your player name"
                                value={formData.username}
                                onChange={handleChange}
                                error={errors.username}
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="player@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                required
                            />

                            <Button
                                type="button"
                                onClick={handleNext}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white border-0"
                            >
                                Continue →
                            </Button>

                            <p className="text-center text-sm text-zinc-500 mt-6">
                                Already a Player?{' '}
                                <Link to="/login" className="text-blue-400 hover:text-blue-300">
                                    Login
                                </Link>
                            </p>
                        </div>
                    ) : (
                        /* Step 2: Body Profile with 3D Preview */
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left: 3D Body Preview */}
                            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden">
                                <div className="p-4 border-b border-white/10">
                                    <h3 className="text-lg font-bold text-center">Body Preview</h3>
                                    <p className="text-xs text-zinc-500 text-center mt-1">Adjust settings to see changes</p>
                                </div>
                                <div className="h-[350px] relative">
                                    <Suspense fallback={
                                        <div className="h-full flex items-center justify-center">
                                            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                        </div>
                                    }>
                                        <BodyVisualizer
                                            weight={Number(formData.weight) || 70}
                                            height={Number(formData.height) || 170}
                                            bodyFat={Number(formData.bodyFat) || 20}
                                            gender={formData.gender}
                                            compact={true}
                                        />
                                    </Suspense>
                                </div>
                                {/* Current Stats Summary */}
                                <div className="p-4 bg-zinc-950/50 border-t border-white/5">
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div>
                                            <div className="text-2xl font-bold text-blue-400">{formData.height}</div>
                                            <div className="text-[10px] text-zinc-500 uppercase">Height cm</div>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-green-400">{formData.weight}</div>
                                            <div className="text-[10px] text-zinc-500 uppercase">Weight kg</div>
                                        </div>
                                        <div>
                                            <div className={`text-2xl font-bold ${category.color}`}>{formData.bodyFat}%</div>
                                            <div className="text-[10px] text-zinc-500 uppercase">Body Fat</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Form Fields */}
                            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-2xl">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Height & Weight */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                                            <Ruler size={12} /> Height (cm)
                                        </label>
                                        <input
                                            type="number"
                                            name="height"
                                            value={formData.height}
                                            onChange={handleChange}
                                            min="100"
                                            max="250"
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                                            <Scale size={12} /> Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            name="weight"
                                            value={formData.weight}
                                            onChange={handleChange}
                                            min="30"
                                            max="300"
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                </div>

                                {/* Age & Gender */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">Age</label>
                                        <input
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            min="13"
                                            max="100"
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                                            <User size={12} /> Gender
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Body Fat Visual Selector */}
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs uppercase tracking-wider text-zinc-500">
                                            Estimated Body Fat %
                                        </label>
                                        <span className={`text-sm px-3 py-1 rounded-full ${category.bg} ${category.color} ${category.border} border font-medium`}>
                                            {category.name}
                                        </span>
                                    </div>
                                    
                                    {/* Body Fat Slider */}
                                    <div className="mb-3">
                                        <div className="relative pt-1">
                                            <input
                                                type="range"
                                                min={formData.gender === 'female' ? 10 : 5}
                                                max={45}
                                                value={formData.bodyFat}
                                                onChange={(e) => setFormData(prev => ({ ...prev, bodyFat: parseInt(e.target.value) }))}
                                                className="w-full h-2 bg-gradient-to-r from-cyan-500 via-green-500 via-amber-500 to-red-500 rounded-lg appearance-none cursor-pointer slider-thumb"
                                                style={{
                                                    background: `linear-gradient(to right, #06b6d4, #22c55e, #f59e0b, #ef4444)`
                                                }}
                                            />
                                            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                                                <span>{formData.gender === 'female' ? '10%' : '5%'}</span>
                                                <span>25%</span>
                                                <span>45%</span>
                                            </div>
                                        </div>
                                        <div className="text-center mt-2">
                                            <span className={`text-3xl font-bold ${category.color}`}>{formData.bodyFat}%</span>
                                        </div>
                                    </div>

                                    {/* Quick Select Buttons */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {bodyFatRanges.map(range => (
                                            <button
                                                key={range.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, bodyFat: range.value }))}
                                                className={`p-2 rounded-xl border text-center transition-all ${
                                                    Math.abs(formData.bodyFat - range.value) <= 3
                                                        ? 'border-blue-500 bg-blue-500/20 text-white scale-105'
                                                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                            >
                                                <div className="text-lg mb-0.5">{range.emoji}</div>
                                                <div className="text-xs font-medium">{range.label}</div>
                                                <div className="text-[9px] opacity-60">{range.category}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Goal Selection */}
                                <div className="mb-4">
                                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
                                        <Target size={12} /> Fitness Goal
                                    </label>
                                    <select
                                        name="goal"
                                        value={formData.goal}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                    >
                                        <option value="weight_loss">🔥 Weight Loss</option>
                                        <option value="muscle_gain">💪 Muscle Gain</option>
                                        <option value="maintenance">⚖️ Maintenance</option>
                                        <option value="endurance">🏃 Endurance</option>
                                    </select>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setStep(1)}
                                        className="flex-1"
                                    >
                                        <ChevronLeft size={18} /> Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white border-0"
                                    >
                                        {loading ? 'Creating...' : 'Start Journey'} <ChevronRight size={18} />
                                    </Button>
                                </div>

                                <p className="text-center text-sm text-zinc-500 mt-4">
                                    Already a Player?{' '}
                                    <Link to="/login" className="text-blue-400 hover:text-blue-300">
                                        Login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Custom slider thumb styles */}
            <style>{`
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(255,255,255,0.5);
                    border: 2px solid #3b82f6;
                }
                input[type="range"]::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(255,255,255,0.5);
                    border: 2px solid #3b82f6;
                }
            `}</style>
        </div>
    );
}
