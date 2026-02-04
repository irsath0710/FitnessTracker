/**
 * ============================================
 * WORKOUT MODEL
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * This model stores workout/exercise data.
 * Each workout is linked to a user via the userId field.
 * 
 * REFERENCE FIELDS (ObjectId):
 * The 'ref' property tells Mongoose which model to use when
 * "populating" (automatically fetching) the related document.
 * 
 * MET VALUES:
 * MET (Metabolic Equivalent of Task) is used to calculate
 * calories burned during exercise. Higher MET = more intense activity.
 */

const mongoose = require('mongoose');

/**
 * MET values for common exercises
 * Source: Compendium of Physical Activities
 * 
 * Formula for time-based: Calories Burned = MET × Weight(kg) × Duration(hours)
 * Formula for count-based: Calories Burned = caloriesPerRep × reps × intensityModifier
 */

// Workout categories - time-based vs count-based
const WORKOUT_CATEGORIES = {
    // Time-based workouts (duration in minutes)
    running: { type: 'time', met: 9.8, icon: '🏃', label: 'Running' },
    walking: { type: 'time', met: 3.5, icon: '🚶', label: 'Walking' },
    cycling: { type: 'time', met: 7.5, icon: '🚴', label: 'Cycling' },
    swimming: { type: 'time', met: 8.0, icon: '🏊', label: 'Swimming' },
    yoga: { type: 'time', met: 2.5, icon: '🧘', label: 'Yoga' },
    climbing: { type: 'time', met: 8.0, icon: '🧗', label: 'Rock Climbing' },
    boxing: { type: 'time', met: 7.8, icon: '🥊', label: 'Boxing' },
    rowing: { type: 'time', met: 7.0, icon: '🚣', label: 'Rowing' },
    elliptical: { type: 'time', met: 5.0, icon: '🏃', label: 'Elliptical' },
    jump_rope: { type: 'time', met: 12.0, icon: '⏭️', label: 'Jump Rope' },
    basketball: { type: 'time', met: 6.5, icon: '🏀', label: 'Basketball' },
    soccer: { type: 'time', met: 7.0, icon: '⚽', label: 'Soccer' },
    dancing: { type: 'time', met: 5.5, icon: '💃', label: 'Dancing' },
    hiking: { type: 'time', met: 6.0, icon: '🥾', label: 'Hiking' },
    
    // Count-based workouts (reps/counts)
    pushups: { type: 'count', caloriesPerRep: 0.36, icon: '💪', label: 'Push-ups' },
    pullups: { type: 'count', caloriesPerRep: 1.0, icon: '🔺', label: 'Pull-ups' },
    squats: { type: 'count', caloriesPerRep: 0.32, icon: '🦵', label: 'Squats' },
    lunges: { type: 'count', caloriesPerRep: 0.3, icon: '🦿', label: 'Lunges' },
    burpees: { type: 'count', caloriesPerRep: 1.5, icon: '🔥', label: 'Burpees' },
    situps: { type: 'count', caloriesPerRep: 0.25, icon: '🏋️', label: 'Sit-ups' },
    crunches: { type: 'count', caloriesPerRep: 0.15, icon: '💫', label: 'Crunches' },
    plank: { type: 'time', met: 4.0, icon: '🧱', label: 'Plank' },
    jumping_jacks: { type: 'count', caloriesPerRep: 0.2, icon: '⭐', label: 'Jumping Jacks' },
    mountain_climbers: { type: 'count', caloriesPerRep: 0.5, icon: '🏔️', label: 'Mountain Climbers' },
    deadlifts: { type: 'count', caloriesPerRep: 0.5, icon: '🏋️', label: 'Deadlifts' },
    bench_press: { type: 'count', caloriesPerRep: 0.4, icon: '🏋️', label: 'Bench Press' },
    
    // General
    weight_lifting: { type: 'time', met: 3.5, icon: '🏋️', label: 'Weight Lifting' },
    other: { type: 'time', met: 4.0, icon: '🏅', label: 'Other' }
};

// Legacy MET_VALUES for backwards compatibility
const MET_VALUES = Object.fromEntries(
    Object.entries(WORKOUT_CATEGORIES)
        .filter(([_, v]) => v.type === 'time')
        .map(([k, v]) => [k, v.met])
);

