// controllers/collectionController.js

const { Transaction, Game, Console, Category } = require('../models');
const { Op, fn, col, literal, where } = require('sequelize'); // Removed 'case'
const { parseISO, isValid } = require('date-fns'); // Ensure date-fns is installed
const logger = require('../logger'); // Ensure logger.js exists and is correctly implemented

// Helper function to serialize Transaction objects
const serializeTransaction = (transaction) => {
    return {
        transaction_id: transaction.id,
        game_id: transaction.game_id,
        item_title: transaction.game.title,
        console_name: transaction.game.console ? transaction.game.console.name : null,
        category_name: transaction.game.category ? transaction.game.category.name : null,
        cover_url: transaction.game.cover_url,
        purchase_date: transaction.transaction_date, // 'YYYY-MM-DD'
        purchase_price: transaction.price,
        conditions: transaction.conditions, // Comma-separated string
        condition_id: transaction.condition_id,
        description: transaction.description,
        quantity: transaction.quantity,
        cib_avg_price: transaction.game.cib_avg_price,
        loose_avg_price: transaction.game.loose_avg_price,
        new_avg_price: transaction.game.new_avg_price,
    };
};

// GET /api/collection
exports.getItemsInCollection = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure req.user is set by auth middleware

        if (!userId) {
            logger.warn('User ID not provided in request.');
            return res.status(400).json({ message: 'User ID not provided' });
        }

        // Fetch all transactions of type 'purchase' for the current user
        const transactions = await Transaction.findAll({
            where: {
                user_id: userId,
                transaction_type: 'purchase',
            },
            include: [
                {
                    model: Game,
                    as: 'game',
                    include: [
                        {
                            model: Console,
                            as: 'console',
                            attributes: ['name'],
                        },
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['name'],
                        },
                    ],
                    attributes: ['id', 'title', 'cover_url', 'cib_avg_price', 'loose_avg_price', 'new_avg_price'],
                },
            ],
            order: [['transaction_date', 'DESC']],
        });

        const result = transactions.map(serializeTransaction);

        return res.status(200).json(result);
    } catch (error) {
        logger.error('Get Items in Collection Error:', { message: error.message, stack: error.stack });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// POST /api/collection
exports.addToCollection = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure req.user is set by auth middleware
        const {
            game_id,
            console_id,
            quantity,
            purchase_price,
            condition_id,
            description,
            purchase_date,
            conditions, // Array of conditions
        } = req.body;

        if (!userId) {
            logger.warn('User ID not provided in request.');
            return res.status(400).json({ message: 'User ID not provided' });
        }

        // Validate required fields
        if (!game_id || !quantity || !purchase_price || !purchase_date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate purchase_date
        const parsedDate = parseISO(purchase_date);
        if (!isValid(parsedDate)) {
            return res.status(400).json({ message: 'Invalid purchase_date format. Use YYYY-MM-DD' });
        }

        // Fetch the game to ensure it exists
        const game = await Game.findByPk(game_id);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        // Optionally, validate console_id if provided
        if (console_id) {
            const console = await Console.findByPk(console_id);
            if (!console) {
                return res.status(404).json({ message: 'Console not found' });
            }
        }

        // Convert conditions array to comma-separated string
        const conditionsStr = conditions && Array.isArray(conditions) ? conditions.join(',') : null;

        // Create the transaction
        const transaction = await Transaction.create({
            game_id,
            console_id: console_id || null,
            user_id: userId,
            transaction_type: 'purchase',
            quantity,
            price: purchase_price,
            transaction_date: purchase_date,
            condition_id: condition_id || null,
            description: description || null,
            conditions: conditionsStr,
        });

        // Fetch the newly created transaction with associations
        const newTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                {
                    model: Game,
                    as: 'game',
                    include: [
                        {
                            model: Console,
                            as: 'console',
                            attributes: ['name'],
                        },
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['name'],
                        },
                    ],
                    attributes: ['id', 'title', 'cover_url', 'cib_avg_price', 'loose_avg_price', 'new_avg_price'],
                },
            ],
        });

        const serializedTransaction = serializeTransaction(newTransaction);

        return res.status(201).json(serializedTransaction);
    } catch (error) {
        logger.error('Add to Collection Error:', { message: error.message, stack: error.stack });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// PUT /api/collection/:item_id
exports.updateItemInCollection = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure req.user is set by auth middleware
        const { item_id } = req.params;
        const data = req.body;

        if (!userId) {
            logger.warn('User ID not provided in request.');
            return res.status(400).json({ message: 'User ID not provided' });
        }

        // Fetch the transaction by ID
        const transaction = await Transaction.findByPk(item_id, {
            include: [
                {
                    model: Game,
                    as: 'game',
                    include: [
                        {
                            model: Console,
                            as: 'console',
                            attributes: ['name'],
                        },
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['name'],
                        },
                    ],
                    attributes: ['id', 'title', 'cover_url', 'cib_avg_price', 'loose_avg_price', 'new_avg_price'],
                },
            ],
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Item not found in collection' });
        }

        // Ensure the transaction belongs to the current user
        if (transaction.user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        // Update fields if provided
        const updatableFields = [
            'game_id',
            'console_id',
            'quantity',
            'purchase_price',
            'condition_id',
            'description',
            'purchase_date',
            'conditions',
        ];

        for (const field of updatableFields) {
            if (field in data) {
                if (field === 'purchase_date') {
                    const parsedDate = parseISO(data[field]);
                    if (!isValid(parsedDate)) {
                        return res.status(400).json({ message: 'Invalid purchase_date format. Use YYYY-MM-DD' });
                    }
                    transaction.transaction_date = data[field];
                } else if (field === 'conditions') {
                    transaction.conditions = Array.isArray(data.conditions) ? data.conditions.join(',') : transaction.conditions;
                } else {
                    transaction[field] = data[field];
                }
            }
        }

        // If game_id is being updated, ensure the new game exists
        if ('game_id' in data) {
            const newGame = await Game.findByPk(data.game_id);
            if (!newGame) {
                return res.status(404).json({ message: 'Game not found' });
            }
        }

        // If console_id is being updated, ensure the new console exists
        if ('console_id' in data && data.console_id) {
            const newConsole = await Console.findByPk(data.console_id);
            if (!newConsole) {
                return res.status(404).json({ message: 'Console not found' });
            }
        }

        // Save the updated transaction
        await transaction.save();

        // Fetch the updated transaction with associations
        const updatedTransaction = await Transaction.findByPk(transaction.id, {
            include: [
                {
                    model: Game,
                    as: 'game',
                    include: [
                        {
                            model: Console,
                            as: 'console',
                            attributes: ['name'],
                        },
                        {
                            model: Category,
                            as: 'category',
                            attributes: ['name'],
                        },
                    ],
                    attributes: ['id', 'title', 'cover_url', 'cib_avg_price', 'loose_avg_price', 'new_avg_price'],
                },
            ],
        });

        const serializedTransaction = serializeTransaction(updatedTransaction);

        return res.status(200).json(serializedTransaction);
    } catch (error) {
        logger.error('Update Item in Collection Error:', { message: error.message, stack: error.stack });
        if (error.message.startsWith('Invalid purchase_date')) {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

// DELETE /api/collection/:item_id
exports.deleteItemInCollection = async (req, res) => {
    try {
        const userId = req.user.id; // Ensure req.user is set by auth middleware
        const { item_id } = req.params;

        if (!userId) {
            logger.warn('User ID not provided in request.');
            return res.status(400).json({ message: 'User ID not provided' });
        }

        // Fetch the transaction by ID
        const transaction = await Transaction.findByPk(item_id);

        if (!transaction) {
            return res.status(404).json({ message: 'Item not found in collection' });
        }

        // Ensure the transaction belongs to the current user
        if (transaction.user_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        // Delete the transaction
        await transaction.destroy();

        return res.status(204).send(); // No Content
    } catch (error) {
        logger.error('Delete Item in Collection Error:', { message: error.message, stack: error.stack });
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.collectionMetrics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { start_date, end_date } = req.query;

        if (!userId) {
            logger.warn('User ID not provided in request.');
            return res.status(400).json({ message: 'User ID not provided' });
        }

        if (!start_date || !end_date) {
            logger.warn('Missing start_date or end_date in request.');
            return res.status(400).json({ error: 'start_date and end_date are required' });
        }

        // Disable caching
        res.set('Cache-Control', 'no-store');

        // Parse and validate dates
        const startDate = parseISO(start_date);
        const endDate = parseISO(end_date);

        if (!isValid(startDate) || !isValid(endDate)) {
            logger.warn('Invalid date format in request.');
            return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }

        if (startDate > endDate) {
            logger.warn('start_date is after end_date.');
            return res.status(400).json({ error: 'start_date cannot be after end_date.' });
        }

        // Calculate the next day after end_date
        const nextDay = new Date(endDate);
        nextDay.setDate(endDate.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0]; // '2024-09-26'

        logger.info(`Fetching metrics for user ${userId} from ${start_date} to ${end_date}`);

        // Define the condition price mapping using Sequelize's literal
        const averagePrice = literal(`
            CASE
                WHEN \`Transaction\`.\`condition_id\` = 1 THEN \`game\`.\`loose_avg_price\`
                WHEN \`Transaction\`.\`condition_id\` = 2 THEN \`game\`.\`cib_avg_price\`
                WHEN \`Transaction\`.\`condition_id\` = 3 THEN \`game\`.\`new_avg_price\`
                ELSE \`game\`.\`loose_avg_price\`
            END
        `);

        // Initial aggregated values before start_date
        const initialAgg = await Transaction.findOne({
            where: {
                user_id: userId,
                transaction_date: { [Op.lt]: start_date },
                transaction_type: 'purchase',
            },
            include: [
                {
                    model: Game,
                    as: 'game',
                    attributes: [], // Required for JOIN
                },
            ],
            attributes: [
                [literal(`COALESCE(SUM(
                    CASE
                        WHEN \`Transaction\`.\`condition_id\` = 1 THEN \`game\`.\`loose_avg_price\`
                        WHEN \`Transaction\`.\`condition_id\` = 2 THEN \`game\`.\`cib_avg_price\`
                        WHEN \`Transaction\`.\`condition_id\` = 3 THEN \`game\`.\`new_avg_price\`
                        ELSE \`game\`.\`loose_avg_price\`
                    END * \`quantity\`
                ), 0)`), 'initial_value'],
                [fn('COALESCE', fn('SUM', col('price')), 0), 'initial_cost'],
                [fn('COALESCE', fn('SUM', col('quantity')), 0), 'initial_count'],
            ],
            raw: true,
        });

        const initial_value = parseFloat(initialAgg.initial_value) || 0;
        const initial_cost = parseFloat(initialAgg.initial_cost) || 0;
        const initial_count = parseInt(initialAgg.initial_count, 10) || 0;

        // logger.info(`Initial Aggregates: value=${initial_value}, cost=${initial_cost}, count=${initial_count}`);

        // Fetch transactions within the date range [Op.gte]: start_date and [Op.lt]: nextDayStr
        const transactions = await Transaction.findAll({
            where: {
                user_id: userId,
                transaction_date: {
                    [Op.gte]: start_date,
                    [Op.lt]: nextDayStr,
                },
                transaction_type: 'purchase',
            },
            include: [
                {
                    model: Game,
                    as: 'game',
                    attributes: [], // Required for JOIN
                },
            ],
            attributes: [
                'transaction_date',
                [literal(`COALESCE(SUM(
                    CASE
                        WHEN \`Transaction\`.\`condition_id\` = 1 THEN \`game\`.\`loose_avg_price\`
                        WHEN \`Transaction\`.\`condition_id\` = 2 THEN \`game\`.\`cib_avg_price\`
                        WHEN \`Transaction\`.\`condition_id\` = 3 THEN \`game\`.\`new_avg_price\`
                        ELSE \`game\`.\`loose_avg_price\`
                    END * \`quantity\`
                ), 0)`), 'total_value'],
                [fn('COALESCE', fn('SUM', col('price')), 0), 'total_cost'],
                [fn('COALESCE', fn('SUM', col('quantity')), 0), 'total_count'],
            ],
            group: ['transaction_date'],
            order: [['transaction_date', 'ASC']],
            raw: true,
        });

        // logger.info(`Fetched ${transactions.length} transactions between ${start_date} and ${end_date}`);

        // // Log each fetched transaction's details
        // transactions.forEach(tx => {
        //     logger.info(`Transaction on ${tx.transaction_date}: value=${tx.total_value}, cost=${tx.total_cost}, count=${tx.total_count}`);
        // });

        // Organize transactions by date
        const dailyDict = {};
        transactions.forEach(tx => {
            dailyDict[tx.transaction_date] = {
                total_value: parseFloat(tx.total_value) || 0,
                total_cost: parseFloat(tx.total_cost) || 0,
                total_count: parseInt(tx.total_count, 10) || 0,
            };
        });

        // Generate the date range
        const dateRange = [];
        let currentDate = new Date(startDate);
        const endDateObj = new Date(endDate);
        while (currentDate <= endDateObj) {
            const dateStr = currentDate.toISOString().split('T')[0];
            dateRange.push(dateStr);
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // logger.info(`Date Range: ${dateRange.join(', ')}`);

        // Calculate cumulative metrics
        const metrics = [];
        let cumulative_value = initial_value;
        let cumulative_cost = initial_cost;
        let cumulative_count = initial_count;

        dateRange.forEach(date => {
            if (dailyDict[date]) {
                cumulative_value += dailyDict[date].total_value;
                cumulative_cost += dailyDict[date].total_cost;
                cumulative_count += dailyDict[date].total_count;
            }
            const profit = cumulative_value - cumulative_cost;
            metrics.push({
                date,
                total_value: parseFloat(cumulative_value.toFixed(2)),
                total_cost: parseFloat(cumulative_cost.toFixed(2)),
                total_count: cumulative_count,
                profit: parseFloat(profit.toFixed(2)),
            });
        });

        // logger.info(`Calculated Metrics: ${JSON.stringify(metrics)}`);

        // Ensure the end_date is included in the metrics
        if (!metrics.some(metric => metric.date === end_date)) {
            const lastMetric = metrics[metrics.length - 1];
            metrics.push({
                date: end_date,
                total_value: parseFloat(lastMetric.total_value.toFixed(2)),
                total_cost: parseFloat(lastMetric.total_cost.toFixed(2)),
                total_count: lastMetric.total_count,
                profit: parseFloat(lastMetric.profit.toFixed(2)),
            });
            logger.info(`Appended end_date metrics for ${end_date}`);
        }

        // logger.info(`Final Metrics Length: ${metrics.length}`);
        // logger.info(`Last Metric Entry: ${JSON.stringify(metrics[metrics.length - 1])}`);

        return res.status(200).json(metrics);
    } catch (error) {
        logger.error('Collection Metrics Error:', { message: error.message, stack: error.stack });
        return res.status(500).json({ error: 'Internal server error' });
    }
};