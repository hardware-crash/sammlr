// controllers/wishlistController.js

const { Wishlist, Game } = require('../models'); // Ensure correct paths
const logger = require('../logger'); // Ensure logger.js exists and is correctly set up

// Function to retrieve the authenticated user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id; // Ensure req.user is set by auth middleware
    const { game_id } = req.params; // Extract game_id from URL parameters

    console.log(`Fetching wishlist for user ID: ${userId}, game_id: ${game_id}`); // Debugging

    if (!userId) {
      logger.warn('User ID not provided in request.');
      return res.status(400).json({ message: 'User ID not provided' });
    }

    if (game_id) {
      // If a game_id is provided, check if the game is in the user's wishlist
      const wishlistItem = await Wishlist.findOne({
        where: { user_id: userId, game_id },
      });

      if (wishlistItem) {
        return res.json({ isInWishlist: true });
      } else {
        return res.json({ isInWishlist: false });
      }
    } else {
      // If no game_id is provided, return all wishlist items for the user
      const wishlistItems = await Wishlist.findAll({
        where: { user_id: userId },
        include: [{
          model: Game,
          as: 'game', // Ensure this alias matches your Sequelize associations
          attributes: ['id', 'title', 'cover_url', 'cib_avg_price', 'loose_avg_price', 'new_avg_price'],
        }],
      });

      // Serialize the wishlist items
      const serializedWishlist = wishlistItems.map(item => ({
        id: item.id,
        game: item.game,
        added_at: item.createdAt, // Assuming you have timestamps
      }));

      return res.json({ wishlist: serializedWishlist });
    }
  } catch (error) {
    console.error('Get Wishlist Error:', error);
    logger.error('Get Wishlist Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to add a game to the authenticated user's wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id; // Ensure req.user is set by auth middleware
    const { game_id } = req.body; // Expecting game_id in the request body

    console.log(`Adding game ID: ${game_id} to user ID: ${userId}`); // Debugging

    if (!userId || !game_id) {
      logger.warn('User ID or Game ID not provided.');
      return res.status(400).json({ message: 'User ID or Game ID not provided' });
    }

    // Check if the game exists
    const game = await Game.findByPk(game_id);
    if (!game) {
      logger.warn(`Game with ID ${game_id} not found.`);
      return res.status(404).json({ message: 'Game not found' });
    }

    // Check if the game is already in the user's wishlist
    const existingEntry = await Wishlist.findOne({ where: { user_id: userId, game_id } });
    if (existingEntry) {
      logger.warn(`Game with ID ${game_id} already in user ${userId}'s wishlist.`);
      return res.status(400).json({ message: 'Game already in wishlist' });
    }

    // Add the game to the wishlist
    const wishlistEntry = await Wishlist.create({ user_id: userId, game_id });

    logger.info(`Game with ID ${game_id} added to user ${userId}'s wishlist.`);
    res.status(201).json({ message: 'Game added to wishlist', wishlist: wishlistEntry });
  } catch (error) {
    console.error('Add to Wishlist Error:', error);
    logger.error('Add to Wishlist Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Function to remove a game from the authenticated user's wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id; // Ensure req.user is set by auth middleware
    const { game_id } = req.body; // Expecting game_id in the request body

    console.log(`Removing game ID: ${game_id} from user ID: ${userId}`); // Debugging

    if (!userId || !game_id) {
      logger.warn('User ID or Game ID not provided.');
      return res.status(400).json({ message: 'User ID or Game ID not provided' });
    }

    // Check if the wishlist entry exists
    const existingEntry = await Wishlist.findOne({ where: { user_id: userId, game_id } });
    if (!existingEntry) {
      logger.warn(`Game with ID ${game_id} not found in user ${userId}'s wishlist.`);
      return res.status(404).json({ message: 'Game not found in wishlist' });
    }

    // Remove the game from the wishlist
    await existingEntry.destroy();

    logger.info(`Game with ID ${game_id} removed from user ${userId}'s wishlist.`);
    res.json({ message: 'Game removed from wishlist' });
  } catch (error) {
    console.error('Remove from Wishlist Error:', error);
    logger.error('Remove from Wishlist Error:', { message: error.message, stack: error.stack });
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
