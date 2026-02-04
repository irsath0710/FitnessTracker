/**
 * ============================================
 * MEAL ROUTES
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * These routes handle nutrition/meal tracking.
 * Similar pattern to workouts - CRUD operations.
 * 
 * NUTRITION TRACKING:
 * - Log meals with calories and macros
 * - Get daily/weekly summaries
 * - Track calorie surplus/deficit
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Meal = require('../models/Meal');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

// All meal routes require authentication
router.use(protect);

/**
 * @route   GET /api/meals
 * @desc    Get meals for the logged-in user
 * @access  Private
 * 
 * Query parameters:
 * - date: specific date (YYYY-MM-DD)
 * - limit: number of results
 */
router.get('/', async (req, res) => {
    try {
        const { date, limit = 50 } = req.query;

        const filter = { userId: req.user.id };

        // If date is provided, filter by that day
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            filter.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const meals = await Meal.find(filter)
            .sort({ date: -1 })
            .limit(parseInt(limit));

        res.json({
            success: true,
            count: meals.length,
            meals
        });

    } catch (error) {
        console.error('Get meals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching meals'
        });
    }
});

/**
 * @route   POST /api/meals
 * @desc    Log a new meal
 * @access  Private
 * 
 * Request body:
 * {
 *   "name": "Chicken Salad",
 *   "mealType": "lunch",
 *   "calories": 450,
 *   "protein": 35,
 *   "carbs": 20,
 *   "fats": 25,
 *   "fiber": 5
 * }
 */
router.post(
    '/',
    [
        body('name').trim().notEmpty().withMessage('Meal name is required'),
        body('calories').isInt({ min: 0 }).withMessage('Calories must be a positive number')
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

            const { name, mealType, calories, protein, carbs, fats, fiber } = req.body;

            // Create meal
            const meal = await Meal.create({
                userId: req.user.id,
                name,
                mealType: mealType || 'snack',
                calories,
                protein: protein || 0,
                carbs: carbs || 0,
                fats: fats || 0,
                fiber: fiber || 0
            });

            // Update daily progress
            const progress = await Progress.getOrCreateToday(req.user.id);
            progress.caloriesConsumed += calories;
            progress.proteinIntake += protein || 0;
            progress.carbsIntake += carbs || 0;
            progress.fatsIntake += fats || 0;
            await progress.save();

            res.status(201).json({
                success: true,
                message: 'Meal logged successfully!',
                meal
            });

        } catch (error) {
            console.error('Create meal error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error creating meal'
            });
        }
    }
);

/**
 * @route   GET /api/meals/today
 * @desc    Get today's meals with summary
 * @access  Private
 */
router.get('/today', async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const meals = await Meal.find({
            userId: req.user.id,
            date: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ date: 1 });

        const summary = await Meal.getDailySummary(req.user.id);

        res.json({
            success: true,
            meals,
            summary: {
                ...summary,
                calorieGoal: req.user.dailyCalorieGoal,
                remaining: req.user.dailyCalorieGoal - summary.totalCalories
            }
        });

    } catch (error) {
        console.error('Today meals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching today\'s meals'
        });
    }
});

/**
 * @route   GET /api/meals/weekly
 * @desc    Get weekly nutrition data for charts
 * @access  Private
 */
router.get('/weekly', async (req, res) => {
    try {
        const weeklyData = await Meal.getWeeklyData(req.user.id);

        // Format for chart display
        const formattedData = weeklyData.map(day => ({
            date: day._id,
            calories: day.totalCalories,
            protein: day.totalProtein,
            carbs: day.totalCarbs,
            fats: day.totalFats
        }));

        res.json({
            success: true,
            data: formattedData
        });

    } catch (error) {
        console.error('Weekly meals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching weekly data'
        });
    }
});

