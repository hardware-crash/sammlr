// controllers/adminController.js

const { ItemChange, Item, User, sequelize } = require('../models');

/**
 * Holt alle ausstehenden Änderungsanfragen.
 */
exports.getPendingItemChanges = async (req, res) => {
  try {
    const pendingChanges = await ItemChange.findAll({
      where: { status: 'pending' },
      include: [
        { 
          model: Item, 
          include: [{ model: User, attributes: ['id', 'username', 'email'] }] 
        },
        { 
          model: User, 
          attributes: ['id', 'username', 'email'] // Der Benutzer, der die Änderung vorgeschlagen hat
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      success: true,
      data: pendingChanges,
    });
  } catch (error) {
    console.error('Error fetching pending item changes:', error);
    res.status(500).json({
      success: false,
      message: 'Interner Serverfehler.',
    });
  }
};

/**
 * Holt eine spezifische Änderungsanfrage nach ID.
 */
exports.getItemChangeById = async (req, res) => {
  const { id } = req.params;

  try {
    const itemChange = await ItemChange.findByPk(id, {
      include: [
        { 
          model: Item, 
          include: [{ model: User, attributes: ['id', 'username', 'email'] }] 
        },
        { 
          model: User, 
          attributes: ['id', 'username', 'email'] 
        },
      ],
    });

    if (!itemChange) {
      return res.status(404).json({
        success: false,
        message: 'Änderungsanfrage nicht gefunden.',
      });
    }

    res.status(200).json({
      success: true,
      data: itemChange,
    });
  } catch (error) {
    console.error(`Error fetching item change with ID ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Interner Serverfehler.',
    });
  }
};

/**
 * Genehmigt eine spezifische Änderungsanfrage.
 */
exports.approveItemChange = async (req, res) => {
  const { id } = req.params;

  try {
    const itemChange = await ItemChange.findByPk(id, {
      include: [Item],
    });

    if (!itemChange) {
      return res.status(404).json({
        success: false,
        message: 'Änderungsanfrage nicht gefunden.',
      });
    }

    if (itemChange.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Diese Änderungsanfrage ist bereits als '${itemChange.status}' markiert.`,
      });
    }

    // Beginne eine Transaktion
    await sequelize.transaction(async (t) => {
      // Aktualisiere das Item mit den vorgeschlagenen Änderungen
      await itemChange.Item.update(itemChange.proposed_changes, { transaction: t });

      // Aktualisiere den Status der Änderungsanfrage auf 'approved'
      await itemChange.update({ status: 'approved' }, { transaction: t });
    });

    res.status(200).json({
      success: true,
      message: 'Änderungsanfrage genehmigt und angewendet.',
    });
  } catch (error) {
    console.error(`Error approving item change with ID ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Interner Serverfehler.',
    });
  }
};

/**
 * Lehnt eine spezifische Änderungsanfrage ab.
 */
exports.rejectItemChange = async (req, res) => {
  const { id } = req.params;

  try {
    const itemChange = await ItemChange.findByPk(id);

    if (!itemChange) {
      return res.status(404).json({
        success: false,
        message: 'Änderungsanfrage nicht gefunden.',
      });
    }

    if (itemChange.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Diese Änderungsanfrage ist bereits als '${itemChange.status}' markiert.`,
      });
    }

    // Aktualisiere den Status der Änderungsanfrage auf 'rejected'
    await itemChange.update({ status: 'rejected' });

    res.status(200).json({
      success: true,
      message: 'Änderungsanfrage abgelehnt.',
    });
  } catch (error) {
    console.error(`Error rejecting item change with ID ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Interner Serverfehler.',
    });
  }
};

/**
 * Löscht eine spezifische Änderungsanfrage.
 * Optional: Nur Administratoren sollten Änderungsanfragen löschen können.
 */
exports.deleteItemChange = async (req, res) => {
  const { id } = req.params;

  try {
    const itemChange = await ItemChange.findByPk(id);

    if (!itemChange) {
      return res.status(404).json({
        success: false,
        message: 'Änderungsanfrage nicht gefunden.',
      });
    }

    await itemChange.destroy();

    res.status(200).json({
      success: true,
      message: 'Änderungsanfrage erfolgreich gelöscht.',
    });
  } catch (error) {
    console.error(`Error deleting item change with ID ${id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Interner Serverfehler.',
    });
  }
};
