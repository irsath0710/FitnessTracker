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
 * Formula: Calories Burned = MET × Weight(kg) × Duration(hours)
 */
const MET_VALUES = {
    running: 9.8,        // Running (6 mph)
    walking: 3.5,        // Walking (3 mph)
    cycling: 7.5,        // Cycling (12-14 mph)
    pushups: 8.0,        // Push-ups (vigorous)
    weight_lifting: 3.5, // Weight training
    yoga: 2.5,           // Hatha yoga
    pullups: 8.0,        // Pull-ups (vigorous)
    squats: 5.5,         // Squats/bodyweight exercises
    climbing: 8.0,       // Rock climbing
    boxing: 7.8,         // Boxing
    rowing: 7.0,         // Rowing machine
    elliptical: 5.0,     // Elliptical machine
    jump_rope: 12.0,     // Jump rope (fast)
    basketball: 6.5,     // Basketball
    soccer: 7.0,         // Soccer
    other: 4.0           // General exercise
};

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
        enum: Object.keys(MET_VALUES),  // Must be one of the MET_VALUES keys
        lowercase: true
    },

    // Duration in minutes
    duration: {
        type: Number,
        required: [true, 'Duration is required'],
        min: [1, 'Duration must be at least 1 minute'],
        max: [600, 'Duration cannot exceed 600 minutes']
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
 * This runs before saving to calculate calories using MET formula:
 * Calories = MET × Weight(kg) × Duration(hours) × Intensity Modifier
 */
WorkoutSchema.pre('save', async function (next) {
    // Only calculate if these fields are set
    if (!this.isModified('duration') && !this.isModified('type') && !this.isModified('intensity')) {
        return next();
    }

    // Get the user's weight for calculation
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);

    if (user) {
        const met = MET_VALUES[this.type] || MET_VALUES.other;
        const durationInHours = this.duration / 60;

        // Intensity modifier
        const intensityMod = {
            low: 0.8,
            moderate: 1.0,
            high: 1.2
        };

        // Calculate calories burned
        this.caloriesBurned = Math.round(
            met * user.weight * durationInHours * intensityMod[this.intensity]
        );

        // Calculate XP (roughly half of calories burned)
        this.xpEarned = Math.round(this.caloriesBurned / 2);
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

// Export the model and MET values
module.exports = mongoose.model('Workout', WorkoutSchema);
module.exports.MET_VALUES = MET_VALUES;