/**
 * @route   GET /api/meals/search
 * @desc    Search for foods using Open Food Facts API
 * @access  Private
 * 
 * This uses the free Open Food Facts API (no API key required)
 * Alternative: USDA FoodData Central API
 */
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        // Use Open Food Facts API (free, no API key needed)
        const response = await fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`
        );
        
        const data = await response.json();

        // Transform the response to our format
        const foods = (data.products || [])
            .filter(p => p.product_name && p.nutriments)
            .slice(0, 15)
            .map(product => {
                const n = product.nutriments;
                return {
                    id: product._id || product.code,
                    name: product.product_name,
                    brand: product.brands || '',
                    image: product.image_small_url || product.image_url,
                    servingSize: product.serving_quantity || 100,
                    servingUnit: product.serving_quantity ? 'serving' : 'grams',
                    // Nutrition per 100g
                    nutritionPer100g: {
                        calories: Math.round(n['energy-kcal_100g'] || n.energy_100g / 4.184 || 0),
                        protein: Math.round((n.proteins_100g || 0) * 10) / 10,
                        carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
                        fats: Math.round((n.fat_100g || 0) * 10) / 10,
                        fiber: Math.round((n.fiber_100g || 0) * 10) / 10,
                        sugar: Math.round((n.sugars_100g || 0) * 10) / 10,
                        sodium: Math.round(n.sodium_100g || 0)
                    },
                    // Suggested unit based on food type
                    suggestedUnit: getSuggestedUnit(product.product_name, product.categories_tags)
                };
            });

        res.json({
            success: true,
            count: foods.length,
            foods
        });

    } catch (error) {
        console.error('Food search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching for foods'
        });
    }
});

/**
 * Helper function to suggest appropriate unit for food
 */
function getSuggestedUnit(name, categories) {
    const nameLower = (name || '').toLowerCase();
    const cats = (categories || []).join(' ').toLowerCase();
    
    // Piece-based foods
    if (/egg|banana|apple|orange|cookie|biscuit|bread|slice|piece|bar|muffin|donut|samosa|paratha|roti|chapati|idli|dosa|vada/i.test(nameLower)) {
        return 'pieces';
    }
    
    // Liquid foods
    if (/milk|juice|water|soda|cola|drink|beverage|tea|coffee|smoothie|shake|lassi|buttermilk/i.test(nameLower) || /beverages/i.test(cats)) {
        return 'ml';
    }
    
    // Cup-based
    if (/rice|dal|curry|soup|cereal|oatmeal|porridge|khichdi|biryani/i.test(nameLower)) {
        return 'cups';
    }
    
    // Default to grams
    return 'grams';
}

/**
 * Common Indian foods database (fallback when API doesn't have results)
 */
const COMMON_FOODS = [
    { name: 'Chapati/Roti', calories: 71, protein: 2.7, carbs: 15, fats: 0.4, fiber: 2, unit: 'pieces', servingSize: 1 },
    { name: 'White Rice (cooked)', calories: 130, protein: 2.7, carbs: 28, fats: 0.3, fiber: 0.4, unit: 'cups', servingSize: 1 },
    { name: 'Dal (Lentils)', calories: 116, protein: 9, carbs: 20, fats: 0.4, fiber: 8, unit: 'cups', servingSize: 1 },
    { name: 'Paneer', calories: 265, protein: 18, carbs: 1.2, fats: 21, fiber: 0, unit: 'grams', servingSize: 100 },
    { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fats: 3.6, fiber: 0, unit: 'grams', servingSize: 100 },
    { name: 'Egg (Boiled)', calories: 78, protein: 6, carbs: 0.6, fats: 5, fiber: 0, unit: 'pieces', servingSize: 1 },
    { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fats: 0.3, fiber: 2.6, unit: 'pieces', servingSize: 1 },
    { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fats: 0.2, fiber: 2.4, unit: 'pieces', servingSize: 1 },
    { name: 'Milk (Full Fat)', calories: 61, protein: 3.2, carbs: 4.8, fats: 3.3, fiber: 0, unit: 'ml', servingSize: 100 },
    { name: 'Yogurt/Curd', calories: 59, protein: 3.5, carbs: 3.6, fats: 3.3, fiber: 0, unit: 'cups', servingSize: 1 },
    { name: 'Idli', calories: 39, protein: 2, carbs: 8, fats: 0.1, fiber: 0.5, unit: 'pieces', servingSize: 1 },
    { name: 'Dosa', calories: 168, protein: 4, carbs: 29, fats: 4, fiber: 1, unit: 'pieces', servingSize: 1 },
    { name: 'Samosa', calories: 262, protein: 4, carbs: 28, fats: 15, fiber: 2, unit: 'pieces', servingSize: 1 },
    { name: 'Biryani', calories: 250, protein: 8, carbs: 35, fats: 9, fiber: 1, unit: 'cups', servingSize: 1 },
    { name: 'Paratha', calories: 260, protein: 5, carbs: 32, fats: 13, fiber: 2, unit: 'pieces', servingSize: 1 },
    { name: 'Poha', calories: 180, protein: 4, carbs: 32, fats: 5, fiber: 2, unit: 'cups', servingSize: 1 },
    { name: 'Upma', calories: 165, protein: 4, carbs: 28, fats: 5, fiber: 2, unit: 'cups', servingSize: 1 },
    { name: 'Oats', calories: 68, protein: 2.4, carbs: 12, fats: 1.4, fiber: 1.7, unit: 'cups', servingSize: 1 },
    { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fats: 50, fiber: 12, unit: 'grams', servingSize: 100 },
    { name: 'Peanuts', calories: 567, protein: 26, carbs: 16, fats: 49, fiber: 9, unit: 'grams', servingSize: 100 },
];

/**
 * @route   GET /api/meals/common
 * @desc    Get common foods list (for quick add)
 * @access  Private
 */
router.get('/common', async (req, res) => {
    res.json({
        success: true,
        foods: COMMON_FOODS.map((food, index) => ({
            id: `common_${index}`,
            ...food,
            nutritionPer100g: food.unit === 'grams' ? {
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fats: food.fats,
                fiber: food.fiber
            } : null
        }))
    });
});

/**
 * @route   DELETE /api/meals/:id
 * @desc    Delete a meal
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
    try {
        const meal = await Meal.findById(req.params.id);

        if (!meal) {
            return res.status(404).json({
                success: false,
                message: 'Meal not found'
            });
        }

        // Make sure user owns the meal
        if (meal.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this meal'
            });
        }

        await meal.deleteOne();

        res.json({
            success: true,
            message: 'Meal deleted'
        });

    } catch (error) {
        console.error('Delete meal error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting meal'
        });
    }
});

module.exports = router;
