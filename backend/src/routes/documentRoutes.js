const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')
const {
  uploadDocument,
  getMyDocuments,
  getDocumentById
} = require('../controllers/documentController')

// All routes protected — must be logged in
router.post('/upload', protect, upload.single('pdf'), uploadDocument)
router.get('/', protect, getMyDocuments)
router.get('/:id', protect, getDocumentById)

module.exports = router