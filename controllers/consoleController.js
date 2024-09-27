// controllers/consoleController.js

const { Console, Game, Manufacturer } = require('../models');
const path = require('path');

// Existing function to get games by console name
exports.getGamesByConsoleName = async (req, res) => {
    try {
      const { console_name } = req.params;
  
      // Convert hyphenated format to spaces and lowercase for consistency
      const consoleNameHumanReadable = console_name.replace(/-/g, ' ').toLowerCase();
  
      // Find the console by name_lower
      const console = await Console.findOne({
        where: {
          name_lower: consoleNameHumanReadable,
        },
      });
  
      if (!console) {
        return res.status(404).json({ error: 'Console not found' });
      }
  
      const consoleId = console.id;
  
      // Extract query parameters with defaults
      const sort_by = req.query.sort_by || 'title'; // Default to 'title'
      const sort_order = req.query.sort_order === 'desc' ? 'DESC' : 'ASC'; // Default to 'ASC'
      const page = parseInt(req.query.page) || 1;
      const per_page = parseInt(req.query.per_page) || 50;
      const search = req.query.search ? req.query.search.trim().toLowerCase() : '';
      const letter = req.query.letter ? req.query.letter.trim().toUpperCase() : '';
  
      // Define allowed sort fields
      const allowedSortBy = ['title', 'cib_avg_price', 'loose_avg_price'];
      if (!allowedSortBy.includes(sort_by)) {
        return res.status(400).json({ error: `Invalid sort_by field. Allowed fields: ${allowedSortBy.join(', ')}` });
      }
  
      // Base query options
      const queryOptions = {
        where: {
          console_id: consoleId,
        },
        attributes: ['id', 'title', 'cover_url', 'cib_avg_price', 'loose_avg_price'],
        order: [[sort_by, sort_order]],
        limit: per_page,
        offset: (page - 1) * per_page,
      };
  
      // Apply search filter if provided
      if (search) {
        queryOptions.where.title_lower = {
          [Op.like]: `%${search}%`,
        };
      }
  
      // Apply first letter filter if provided
      if (letter) {
        queryOptions.where.title_lower = {
          ...(queryOptions.where.title_lower || {}),
          [Op.like]: `${letter}%`,
        };
      }
  
      // Execute the query
      const { rows: games, count: total_games } = await Game.findAndCountAll(queryOptions);
  
      // Calculate total pages
      const total_pages = Math.ceil(total_games / per_page);
  
      // Prepare the response list
      const games_list = games.map(game => ({
        id: game.id,
        title: game.title,
        coverUrl: game.cover_url,
        cib_avg_price: parseFloat(game.cib_avg_price) || 0,
        loose_avg_price: parseFloat(game.loose_avg_price) || 0,
      }));
  
      // Return the paginated list of games along with console details
      res.json({
        console: {
          name: console.name,
          image_url: console.image_url,
          console_id: console.id,
        },
        games: games_list,
        total_games,
        total_pages,
        current_page: page,
        per_page,
      });
    } catch (error) {
      console.error('Error fetching games by console name:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

// Define manufacturer-related functions
exports.addManufacturer = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Manufacturer name is required' });
    }

    const existingManufacturer = await Manufacturer.findOne({ where: { name } });
    if (existingManufacturer) {
      return res.status(400).json({ message: 'Manufacturer already exists' });
    }

    const manufacturer = await Manufacturer.create({ name });

    res.status(201).json(manufacturer);
  } catch (error) {
    console.error('Add Manufacturer Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateManufacturer = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const manufacturer = await Manufacturer.findByPk(id);
    if (!manufacturer) {
      return res.status(404).json({ message: 'Manufacturer not found' });
    }

    if (name) {
      manufacturer.name = name;
    }

    await manufacturer.save();

    res.json(manufacturer);
  } catch (error) {
    console.error('Update Manufacturer Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteManufacturer = async (req, res) => {
  try {
    const { id } = req.params;

    const manufacturer = await Manufacturer.findByPk(id);
    if (!manufacturer) {
      return res.status(404).json({ message: 'Manufacturer not found' });
    }

    await manufacturer.destroy();

    res.json({ message: 'Manufacturer deleted' });
  } catch (error) {
    console.error('Delete Manufacturer Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.uploadManufacturerImage = async (req, res) => {
  try {
    const { manufacturer_id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = req.file.filename;

    const manufacturer = await Manufacturer.findByPk(manufacturer_id);
    if (!manufacturer) {
      return res.status(404).json({ error: 'Manufacturer not found' });
    }

    manufacturer.image_url = filename;
    await manufacturer.save();

    res.status(200).json({ message: 'File uploaded successfully', file_path: filename });
  } catch (error) {
    console.error('Upload Manufacturer Image Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
