/**
 * ============================================
 * NAVBAR COMPONENT
 * ============================================
 * 
 * A dynamic island style bottom navigation bar.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity,
    Utensils,
    User
} from 'lucide-react';

function NavIcon({ icon, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`p-3 rounded-full transition-all duration-300 relative group ${active ? 'text-white bg-white/10' : 'text-zinc-500 hover:text-zinc-300'
                }`}
        >
            {active && (
                <span className="absolute -top-1 right-0 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
            )}
            {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
        </button>
    );
}

export default function NavBar() {
    const navigate = useNavigate();
    const location = useLocation();

    const currentPath = location.pathname;

    const navItems = [
        { path: '/', icon: <LayoutDashboard />, label: 'Dashboard' },
        { path: '/workout', icon: <Activity />, label: 'Workout' },
        { path: '/nutrition', icon: <Utensils />, label: 'Nutrition' },
        { path: '/profile', icon: <User />, label: 'Profile' },
    ];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[350px]">
            <div className="bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 flex items-center justify-between shadow-2xl shadow-black">
                {navItems.map((item) => (
                    <NavIcon
                        key={item.path}
                        icon={item.icon}
                        active={currentPath === item.path}
                        onClick={() => navigate(item.path)}
                    />
                ))}
            </div>
        </nav>
    );
}
