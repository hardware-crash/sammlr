// controllers/transactionController.js

const { Transaction, Game, Console } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

exports.getCollection = async (req, res) => {
  try {
    const userId = req.user.id;

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
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    const result = transactions.map(tx => ({
      transaction_id: tx.id,
      game_id: tx.game_id,
      item_title: tx.game.title,
      console_name: tx.game.console ? tx.game.console.name : null,
      category_name: tx.game.category ? tx.game.category.name : null, // Ensure association
      cover_url: tx.game.cover_url,
      purchase_date: tx.transaction_date.toISOString().split('T')[0],
      purchase_price: tx.price,
      conditions: tx.conditions, // Adjust based on your model
      condition_id: tx.condition_id,
      description: tx.description,
      quantity: tx.quantity,
      cib_avg_price: tx.game.cib_avg_price,
      loose_avg_price: tx.game.loose_avg_price,
      new_avg_price: tx.game.new_avg_price,
    }));

    res.json(result);
  } catch (error) {
    console.error('Get Collection Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.addToCollection = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      game_id,
      console_id,
      quantity,
      purchase_price,
      condition_id,
      description,
      purchase_date,
      conditions,
    } = req.body;

    // Validate required fields
    if (!game_id || !console_id || !quantity || !purchase_price || !condition_id || !purchase_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const transactionDate = new Date(purchase_date);
    if (isNaN(transactionDate)) {
      return res.status(400).json({ message: 'Invalid purchase_date format. Use YYYY-MM-DD.' });
    }

    const transaction = await Transaction.create({
      user_id: userId,
      game_id: game_id,
      console_id: console_id,
      transaction_type: 'purchase',
      quantity: quantity,
      price: purchase_price,
      transaction_date: transactionDate,
      condition_id: condition_id,
      description: description,
      conditions: conditions ? conditions.join(',') : null,
    });

    res.status(201).json(transaction.serialize());
  } catch (error) {
    console.error('Add to Collection Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateCollectionItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id } = req.params;
    const data = req.body;

    const transaction = await Transaction.findByPk(item_id);
    if (!transaction) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (transaction.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    // Update fields
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

    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        if (field === 'purchase_date') {
          transaction.transaction_date = new Date(data[field]);
        } else if (field === 'conditions') {
          transaction.conditions = Array.isArray(data.conditions) ? data.conditions.join(',') : data.conditions;
        } else {
          transaction[field] = data[field];
        }
      }
    });

    await transaction.save();

    res.json(transaction.serialize());
  } catch (error) {
    console.error('Update Collection Item Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteCollectionItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { item_id } = req.params;

    const transaction = await Transaction.findByPk(item_id);
    if (!transaction) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (transaction.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized action' });
    }

    await transaction.destroy();

    res.status(204).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete Collection Item Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// exports.getCollectionMetrics = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { start_date, end_date } = req.query;

//     if (!start_date || !end_date) {
//       return res.status(400).json({ error: 'start_date and end_date are required' });
//     }

//     const startDate = new Date(start_date);
//     const endDate = new Date(end_date);

//     if (isNaN(startDate) || isNaN(endDate)) {
//       return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
//     }

//     // Define mapping based on condition_id
//     // Example: condition_id 1 => loose_avg_price, 2 => cib_avg_price, 3 => new_avg_price
//     const averagePrice = sequelize.literal(`
//       CASE
//         WHEN condition_id = 1 THEN loose_avg_price
//         WHEN condition_id = 2 THEN cib_avg_price
//         WHEN condition_id = 3 THEN new_avg_price
//         ELSE loose_avg_price
//       END
//     `);

//     // Initial aggregates before start_date
//     const initialAggregates = await Transaction.findOne({
//       attributes: [
//         [fn('COALESCE', fn('SUM', sequelize.literal(`CASE WHEN transaction_type = 'purchase' THEN ${averagePrice} * quantity ELSE 0 END`)), 0), 'initial_value'],
//         [fn('COALESCE', fn('SUM', sequelize.literal(`CASE WHEN transaction_type = 'purchase' THEN price ELSE 0 END`)), 0), 'initial_cost'],
//         [fn('COALESCE', fn('SUM', sequelize.literal(`CASE 
//           WHEN transaction_type = 'purchase' THEN quantity 
//           WHEN transaction_type = 'sale' THEN -quantity 
//           ELSE 0 
//         END`)), 0), 'initial_count'],
//       ],
//       where: {
//         user_id: userId,
//         transaction_date: {
//           [Op.lt]: startDate,
//         },
//       },
//       raw: true,
//     });

//     let initialValue = parseFloat(initialAggregates.initial_value) || 0;
//     let initialCost = parseFloat(initialAggregates.initial_cost) || 0;
//     let initialCount = parseInt(initialAggregates.initial_count) || 0;

//     // Fetch transactions within the date range
//     const dailyTransactions = await Transaction.findAll({
//       attributes: [
//         'transaction_date',
//         [fn('COALESCE', fn('SUM', sequelize.literal(`CASE WHEN transaction_type = 'purchase' THEN ${averagePrice} * quantity ELSE 0 END`)), 0), 'total_value'],
//         [fn('COALESCE', fn('SUM', sequelize.literal(`CASE WHEN transaction_type = 'purchase' THEN price ELSE 0 END`)), 0), 'total_cost'],
//         [fn('COALESCE', fn('SUM', sequelize.literal(`CASE 
//           WHEN transaction_type = 'purchase' THEN quantity 
//           WHEN transaction_type = 'sale' THEN -quantity 
//           ELSE 0 
//         END`)), 0), 'total_count'],
//       ],
//       where: {
//         user_id: userId,
//         transaction_date: {
//           [Op.between]: [startDate, endDate],
//         },
//       },
//       group: ['transaction_date'],
//       order: [['transaction_date', 'ASC']],
//       raw: true,
//     });

//     // Create a date range array
//     const dateRange = [];
//     const currentDate = new Date(startDate);
//     while (currentDate <= endDate) {
//       dateRange.push(new Date(currentDate));
//       currentDate.setDate(currentDate.getDate() + 1);
//     }

//     // Create a map for daily transactions
//     const dailyMap = {};
//     dailyTransactions.forEach(tx => {
//       const dateStr = tx.transaction_date.toISOString().split('T')[0];
//       dailyMap[dateStr] = {
//         total_value: parseFloat(tx.total_value) || 0,
//         total_cost: parseFloat(tx.total_cost) || 0,
//         total_count: parseInt(tx.total_count) || 0,
//       };
//     });

//     const metrics = [];
//     let cumulativeValue = initialValue;
//     let cumulativeCost = initialCost;
//     let cumulativeCount = initialCount;

//     dateRange.forEach(date => {
//       const dateStr = date.toISOString().split('T')[0];
//       const tx = dailyMap[dateStr];

//       if (tx) {
//         cumulativeValue += tx.total_value;
//         cumulativeCost += tx.total_cost;
//         cumulativeCount += tx.total_count;
//       }

//       const profit = cumulativeValue - cumulativeCost;

//       metrics.push({
//         date: dateStr,
//         total_value: parseFloat(cumulativeValue.toFixed(2)),
//         total_cost: parseFloat(cumulativeCost.toFixed(2)),
//         total_count: cumulativeCount,
//         profit: parseFloat(profit.toFixed(2)),
//       });
//     });

//     res.json(metrics);
//   } catch (error) {
//     console.error('Collection Metrics Error:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
