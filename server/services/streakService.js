/**
 * Streak Service — Handles streak logic with grace period
 */

/**
 * Update streak on workout completion.
 * Supports 1 free miss per week (grace period).
 */
function updateStreak(user) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastActive = user.streakData?.lastActiveDate
        ? new Date(user.streakData.lastActiveDate)
        : null;

    if (!lastActive) {
        // First ever workout
        user.streakData = { current: 1, longest: 1, lastActiveDate: now, graceUsedThisWeek: false };
        user.streak = 1;
        return { streak: 1, isNew: true };
    }

    const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const dayDiff = Math.round((today - lastActiveDay) / 86400000);

    if (dayDiff === 0) {
        // Already worked out today — no streak change
        return { streak: user.streakData.current, sameDay: true };
    }

    if (dayDiff === 1) {
        // Consecutive day — increment
        user.streakData.current += 1;
        user.streakData.longest = Math.max(user.streakData.longest, user.streakData.current);
    } else if (dayDiff === 2 && !user.streakData.graceUsedThisWeek) {
        // Grace period — keep streak, mark grace used
        user.streakData.current += 1;
        user.streakData.graceUsedThisWeek = true;
        user.streakData.longest = Math.max(user.streakData.longest, user.streakData.current);
    } else {
        // Streak broken
        user.streakData.current = 1;
    }

    user.streakData.lastActiveDate = now;
    user.streak = user.streakData.current;

    // Reset grace flag on Mondays
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon
    if (dayOfWeek === 1) {
        user.streakData.graceUsedThisWeek = false;
    }

    return {
        streak: user.streakData.current,
        longest: user.streakData.longest,
        graceUsed: dayDiff === 2,
    };
}

module.exports = { updateStreak };
