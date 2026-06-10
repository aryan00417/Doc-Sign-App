const prisma = require('../prismaClient')

// POST /api/signatures — save signature position
const saveSignaturePosition = async (req, res) => {
  try {
    const { documentId, signerName, signerEmail, x, y, page, width, height } = req.body

    if (!documentId || !signerName || !signerEmail || x === undefined || y === undefined) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    // Verify document exists and belongs to user
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    if (document.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    // Save signature position
    const signature = await prisma.signature.create({
      data: {
        documentId,
        signerName,
        signerEmail,
        x,
        y,
        page: page || 1,
        width: width || 150,
        height: height || 50,
        status: 'pending'
      }
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: `SIGNATURE_FIELD_ADDED — ${signerName} (${signerEmail})`,
        ipAddress: req.ip,
        documentId
      }
    })

    res.status(201).json({
      message: 'Signature position saved',
      signature
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// GET /api/signatures/:documentId — get all signatures for a document
const getSignaturesByDocument = async (req, res) => {
  try {
    const { documentId } = req.params

    const signatures = await prisma.signature.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' }
    })

    res.status(200).json({ signatures })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// DELETE /api/signatures/:id — remove a signature field
const deleteSignature = async (req, res) => {
  try {
    const signature = await prisma.signature.findUnique({
      where: { id: req.params.id },
      include: { document: true }
    })

    if (!signature) {
      return res.status(404).json({ message: 'Signature not found' })
    }

    if (signature.document.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    await prisma.signature.delete({ where: { id: req.params.id } })

    res.status(200).json({ message: 'Signature field removed' })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { saveSignaturePosition, getSignaturesByDocument, deleteSignature }