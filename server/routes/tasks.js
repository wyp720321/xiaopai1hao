const express = require('express');
const router = express.Router();
const { startDownload, aiOrganize } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/download', protect, startDownload);
router.post('/ai-organize', protect, aiOrganize);
// router.post('/transfer', protect, startTransfer); // Logic is similar to download but source is URL

module.exports = router;