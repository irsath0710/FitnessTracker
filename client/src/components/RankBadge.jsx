/**
 * ============================================
 * RANK BADGE COMPONENT
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * This component displays the user's gamification rank.
 * It's a good example of:
 * - Pure component (only depends on props)
 * - Computed values (level calculation)
 * - Dynamic styling based on data
 */

import React from 'react';

// Level/Rank definitions
const LEVELS = [
    { rank: 'E', minXp: 0, color: '#94a3b8' },
    { rank: 'D', minXp: 1000, color: '#64748b' },
    { rank: 'C', minXp: 2500, color: '#38bdf8' },
    { rank: 'B', minXp: 5000, color: '#22c55e' },
    { rank: 'A', minXp: 10000, color: '#f59e0b' },
    { rank: 'S', minXp: 20000, color: '#ef4444' },
    { rank: 'NATIONAL', minXp: 50000, color: '#8b5cf6' },
];

/**
 * Calculate level based on XP
 */
export const calculateLevel = (xp) => {
    return [...LEVELS].reverse().find(l => xp >= l.minXp) || LEVELS[0];
};

/**
 * Get next level info
 */
export const getNextLevel = (xp) => {
    const currentIndex = LEVELS.findIndex(l => l === calculateLevel(xp));
    return LEVELS[currentIndex + 1] || null;
};

/**
 * RankBadge Component
 * 
 * Props:
 * - xp: User's total experience points
 * - showProgress: Whether to show the progress bar
 */
export default function RankBadge({ xp, showProgress = true }) {
    const level = calculateLevel(xp);
    const nextLevel = getNextLevel(xp);

    // Calculate progress to next level
    const xpInCurrentLevel = xp - level.minXp;
    const xpForNextLevel = nextLevel ? nextLevel.minXp - level.minXp : 1;
    const progress = nextLevel ? (xpInCurrentLevel / xpForNextLevel) * 100 : 100;

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase mb-2">
                Hunter Rank
            </div>

            {/* Rank Letter */}
            <div className="relative group cursor-default w-full flex justify-center py-4">
                <div
                    className="text-8xl font-black italic tracking-tighter transform -skew-x-12"
                    style={{
                        color: level.color,
                        textShadow: `0 0 40px ${level.color}60`
                    }}
                >
                    {level.rank}
                </div>
            </div>

            {/* Progress Bar */}
            {showProgress && (
                <>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-4 relative">
                        <div
                            className="h-full absolute top-0 left-0 transition-all duration-1000"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: level.color,
                                boxShadow: `0 0 10px ${level.color}`
                            }}
                        />
                    </div>
                    <div className="mt-2 text-xs font-mono text-zinc-400 flex justify-between w-full">
                        <span>CURRENT EXP</span>
                        <span>
                            {xp.toLocaleString()} / {(nextLevel?.minXp || xp).toLocaleString()}
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}
