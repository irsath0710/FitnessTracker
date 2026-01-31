/**
 * ============================================
 * REGISTER PAGE
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * This page collects:
 * 1. Account info (username, email, password)
 * 2. Body metrics (height, weight, body fat, gender)
 * 
 * These metrics are used for:
 * - Calorie burn calculations
 * - 3D body visualization
 * - Progress tracking
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';

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

    // Body fat reference images/descriptions
    const bodyFatRanges = [
        { value: 10, label: '8-12%', desc: 'Very lean, visible abs' },
        { value: 15, label: '13-17%', desc: 'Athletic, some definition' },
        { value: 20, label: '18-22%', desc: 'Fit, light definition' },
        { value: 25, label: '23-27%', desc: 'Average, soft look' },
        { value: 30, label: '28-32%', desc: 'Above average' },
        { value: 35, label: '33%+', desc: 'Higher body fat' },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md z-10">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-black italic tracking-tighter mb-2 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
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
                    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        {step === 1 ? (
                            // Step 1: Account Info
                            <>
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
                            </>
                        ) : (
                            // Step 2: Body Profile
                            <>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <Input
                                        label="Height (cm)"
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                    />
                                    <Input
                                        label="Weight (kg)"
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <Input
                                        label="Age"
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                    />
                                    <div className="mb-4">
                                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">
                                            Gender
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

                                {/* Body Fat Selection */}
                                <div className="mb-4">
                                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                                        Estimated Body Fat %
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {bodyFatRanges.map(range => (
                                            <button
                                                key={range.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, bodyFat: range.value }))}
                                                className={`p-3 rounded-xl border text-center transition-all ${formData.bodyFat === range.value
                                                        ? 'border-blue-500 bg-blue-500/20 text-white'
                                                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600'
                                                    }`}
                                            >
                                                <div className="text-sm font-medium">{range.label}</div>
                                                <div className="text-[10px] opacity-60">{range.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Goal Selection */}
                                <div className="mb-6">
                                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                                        Fitness Goal
                                    </label>
                                    <select
                                        name="goal"
                                        value={formData.goal}
                                        onChange={handleChange}
                                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                    >
                                        <option value="weight_loss">Weight Loss</option>
                                        <option value="muscle_gain">Muscle Gain</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="endurance">Endurance</option>
                                    </select>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setStep(1)}
                                        className="flex-1"
                                    >
                                        ← Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white border-0"
                                    >
                                        {loading ? 'Creating...' : 'Start Journey'}
                                    </Button>
                                </div>
                            </>
                        )}

                        <p className="text-center text-sm text-zinc-500 mt-6">
                            Already a Player?{' '}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300">
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
