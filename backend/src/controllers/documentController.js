const prisma = require('../prismaClient')
const { v4: uuidv4 } = require('uuid')

// POST /api/docs/upload
const uploadDocument = async (req, res) => {
  try {
    // Check if file was attached
    if (!req.file) {
      return res.status(400).json({ message: 'No PDF file uploaded' })
    }

    const { title } = req.body

    if (!title) {
      return res.status(400).json({ message: 'Document title is required' })
    }

    // Save document metadata to PostgreSQL
    const document = await prisma.document.create({
      data: {
        title,
        fileUrl: req.file.path,        // path where file is stored
        status: 'pending',
        signToken: uuidv4(),           // unique token for public signing link
        userId: req.user.userId        // from JWT middleware
      }
    })

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'DOCUMENT_UPLOADED',
        ipAddress: req.ip,
        documentId: document.id
      }
    })

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document.id,
        title: document.title,
        fileUrl: document.fileUrl,
        status: document.status,
        signToken: document.signToken,
        createdAt: document.createdAt
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error during upload' })
  }
}

// GET /api/docs — get all documents for logged in user
const getMyDocuments = async (req, res) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        auditLogs: true   // include audit history
      }
    })

    res.status(200).json({ documents })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/docs/:id — get single document
const getDocumentById = async (req, res) => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { auditLogs: true }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    // Make sure user owns this document
    if (document.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.status(200).json({ document })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { uploadDocument, getMyDocuments, getDocumentById }