const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const {
  sendSignatureRequest,
  getDocumentByToken,
  respondToSignature
} = require('../controllers/publicSignController')

// Protected — only sender can trigger email
router.post('/send', protect, sendSignatureRequest)

// Public — no auth needed (signer opens from email link)
router.get('/:token', getDocumentByToken)
router.post('/:token/respond', respondToSignature)

module.exports = router