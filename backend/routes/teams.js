const express = require('express');
const router = express.Router();
const {
  getAllTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getAllTeams)
  .post(protect, authorize('ADMIN'), createTeam);

router.route('/:id')
  .get(protect, getTeam)
  .put(protect, authorize('ADMIN'), updateTeam)
  .delete(protect, authorize('ADMIN'), deleteTeam);

module.exports = router;
