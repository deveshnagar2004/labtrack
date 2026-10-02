const express = require('express');
const router = express.Router();

const {
  reportIssue,
  listIssues,
  getIssue,
  editIssueStatus
} = require('../controllers/issueController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, reportIssue);

router.get(
  '/',
  protect,
  listIssues
);

router.get('/:id', protect, getIssue);

router.patch(
  '/:id',
  protect,
  authorize('ADMIN', 'LAB_ASSISTANT'),
  editIssueStatus
);

module.exports = router;