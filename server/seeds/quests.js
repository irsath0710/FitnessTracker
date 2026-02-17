/**
 * Seed quest templates into the database.
 * Run once: node seeds/quests.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Quest = require('../models/Quest');

const quests = [
    // Daily quests — easy
    { questId: 'burn_200', type: 'daily', category: 'workout', title: 'Burn 200 Cal', description: 'Burn 200+ calories through workouts', target: 200, xpReward: 50, difficulty: 'easy', icon: '🔥', minRank: 'E' },
    { questId: 'log_meal', type: 'daily', category: 'nutrition', title: 'Log a Meal', description: 'Log at least one meal today', target: 1, xpReward: 20, difficulty: 'easy', icon: '🍽️', minRank: 'E' },
    { questId: 'any_workout', type: 'daily', category: 'workout', title: 'Do Any Workout', description: 'Complete at least one workout', target: 1, xpReward: 30, difficulty: 'easy', icon: '💪', minRank: 'E' },

    // Daily quests — medium
    { questId: 'burn_300', type: 'daily', category: 'workout', title: 'Burn 300 Cal', description: 'Burn 300+ calories through workouts', target: 300, xpReward: 80, difficulty: 'medium', icon: '🔥', minRank: 'D' },
    { questId: 'log_3_meals', type: 'daily', category: 'nutrition', title: 'Log 3 Meals', description: 'Log at least 3 meals today', target: 3, xpReward: 60, difficulty: 'medium', icon: '🍽️', minRank: 'E' },

    // Daily quests — hard
    { questId: 'burn_500', type: 'daily', category: 'workout', title: 'Burn 500 Cal', description: 'Burn 500+ calories through intense workouts', target: 500, xpReward: 120, difficulty: 'hard', icon: '💥', minRank: 'C' },

    // Weekly quests
    { questId: 'weekly_5_workouts', type: 'weekly', category: 'workout', title: '5 Workouts This Week', description: 'Complete 5 workouts in a single week', target: 5, xpReward: 200, difficulty: 'medium', icon: '📅', minRank: 'E' },
    { questId: 'weekly_burn_2000', type: 'weekly', category: 'workout', title: 'Burn 2000 Cal This Week', description: 'Burn a total of 2000 calories this week', target: 2000, xpReward: 300, difficulty: 'hard', icon: '🏆', minRank: 'D' },
    { questId: 'weekly_streak_7', type: 'weekly', category: 'streak', title: '7-Day Streak', description: 'Maintain a 7-day workout streak', target: 7, xpReward: 500, difficulty: 'hard', icon: '🔥', minRank: 'E' },
];

async function seed() {
    try {
        await connectDB();
        console.log('Connected to database');

        // Upsert each quest
        for (const quest of quests) {
            await Quest.findOneAndUpdate(
                { questId: quest.questId },
                quest,
                { upsert: true, new: true }
            );
            console.log(`  ✓ ${quest.questId}`);
        }

        console.log(`\nSeeded ${quests.length} quest templates`);
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
