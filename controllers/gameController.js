// controllers/gameController.js

const { Game, Console, Price } = require('../models');
const { Op } = require('sequelize');

exports.getGamesByConsoleName = async (req, res) => {
  try {
    const { console_name } = req.params;

    // Convert hyphenated to spaces
    const consoleName = console_name.replace(/-/g, ' ');

    // Find the console (case-insensitive)
    const console = await Console.findOne({
      where: {
        name: {
          [Op.iLike]: consoleName,
        },
      },
    });

    if (!console) {
      return res.status(404).json({ error: 'Console not found' });
    }

    // Query parameters for sorting, pagination, search
    const { sort_by = 'title', sort_order = 'asc', page = 1, per_page = 50, search = '', letter = '' } = req.query;

    // Build query
    let queryOptions = {
      where: {
        console_id: console.id,
        title: {
          [Op.iLike]: `%${search}%`,
        },
      },
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(per_page),
      offset: (parseInt(page) - 1) * parseInt(per_page),
    };

    if (letter) {
      queryOptions.where.title[Op.iLike] = `${letter}%`;
    }

    const { rows: games, count: total_games } = await Game.findAndCountAll(queryOptions);

    const total_pages = Math.ceil(total_games / per_page);

    res.json({
      console: {
        name: console.name,
        image_url: console.image_url,
      },
      games,
      total_games,
      total_pages,
      current_page: parseInt(page),
      per_page: parseInt(per_page),
    });
  } catch (error) {
    console.error('Get Games By Console Name Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getGameDetailsByConsoleAndName = async (req, res) => {
    try {
      const { console_name, game_name } = req.params;
  
      // Find the console by name (case-insensitive)
      const console = await Console.findOne({
        where: {
          name_lower: console_name.toLowerCase(),
        },
      });
  
      if (!console) {
        return res.status(404).json({ message: 'Console not found' });
      }
  
      // Find the game by name and console_id (case-insensitive)
      const game = await Game.findOne({
        where: {
          console_id: console.id,
          title_lower: game_name.toLowerCase(),
        },
        include: [{
          model: Price,
          as: 'prices',
          attributes: ['id', 'price_type', 'amount'], // Adjust based on Price model
        }],
      });
  
      if (!game) {
        return res.status(404).json({ message: 'Game not found' });
      }
  
      res.json({
        game: {
          id: game.id,
          title: game.title,
          release_date: game.release_date,
          genre: game.genre,
          pegi_rating: game.pegi_rating,
          publisher: game.publisher,
          developer: game.developer,
          model_number: game.model_number,
          disc_count: game.disc_count,
          player_count: game.player_count,
          also_compatible_on: game.also_compatible_on,
          cover_url: game.cover_url,
          // Add other game fields as necessary
        },
        prices: game.prices,
      });
    } catch (error) {
      console.error('Get Game Details By Console And Name Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

exports.getGame = async (req, res) => {
  try {
    const { game_id } = req.params;

    const game = await Game.findByPk(game_id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Get Game Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.searchGames = async (req, res) => {
  try {
    const { q, page = 1, per_page = 50 } = req.query;

    if (!q) {
      return res.json({ games: [], total: 0, page: 1, per_page: 50, total_pages: 0 });
    }

    const games = await Game.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { title_usa: { [Op.iLike]: `%${q}%` } },
          { title_eur: { [Op.iLike]: `%${q}%` } },
          { title_jap: { [Op.iLike]: `%${q}%` } },
          { title_fra: { [Op.iLike]: `%${q}%` } },
        ],
      },
      limit: parseInt(per_page),
      offset: (parseInt(page) - 1) * parseInt(per_page),
    });

    const total_pages = Math.ceil(games.count / per_page);

    res.json({
      games: games.rows,
      total: games.count,
      page: parseInt(page),
      per_page: parseInt(per_page),
      total_pages,
    });
  } catch (error) {
    console.error('Search Games Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateGame = async (req, res) => {
  try {
    const { game_id } = req.params;
    const data = req.body;

    const game = await Game.findByPk(game_id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Update fields
    const updatableFields = [
      'title',
      'release_date',
      'genre',
      'pegi_rating',
      'publisher',
      'developer',
      'model_number',
      'disc_count',
      'player_count',
      'also_compatible_on',
      'description',
      'gtin_number',
      'upc_number',
      'asin_number',
    ];

    updatableFields.forEach(field => {
      if (data[field] !== undefined) {
        game[field] = data[field];
      }
    });

    await game.save();

    res.json(game);
  } catch (error) {
    console.error('Update Game Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteGame = async (req, res) => {
  try {
    const { game_id } = req.params;

    const game = await Game.findByPk(game_id);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    await game.destroy();

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    console.error('Delete Game Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.uploadGameCover = async (req, res) => {
  try {
    const { game_id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = req.file.filename;

    const game = await Game.findByPk(game_id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    game.cover_url = filename;
    await game.save();

    res.status(200).json({ message: 'Cover uploaded successfully', coverUrl: filename });
  } catch (error) {
    console.error('Upload Game Cover Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getGameWithPrices = async (req, res) => {
  try {
    const { game_id } = req.params;

    const game = await Game.findByPk(game_id, {
      include: [
        {
          model: Price,
          as: 'prices',
        },
      ],
    });

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Get Game With Prices Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
