/**
 * ============================================
 * WORKOUT ROUTES
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * CRUD OPERATIONS:
 * - Create: POST /api/workouts
 * - Read: GET /api/workouts
 * - Update: PUT /api/workouts/:id (not implemented - workouts are logged as-is)
 * - Delete: DELETE /api/workouts/:id
 * 
 * REST API CONVENTIONS:
 * - Use nouns for resources (/workouts, not /getWorkouts)
 * - HTTP method indicates action
 * - Use plural for collections
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Workout = require('../models/Workout');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// All workout routes require authentication
router.use(protect);

/**
 * @route   GET /api/workouts
 * @desc    Get all workouts for the logged-in user
 * @access  Private
 * 
 * Query parameters:
 * - limit: number of results (default: 50)
 * - page: page number for pagination
 * - type: filter by workout type
 */
router.get('/', async (req, res) => {
    try {
        const { limit = 50, page = 1, type } = req.query;

        // Build query filter
        const filter = { userId: req.user.id };
        if (type) {
            filter.type = type.toLowerCase();
        }

        // Count total documents for pagination
        const total = await Workout.countDocuments(filter);

        // Fetch workouts with pagination
        const workouts = await Workout.find(filter)
            .sort({ date: -1 })  // Newest first
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: workouts.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            workouts
        });

    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching workouts'
        });
    }
});

/**
 * @route   POST /api/workouts
 * @desc    Log a new workout
 * @access  Private
 * 
 * Request body:
 * {
 *   "type": "running" | "cycling" | "pushups" | etc,
 *   "duration": 30 (minutes, for time-based),
 *   "reps": 50 (for count-based),
 *   "sets": 3 (optional, for count-based),
 *   "intensity": "low" | "moderate" | "high" (optional),
 *   "notes": "string" (optional)
 * }
 */
router.post(
    '/',
    [
        body('type').isString().notEmpty().withMessage('Workout type is required')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }

            const { type, duration, reps, sets, intensity, notes } = req.body;
            
            // Get workout category config
            const { WORKOUT_CATEGORIES } = require('../models/Workout');
            const workoutConfig = WORKOUT_CATEGORIES[type.toLowerCase()] || WORKOUT_CATEGORIES.other;
            const inputType = workoutConfig.type;

            // Validate based on input type
            if (inputType === 'time' && (!duration || duration < 1)) {
                return res.status(400).json({
                    success: false,
                    message: 'Duration is required for time-based workouts'
                });
            }
            if (inputType === 'count' && (!reps || reps < 1)) {
                return res.status(400).json({
                    success: false,
                    message: 'Reps count is required for count-based workouts'
                });
            }

            // Create workout
            const workout = await Workout.create({
                userId: req.user.id,
                type: type.toLowerCase(),
                inputType,
                duration: duration || 0,
                reps: reps || 0,
                sets: sets || 1,
                intensity: intensity || 'moderate',
                notes
            });

            // Update user XP and streak
            const user = await User.findById(req.user.id);

            // Calculate streak
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (user.lastWorkoutDate) {
                const lastDate = new Date(user.lastWorkoutDate);
                lastDate.setHours(0, 0, 0, 0);

                const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

                if (daysSince === 1) {
                    // Continue streak
                    user.streak += 1;
                } else if (daysSince > 1) {
                    // Streak broken, restart
                    user.streak = 1;
                }
                // If daysSince === 0, same day, streak stays same
            } else {
                // First workout ever
                user.streak = 1;
            }

            // Update user
            user.xp += workout.xpEarned;
            user.lastWorkoutDate = new Date();
            await user.save();

            // Update daily progress
            const progress = await Progress.getOrCreateToday(req.user.id);
            progress.caloriesBurned += workout.caloriesBurned;
            progress.xpEarned += workout.xpEarned;
            progress.workoutCount += 1;
            await progress.save();

            res.status(201).json({
                success: true,
                message: 'Workout logged successfully!',
                workout: {
                    id: workout._id,
                    type: workout.type,
                    inputType: workout.inputType,
                    duration: workout.duration,
                    reps: workout.reps,
                    sets: workout.sets,
                    intensity: workout.intensity,
                    caloriesBurned: workout.caloriesBurned,
                    xpEarned: workout.xpEarned,
                    date: workout.date
                },
                user: {
                    xp: user.xp,
                    streak: user.streak,
                    level: user.getLevel()
                }
            });

        } catch (error) {
            console.error('Create workout error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error creating workout'
            });
        }
    }
);

/**
 * @route   GET /api/workouts/types
 * @desc    Get available workout types with categories and calorie info
 * @access  Private
 */
router.get('/types', async (req, res) => {
    const { WORKOUT_CATEGORIES } = require('../models/Workout');
    const userWeight = req.user.weight || 70;

    const types = Object.entries(WORKOUT_CATEGORIES).map(([type, config]) => {
        let calorieInfo;
        if (config.type === 'time') {
            // Calories per 30 min for time-based
            calorieInfo = {
                caloriesPer30Min: Math.round(config.met * userWeight * 0.5),
                unit: 'minutes'
            };
        } else {
            // Calories per 10 reps for count-based
            calorieInfo = {
                caloriesPer10Reps: Math.round(config.caloriesPerRep * 10 * (userWeight / 70)),
                unit: 'reps'
            };
        }

        return {
            type,
            inputType: config.type,
            label: config.label,
            icon: config.icon,
            met: config.met,
            caloriesPerRep: config.caloriesPerRep,
            ...calorieInfo
        };
    });

    // Sort: time-based first, then count-based
    types.sort((a, b) => {
        if (a.inputType === b.inputType) return a.label.localeCompare(b.label);
        return a.inputType === 'time' ? -1 : 1;
    });

    res.json({
        success: true,
        types
    });
});

/**
 * @route   GET /api/workouts/summary
 * @desc    Get weekly workout summary
 * @access  Private
 */
router.get('/summary', async (req, res) => {
    try {
        const summary = await Workout.getWeeklySummary(req.user.id);

        res.json({
            success: true,
            summary
        });

    } catch (error) {
        console.error('Summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching summary'
        });
    }
});

/**
 * @route   DELETE /api/workouts/:id
 * @desc    Delete a workout
 * @access  Private
 * 
 * :id is a route parameter - accessible via req.params.id
 */
router.delete('/:id', async (req, res) => {
    try {
        const workout = await Workout.findById(req.params.id);

        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        // Make sure user owns the workout
        if (workout.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this workout'
            });
        }

        await workout.deleteOne();

        // Subtract XP from user
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { xp: -workout.xpEarned }
        });

        res.json({
            success: true,
            message: 'Workout deleted'
        });

    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting workout'
        });
    }
});

module.exports = router;
