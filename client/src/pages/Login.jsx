/**
 * ============================================
 * LOGIN PAGE
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * FORM HANDLING IN REACT:
 * - useState for form field values
 * - onChange handlers to update state
 * - onSubmit handler for form submission
 * - Controlled components: Input values come from state
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

export default function Login() {
    const navigate = useNavigate();
    const { login, error } = useAuth();

    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData);

        if (result.success) {
            navigate('/');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md z-10">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full" />
                        <img src="/logo.png" alt="Level Up Logo" className="relative w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                    <h1 className="text-6xl font-black italic tracking-tighter mb-4 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                        LEVEL UP
                    </h1>
                    <p className="text-zinc-500 tracking-[0.3em] text-xs uppercase border-t border-zinc-800 pt-4">
                        System Initialization Required
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email or Username"
                            name="identifier"
                            placeholder="player@example.com"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-4 py-4 px-6 rounded-2xl font-bold text-lg bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-500 hover:to-green-400 transition-all shadow-lg shadow-emerald-900/50 disabled:opacity-50"
                        >
                            {loading ? 'Connecting...' : 'ACCESS SYSTEM'}
                        </button>

                        <p className="text-center text-sm text-zinc-500 mt-6">
                            New Player?{' '}
                            <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
