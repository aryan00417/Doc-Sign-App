const express = require('express')
const router = express.Router()
const protect = require('../middleware/authMiddleware')
const prisma = require('../prismaClient')

// GET /api/audit/:documentId
router.get('/:documentId', protect, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { documentId: req.params.documentId },
      orderBy: { timestamp: 'desc' }
    })
    res.status(200).json({ logs })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router