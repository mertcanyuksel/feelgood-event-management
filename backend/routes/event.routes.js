const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  getBudgets,
  getSalutations,
  getBusinessCards
} = require('../controllers/event.controller');
const { authenticateUser } = require('../middleware/auth');

// All event routes require authentication
router.use(authenticateUser);

// Event CRUD
router.get('/events', getEvents);
router.get('/events/:id', getEventById);
router.post('/events', createEvent);
router.put('/events/:id', updateEvent);

// Reference data for dropdowns
router.get('/budgets', getBudgets);
router.get('/salutations', getSalutations);
router.get('/businesscards', getBusinessCards);

module.exports = router;
