/**
 * ============================================
 * PROGRESS ROUTES
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * These routes handle progress tracking and history.
 * They aggregate data from workouts and meals to show trends.
 */

const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// All progress routes require authentication
router.use(protect);

/**
 * @route   GET /api/progress
 * @desc    Get progress history
 * @access  Private
 * 
 * Query parameters:
 * - days: number of days to fetch (default: 30)
 */
router.get('/', async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const history = await Progress.getHistory(req.user.id, parseInt(days));

        res.json({
            success: true,
            count: history.length,
            progress: history
        });

    } catch (error) {
        console.error('Get progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching progress'
        });
    }
});

/**
 * @route   GET /api/progress/today
 * @desc    Get today's progress
 * @access  Private
 */
router.get('/today', async (req, res) => {
    try {
        const progress = await Progress.getOrCreateToday(req.user.id);

        res.json({
            success: true,
            progress: {
                ...progress.toObject(),
                calorieGoal: req.user.dailyCalorieGoal,
                burnGoal: req.user.dailyBurnGoal,
                calorieRemaining: req.user.dailyCalorieGoal - progress.caloriesConsumed,
                burnRemaining: req.user.dailyBurnGoal - progress.caloriesBurned
            }
        });

    } catch (error) {
        console.error('Today progress error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching today\'s progress'
        });
    }
});

/**
 * @route   GET /api/progress/weight
 * @desc    Get weight history for trend chart
 * @access  Private
 */
router.get('/weight', async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const history = await Progress.getHistory(req.user.id, parseInt(days));

        // Extract weight data points
        const weightData = history
            .filter(p => p.weight)  // Only entries with weight
            .map(p => ({
                date: p.date,
                weight: p.weight
            }));

        res.json({
            success: true,
            data: weightData
        });

    } catch (error) {
        console.error('Weight history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching weight history'
        });
    }
});

/**
 * @route   PUT /api/progress/weight
 * @desc    Record today's weight
 * @access  Private
 */
router.put('/weight', async (req, res) => {
    try {
        const { weight } = req.body;

        if (!weight || weight < 30 || weight > 300) {
            return res.status(400).json({
                success: false,
                message: 'Weight must be between 30 and 300 kg'
            });
        }

        // Update progress
        const progress = await Progress.getOrCreateToday(req.user.id);
        progress.weight = weight;
        await progress.save();

        // Also update user's current weight
        req.user.weight = weight;
        await req.user.save();

        res.json({
            success: true,
            message: 'Weight recorded',
            weight
        });

    } catch (error) {
        console.error('Record weight error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error recording weight'
        });
    }
});

/**
 * @route   GET /api/progress/summary
 * @desc    Get weekly/monthly summary
 * @access  Private
 */
router.get('/summary', async (req, res) => {
    try {
        const { period = 'week' } = req.query;
        const days = period === 'month' ? 30 : 7;

        const history = await Progress.getHistory(req.user.id, days);

        // Calculate averages and totals
        const summary = history.reduce((acc, p) => {
            acc.totalCaloriesIn += p.caloriesConsumed || 0;
            acc.totalCaloriesOut += p.caloriesBurned || 0;
            acc.totalWorkouts += p.workoutCount || 0;
            acc.totalXp += p.xpEarned || 0;
            return acc;
        }, {
            totalCaloriesIn: 0,
            totalCaloriesOut: 0,
            totalWorkouts: 0,
            totalXp: 0
        });

        const dayCount = history.length || 1;

        res.json({
            success: true,
            period,
            days: dayCount,
            summary: {
                ...summary,
                avgCaloriesIn: Math.round(summary.totalCaloriesIn / dayCount),
                avgCaloriesOut: Math.round(summary.totalCaloriesOut / dayCount),
                netCalories: summary.totalCaloriesIn - summary.totalCaloriesOut
            }
        });

    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching summary'
        });
    }
});

module.exports = router;
