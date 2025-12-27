const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  assignTechnician
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getAllRequests)
  .post(protect, createRequest);

router.route('/:id')
  .get(protect, getRequest)
  .put(protect, authorize('ADMIN', 'TECHNICIAN'), updateRequest)
  .delete(protect, authorize('ADMIN'), deleteRequest);

router.put('/:id/assign', protect, authorize('ADMIN', 'TECHNICIAN'), assignTechnician);

module.exports = router;