const WorkoutSchema = new mongoose.Schema({
    // Reference to the user who created this workout
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // Special type for MongoDB IDs
        ref: 'User',  // References the User model
        required: true
    },

    // Workout type/activity
    type: {
        type: String,
        required: [true, 'Workout type is required'],
        enum: Object.keys(WORKOUT_CATEGORIES),  // Must be one of the WORKOUT_CATEGORIES keys
        lowercase: true
    },

    // Workout input type: 'time' for duration-based, 'count' for rep-based
    inputType: {
        type: String,
        enum: ['time', 'count'],
        default: 'time'
    },

    // Duration in minutes (for time-based workouts)
    duration: {
        type: Number,
        min: [0, 'Duration cannot be negative'],
        max: [600, 'Duration cannot exceed 600 minutes'],
        default: 0
    },

    // Rep count (for count-based workouts like pushups, squats)
    reps: {
        type: Number,
        min: [0, 'Reps cannot be negative'],
        max: [10000, 'Reps cannot exceed 10000'],
        default: 0
    },

    // Sets (optional, for count-based workouts)
    sets: {
        type: Number,
        min: [1, 'Sets must be at least 1'],
        max: [100, 'Sets cannot exceed 100'],
        default: 1
    },

    // Intensity affects calorie calculation
    intensity: {
        type: String,
        enum: ['low', 'moderate', 'high'],
        default: 'moderate'
    },

    // Calories burned (calculated)
    caloriesBurned: {
        type: Number,
        default: 0
    },

    // XP earned from this workout
    xpEarned: {
        type: Number,
        default: 0
    },

    // Optional notes
    notes: {
        type: String,
        maxlength: 500
    },

    // When the workout was performed
    date: {
        type: Date,
        default: Date.now
    }
}, {
    // Schema options
    timestamps: true  // Automatically adds createdAt and updatedAt
});

/**
 * PRE-SAVE MIDDLEWARE: Calculate Calories Burned
 * 
 * This runs before saving to calculate calories:
 * - Time-based: Calories = MET × Weight(kg) × Duration(hours) × Intensity Modifier
 * - Count-based: Calories = caloriesPerRep × totalReps × Intensity Modifier × weightFactor
 */
WorkoutSchema.pre('save', async function (next) {
    // Get the user's weight for calculation
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);

    if (user) {
        const workoutConfig = WORKOUT_CATEGORIES[this.type] || WORKOUT_CATEGORIES.other;
        
        // Intensity modifier
        const intensityMod = {
            low: 0.8,
            moderate: 1.0,
            high: 1.2
        };

        // Weight factor (heavier people burn more calories)
        const weightFactor = user.weight / 70; // Normalized to 70kg baseline

        if (workoutConfig.type === 'time' || this.inputType === 'time') {
            // Time-based calculation
            const met = workoutConfig.met || MET_VALUES[this.type] || 4.0;
            const durationInHours = this.duration / 60;
            
            this.caloriesBurned = Math.round(
                met * user.weight * durationInHours * intensityMod[this.intensity]
            );
        } else {
            // Count-based calculation
            const totalReps = this.reps * this.sets;
            const caloriesPerRep = workoutConfig.caloriesPerRep || 0.3;
            
            this.caloriesBurned = Math.round(
                caloriesPerRep * totalReps * intensityMod[this.intensity] * weightFactor
            );
        }

        // Calculate XP (roughly half of calories burned, min 5 XP)
        this.xpEarned = Math.max(5, Math.round(this.caloriesBurned / 2));
    }

    next();
});

/**
 * STATIC METHOD: Get Weekly Summary
 * 
 * Static methods are called on the Model, not on documents.
 * Example: Workout.getWeeklySummary(userId)
 */
WorkoutSchema.statics.getWeeklySummary = async function (userId) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // MongoDB Aggregation Pipeline
    // This is a powerful way to process and analyze data
    const summary = await this.aggregate([
        {
            // Match documents for this user in the last week
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: oneWeekAgo }
            }
        },
        {
            // Group and calculate totals
            $group: {
                _id: null,
                totalWorkouts: { $sum: 1 },
                totalDuration: { $sum: '$duration' },
                totalCalories: { $sum: '$caloriesBurned' },
                totalXp: { $sum: '$xpEarned' }
            }
        }
    ]);

    return summary[0] || {
        totalWorkouts: 0,
        totalDuration: 0,
        totalCalories: 0,
        totalXp: 0
    };
};

// Export the model and constants
module.exports = mongoose.model('Workout', WorkoutSchema);
module.exports.MET_VALUES = MET_VALUES;
module.exports.WORKOUT_CATEGORIES = WORKOUT_CATEGORIES;
