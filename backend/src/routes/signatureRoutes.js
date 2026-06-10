const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const {
  saveSignaturePosition,
  getSignaturesByDocument,
  deleteSignature
} = require('../controllers/signatureController')

router.post('/', protect, saveSignaturePosition)
router.get('/:documentId', protect, getSignaturesByDocument)
router.delete('/:id', protect, deleteSignature)

module.exports = router