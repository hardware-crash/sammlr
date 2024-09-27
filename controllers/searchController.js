// controllers/searchController.js
const { Game, Console } = require('../models');
const { Op } = require('sequelize');

/**
 * Search for games based on query parameters and sort them by console.
 * Supports filtering by title, genre, publisher, and console.
 * Implements pagination with `page` and `limit` query parameters.
 */
exports.searchGames = async (req, res) => {
  try {
    const {
      title, // Renamed from name to title
      genre,
      publisher,
      console, // To filter by console name
      page = 1,
      limit = 20,
    } = req.query;

    // Build the where clause based on provided filters
    const whereClause = {};

    if (title) {
      whereClause.title = {
        [Op.like]: `%${title}%`, // Partial match
      };
    }

    if (genre) {
      whereClause.genre = {
        [Op.like]: `%${genre}%`,
      };
    }

    if (publisher) {
      whereClause.publisher = {
        [Op.like]: `%${publisher}%`,
      };
    }

    // Build the include clause for console
    const includeClause = {
      model: Console,
      as: 'console',
      attributes: ['id', 'name'], // Select only necessary fields
    };

    if (console) {
      includeClause.where = {
        name: {
          [Op.like]: `%${console}%`,
        },
      };
    }

    // Implement pagination
    const offset = (page - 1) * limit;
    const parsedLimit = parseInt(limit, 10) > 0 ? parseInt(limit, 10) : 20;

    // Execute the query
    const { count, rows } = await Game.findAndCountAll({
      where: whereClause,
      include: [includeClause],
      order: [
        [{ model: Console, as: 'console' }, 'name', 'ASC'], // Sort by console name ascending
        ['title', 'ASC'], // Then sort by game title ascending
      ],
      limit: parsedLimit,
      offset,
    });

    // Prepare pagination info
    const totalPages = Math.ceil(count / parsedLimit);

    return res.status(200).json({
      totalItems: count,
      totalPages,
      currentPage: parseInt(page, 10),
      items: rows,
    });
  } catch (error) {
    console.error('Search Games Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
