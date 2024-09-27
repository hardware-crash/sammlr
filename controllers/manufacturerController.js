// controllers/manufacturerController.js

const { Manufacturer, Console } = require('../models');
const path = require('path');

exports.getManufacturers = async (req, res) => {
  try {
    const manufacturers = await Manufacturer.findAll({
      include: {
        model: Console,
        as: 'gameConsoles',
        attributes: ['id', 'name', 'image_url'],
      },
    });
    res.json(manufacturers);
  } catch (error) {
    console.error('Get Manufacturers Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

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
