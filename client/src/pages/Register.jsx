/**
 * ============================================
 * REGISTER PAGE - With Visual Body Fat Selector
 * ============================================
 * 
 * Features:
 * - Multi-step registration form
 * - Visual body fat percentage reference images
 * - Easy selection with visual guides
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';
import { Scale, Ruler, User, Target, ChevronLeft, ChevronRight, Check } from 'lucide-react';

// Body fat visual reference component
const BodyFatVisual = ({ percentage, gender, isSelected, onClick, label, description, category }) => {
    // SVG body silhouettes based on body fat percentage
    const getBodyShape = () => {
        const isMale = gender === 'male';

        // Different body widths based on body fat
        const getWidth = () => {
            if (percentage <= 12) return isMale ? 28 : 26;
            if (percentage <= 18) return isMale ? 32 : 30;
            if (percentage <= 24) return isMale ? 38 : 36;
            if (percentage <= 30) return isMale ? 44 : 42;
            return isMale ? 52 : 50;
        };

        const width = getWidth();
        const color = isSelected ? '#3b82f6' : '#52525b';
        const fillOpacity = isSelected ? 0.3 : 0.1;

        if (isMale) {
            return (
                <svg viewBox="0 0 80 120" className="w-full h-full">
                    {/* Head */}
                    <ellipse cx="40" cy="12" rx="10" ry="11" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" />
                    {/* Neck */}
                    <rect x="36" y="22" width="8" height="6" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1" />
                    {/* Torso */}
                    <path
                        d={`M${40 - width / 2} 28 
                            Q${40 - width / 2 - 4} 50 ${40 - width / 2 + 2} 75 
                            L${40 + width / 2 - 2} 75 
                            Q${40 + width / 2 + 4} 50 ${40 + width / 2} 28 Z`}
                        fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5"
                    />
                    {/* Arms */}
                    <path d={`M${40 - width / 2} 30 Q${40 - width / 2 - 12} 45 ${40 - width / 2 - 8} 65`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
                    <path d={`M${40 + width / 2} 30 Q${40 + width / 2 + 12} 45 ${40 + width / 2 + 8} 65`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
                    {/* Legs */}
                    <path d={`M${40 - width / 4} 75 L${40 - width / 4 - 3} 115`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
                    <path d={`M${40 + width / 4} 75 L${40 + width / 4 + 3} 115`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
                    {/* Abs indication for low body fat */}
                    {percentage <= 15 && (
                        <>
                            <line x1="40" y1="40" x2="40" y2="65" stroke={color} strokeWidth="0.5" opacity="0.5" />
                            <line x1="35" y1="45" x2="45" y2="45" stroke={color} strokeWidth="0.5" opacity="0.5" />
                            <line x1="35" y1="52" x2="45" y2="52" stroke={color} strokeWidth="0.5" opacity="0.5" />
                            <line x1="35" y1="59" x2="45" y2="59" stroke={color} strokeWidth="0.5" opacity="0.5" />
                        </>
                    )}
                </svg>
            );
        } else {
            return (
                <svg viewBox="0 0 80 120" className="w-full h-full">
                    {/* Head */}
                    <ellipse cx="40" cy="12" rx="9" ry="10" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" />
                    {/* Neck */}
                    <rect x="37" y="21" width="6" height="5" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1" />
                    {/* Torso - hourglass shape for female */}
                    <path
                        d={`M${40 - width / 2 + 4} 26 
                            Q${40 - width / 2 - 2} 35 ${40 - width / 2} 45
                            Q${40 - width / 2 + 6} 55 ${40 - width / 2 + 2} 65
                            Q${40 - width / 2 - 2} 72 ${40 - width / 2 + 4} 78
                            L${40 + width / 2 - 4} 78 
                            Q${40 + width / 2 + 2} 72 ${40 + width / 2 - 2} 65
                            Q${40 + width / 2 - 6} 55 ${40 + width / 2} 45
                            Q${40 + width / 2 + 2} 35 ${40 + width / 2 - 4} 26 Z`}
                        fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5"
                    />
                    {/* Arms */}
                    <path d={`M${40 - width / 2 + 4} 28 Q${40 - width / 2 - 10} 42 ${40 - width / 2 - 6} 60`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
                    <path d={`M${40 + width / 2 - 4} 28 Q${40 + width / 2 + 10} 42 ${40 + width / 2 + 6} 60`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
                    {/* Legs */}
                    <path d={`M${40 - width / 4 + 2} 78 L${40 - width / 4 - 1} 115`} fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
                    <path d={`M${40 + width / 4 - 2} 78 L${40 + width / 4 + 1} 115`} fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
                </svg>
            );
        }
    };

    const getCategoryColor = () => {
        if (percentage <= 12) return 'from-cyan-500 to-blue-500';
        if (percentage <= 18) return 'from-blue-500 to-green-500';
        if (percentage <= 24) return 'from-green-500 to-yellow-500';
        if (percentage <= 30) return 'from-yellow-500 to-orange-500';
        return 'from-orange-500 to-red-500';
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all duration-300 ${isSelected
                ? 'border-blue-500 bg-blue-500/20 scale-105 shadow-lg shadow-blue-500/20'
                : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50'
                }`}
        >
            {/* Selection indicator */}
            {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                </div>
            )}

            {/* Body silhouette */}
            <div className="w-16 h-24 mb-2">
                {getBodyShape()}
            </div>

            {/* Percentage */}
            <div className={`text-lg font-bold bg-gradient-to-r ${getCategoryColor()} bg-clip-text text-transparent`}>
                {label}
            </div>

            {/* Category */}
            <div className={`text-[10px] uppercase tracking-wider ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`}>
                {category}
            </div>

            {/* Description */}
            <div className="text-[9px] text-zinc-500 mt-1 text-center leading-tight">
                {description}
            </div>
        </button>
    );
};

// Default avatar options
const DEFAULT_AVATARS = [
    { id: 1, src: '/avatars/avatar1.jpg', name: 'Baek Yoon-Ho' },
    { id: 2, src: '/avatars/avatar2.jpg', name: 'Sung Jin-Woo' },
    { id: 3, src: '/avatars/avatar3.jpg', name: 'Shadow Monarch' },
    { id: 4, src: '/avatars/avatar4.jpg', name: 'Cha Hae-In' },
    { id: 5, src: '/avatars/avatar5.jpg', name: 'Igris' },
    { id: 6, src: '/avatars/avatar6.jpg', name: 'Choi Jong-In' },
];

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
        goal: 'maintenance',
        profilePicture: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            height: Number(formData.height),
            weight: Number(formData.weight),
            age: Number(formData.age),
            gender: formData.gender,
            bodyFat: Number(formData.bodyFat),
            goal: formData.goal
        };

        if (formData.profilePicture) {
            payload.profilePicture = formData.profilePicture;
        }

        const result = await register(payload);

        if (result.success) {
            navigate('/');
        }
        setLoading(false);
    };

    // Body fat ranges with visual references - different for male/female
    const getBodyFatRanges = () => {
        if (formData.gender === 'female') {
            return [
                { value: 14, label: '10-15%', category: 'Essential', description: 'Competition ready, very defined' },
                { value: 18, label: '16-20%', category: 'Athletic', description: 'Athletes, visible muscle tone' },
                { value: 24, label: '21-25%', category: 'Fitness', description: 'Fit & healthy, light definition' },
                { value: 28, label: '26-30%', category: 'Average', description: 'Healthy, soft appearance' },
                { value: 34, label: '31-35%', category: 'Above Avg', description: 'Some excess body fat' },
                { value: 40, label: '36%+', category: 'High', description: 'Higher body fat levels' },
            ];
        }
        return [
            { value: 8, label: '6-10%', category: 'Essential', description: 'Competition ready, veins visible' },
            { value: 12, label: '10-14%', category: 'Athletic', description: 'Six-pack visible, very lean' },
            { value: 18, label: '15-19%', category: 'Fitness', description: 'Fit, some ab definition' },
            { value: 23, label: '20-24%', category: 'Average', description: 'Healthy, soft around middle' },
            { value: 28, label: '25-29%', category: 'Above Avg', description: 'Some excess body fat' },
            { value: 35, label: '30%+', category: 'High', description: 'Higher body fat levels' },
        ];
    };

    const bodyFatRanges = getBodyFatRanges();

    // Get current category color
    const getCategoryInfo = () => {
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

    const category = getCategoryInfo();

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-2xl z-10">
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
                        /* Step 1: Account Info */
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
                                className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white border-0"
                            >
                                Continue <ChevronRight size={18} />
                            </Button>

                            <p className="text-center text-sm text-zinc-500 mt-6">
                                Already a Player?{' '}
                                <Link to="/login" className="text-blue-400 hover:text-blue-300">
                                    Login
                                </Link>
                            </p>
                        </div>
                    ) : (
                        /* Step 2: Body Profile with Visual Body Fat Selector */
                        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-2xl">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Avatar Selection */}
                            <div className="mb-6">
                                <label className="text-sm uppercase tracking-wider text-zinc-400 font-medium mb-3 block">
                                    Choose Your Avatar
                                </label>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                    {DEFAULT_AVATARS.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, profilePicture: avatar.src }))}
                                            className={`relative group rounded-2xl overflow-hidden border-2 transition-all duration-300 aspect-square ${formData.profilePicture === avatar.src
                                                    ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105 shadow-lg shadow-blue-500/20'
                                                    : 'border-zinc-700 hover:border-zinc-500 hover:scale-102'
                                                }`}
                                        >
                                            <img
                                                src={avatar.src}
                                                alt={avatar.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Dark overlay on hover */}
                                            <div className={`absolute inset-0 transition-opacity ${formData.profilePicture === avatar.src
                                                    ? 'bg-blue-500/20'
                                                    : 'bg-black/0 group-hover:bg-black/30'
                                                }`} />
                                            {/* Checkmark */}
                                            {formData.profilePicture === avatar.src && (
                                                <div className="absolute top-1 right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                            {/* Name tooltip */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-[9px] text-white text-center truncate">{avatar.name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-500 text-center mt-2">Select a profile avatar (optional)</p>
                            </div>

                            {/* Basic Info Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
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
                                    <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
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
                                    <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
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
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-sm uppercase tracking-wider text-zinc-400 font-medium">
                                        Select Your Body Fat Percentage
                                    </label>
                                    <span className={`text-sm px-3 py-1 rounded-full ${category.bg} ${category.color} ${category.border} border font-medium`}>
                                        {category.name} • {formData.bodyFat}%
                                    </span>
                                </div>

                                {/* Visual Body Fat Grid */}
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                    {bodyFatRanges.map((range) => (
                                        <BodyFatVisual
                                            key={range.value}
                                            percentage={range.value}
                                            gender={formData.gender}
                                            isSelected={formData.bodyFat === range.value}
                                            onClick={() => setFormData(prev => ({ ...prev, bodyFat: range.value }))}
                                            label={range.label}
                                            description={range.description}
                                            category={range.category}
                                        />
                                    ))}
                                </div>

                                <p className="text-xs text-zinc-500 text-center mt-3">
                                    Select the body type that best matches your current physique
                                </p>
                            </div>

                            {/* Fitness Goal */}
                            <div className="mb-6">
                                <label className="text-xs uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-1">
                                    <Target size={12} /> Fitness Goal
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {[
                                        { value: 'weight_loss', label: 'Weight Loss', desc: 'Burn fat' },
                                        { value: 'muscle_gain', label: 'Muscle Gain', desc: 'Build mass' },
                                        { value: 'maintenance', label: 'Maintenance', desc: 'Stay fit' },
                                        { value: 'endurance', label: 'Endurance', desc: 'Cardio focus' }
                                    ].map((goal) => (
                                        <button
                                            key={goal.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, goal: goal.value }))}
                                            className={`p-3 rounded-xl border text-center transition-all ${formData.goal === goal.value
                                                ? 'border-blue-500 bg-blue-500/20 text-white'
                                                : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600'
                                                }`}
                                        >
                                            <div className="text-sm font-medium">{goal.label}</div>
                                            <div className="text-[10px] opacity-60">{goal.desc}</div>
                                        </button>
                                    ))}
                                </div>
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
                                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white border-0"
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
                    )}
                </form>
            </div>
        </div>
    );
}
