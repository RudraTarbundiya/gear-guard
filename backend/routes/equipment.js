const express = require('express');
const router = express.Router();
const {
  getAllEquipment,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getAllEquipment)
  .post(protect, authorize('ADMIN'), createEquipment);

router.route('/:id')
  .get(protect, getEquipment)
  .put(protect, authorize('ADMIN'), updateEquipment)
  .delete(protect, authorize('ADMIN'), deleteEquipment);

module.exports = router;
