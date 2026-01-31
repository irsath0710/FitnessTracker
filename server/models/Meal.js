/**
 * ============================================
 * MEAL MODEL
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * This model stores nutrition/food data.
 * It tracks calories and macronutrients (protein, carbs, fats).
 * 
 * MACRONUTRIENTS:
 * - Protein: 4 calories per gram (muscle building)
 * - Carbohydrates: 4 calories per gram (energy)
 * - Fat: 9 calories per gram (energy storage, hormones)
 * - Fiber: Not fully digestible, helps digestion
 */

const mongoose = require('mongoose');

const MealSchema = new mongoose.Schema({
    // Reference to the user
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Meal name/description
    name: {
        type: String,
        required: [true, 'Meal name is required'],
        trim: true,
        maxlength: [100, 'Meal name cannot exceed 100 characters']
    },

    // Meal type
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        default: 'snack'
    },

    // Calories (kcal)
    calories: {
        type: Number,
        required: [true, 'Calories are required'],
        min: [0, 'Calories cannot be negative'],
        max: [10000, 'Calories seem too high']
    },

    // Macronutrients (grams)
    protein: {
        type: Number,
        default: 0,
        min: [0, 'Protein cannot be negative']
    },

    carbs: {
        type: Number,
        default: 0,
        min: [0, 'Carbs cannot be negative']
    },

    fats: {
        type: Number,
        default: 0,
        min: [0, 'Fats cannot be negative']
    },

    fiber: {
        type: Number,
        default: 0,
        min: [0, 'Fiber cannot be negative']
    },

    // When the meal was consumed
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

/**
 * STATIC METHOD: Get Daily Summary
 * 
 * Returns total nutrition for a specific day
 */
MealSchema.statics.getDailySummary = async function (userId, date = new Date()) {
    // Start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const summary = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: startOfDay, $lte: endOfDay }
            }
        },
        {
            $group: {
                _id: null,
                totalCalories: { $sum: '$calories' },
                totalProtein: { $sum: '$protein' },
                totalCarbs: { $sum: '$carbs' },
                totalFats: { $sum: '$fats' },
                totalFiber: { $sum: '$fiber' },
                mealCount: { $sum: 1 }
            }
        }
    ]);

    return summary[0] || {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        totalFiber: 0,
        mealCount: 0
    };
};

/**
 * STATIC METHOD: Get Weekly Data
 * 
 * Returns daily totals for the past 7 days
 * Used for charts/graphs
 */
MealSchema.statics.getWeeklyData = async function (userId) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyData = await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                date: { $gte: oneWeekAgo }
            }
        },
        {
            // Group by day
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                totalCalories: { $sum: '$calories' },
                totalProtein: { $sum: '$protein' },
                totalCarbs: { $sum: '$carbs' },
                totalFats: { $sum: '$fats' }
            }
        },
        {
            $sort: { _id: 1 }  // Sort by date ascending
        }
    ]);

    return weeklyData;
};

module.exports = mongoose.model('Meal', MealSchema);
