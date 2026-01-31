/**
 * ============================================
 * REUSABLE UI COMPONENTS
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * COMPONENT-BASED ARCHITECTURE:
 * React apps are built from small, reusable pieces called components.
 * Each component handles its own rendering and logic.
 * 
 * Benefits:
 * - Reusability: Use the same button everywhere
 * - Maintainability: Change button style in one place
 * - Consistency: All buttons look the same
 */

import React from 'react';

/**
 * Button Component
 * 
 * A reusable button with different style variants.
 * 
 * Props:
 * - children: Button content (text, icons, etc.)
 * - onClick: Click handler function
 * - variant: 'primary' | 'secondary' | 'ghost' | 'system' | 'danger'
 * - className: Additional CSS classes
 * - type: 'button' | 'submit'
 * - disabled: Whether button is disabled
 */
export function Button({
    children,
    onClick,
    variant = 'primary',
    className = '',
    type = 'button',
    disabled = false
}) {
    const baseStyle = "px-6 py-3 rounded-2xl font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_rgba(255,255,255,0.2)]",
        secondary: "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700",
        ghost: "bg-transparent text-zinc-400 hover:text-white",
        system: "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
        danger: "bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

/**
 * Card Component
 * 
 * A container with glass-morphism styling.
 */
export function Card({ children, className = '', title, action }) {
    return (
        <div className={`bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 ${className}`}>
            {(title || action) && (
                <div className="flex justify-between items-center mb-4">
                    {title && <h3 className="text-lg font-semibold text-white/90">{title}</h3>}
                    {action}
                </div>
            )}
            {children}
        </div>
    );
}

/**
 * Input Component
 * 
 * Styled form input with label.
 */
export function Input({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    name,
    error,
    required = false
}) {
    return (
        <div className="mb-4">
            {label && (
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full bg-zinc-950/50 border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${error ? 'border-red-500' : 'border-zinc-800'
                    }`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

/**
 * Toast Notification Component
 */
export function Toast({ message, type = 'info', onClose }) {
    const types = {
        info: 'bg-blue-950/80 border-blue-500/50 text-blue-100',
        success: 'bg-green-950/80 border-green-500/50 text-green-100',
        error: 'bg-red-950/80 border-red-500/50 text-red-100',
        warning: 'bg-yellow-950/80 border-yellow-500/50 text-yellow-100'
    };

    const dotColors = {
        info: 'bg-blue-400',
        success: 'bg-green-400',
        error: 'bg-red-400',
        warning: 'bg-yellow-400'
    };

    return (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 ${types[type]} backdrop-blur-xl border px-6 py-4 rounded-2xl shadow-2xl z-[60] animate-bounce-in flex items-center gap-4 min-w-[300px]`}>
            <div className={`w-3 h-3 rounded-full ${dotColors[type]} animate-pulse`} />
            <div>
                <div className="text-xs uppercase tracking-wider mb-0.5 opacity-70">System Notification</div>
                <div className="font-semibold">{message}</div>
            </div>
        </div>
    );
}

/**
 * Loading Spinner Component
 */
export function Spinner({ size = 'md' }) {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className={`${sizes[size]} border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin`} />
    );
}

/**
 * Loading Screen Component
 */
export function LoadingScreen() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <Spinner size="lg" />
                <p className="text-zinc-500 mt-4 text-sm tracking-widest uppercase">Loading...</p>
            </div>
        </div>
    );
}

/**
 * Stat Card Component
 */
export function StatCard({ icon, value, label, goal, color = 'blue' }) {
    const colors = {
        blue: 'border-blue-500/20 text-blue-500 bg-blue-500/10',
        orange: 'border-orange-500/20 text-orange-500 bg-orange-500/10',
        green: 'border-green-500/20 text-green-500 bg-green-500/10',
        purple: 'border-purple-500/20 text-purple-500 bg-purple-500/10'
    };

    return (
        <Card className={`bg-gradient-to-br from-zinc-900 to-zinc-900/50 ${colors[color].split(' ')[0]}`}>
            <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-lg ${colors[color].split(' ').slice(1).join(' ')}`}>
                    {icon}
                </div>
                {goal && (
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Goal: {goal}</span>
                )}
            </div>
            <div className="text-3xl font-bold font-mono text-white">{value}</div>
            <div className="text-xs text-zinc-400 mt-1">{label}</div>
        </Card>
    );
}
