const { User } = require('../models');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = req.user;
    res.json(user.toJSON());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = req.user;
    const { username, email, image_file, password } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (image_file) user.image_file = image_file;
    if (password) user.password = password;

    await user.save();
    res.json(user.toJSON());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = req.user;
    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
