const prisma = require('../prismaClient')
const { sendSignatureRequestEmail } = require('../utils/emailService')

// POST /api/sign/send — send signature request email
const sendSignatureRequest = async (req, res) => {
  try {
    const { documentId, senderEmail, senderPassword, receiverEmail, receiverName } = req.body

    if (!senderEmail || !senderPassword || !receiverEmail || !receiverName) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { uploadedBy: true }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    if (document.status !== 'signed') {
      return res.status(400).json({ message: 'Please generate the signed PDF before sending for review' })
    }

    const signLink = `${process.env.FRONTEND_URL}/sign/${document.signToken}`

    await sendSignatureRequestEmail({
      toEmail: receiverEmail,
      toName: receiverName,
      documentTitle: document.title,
      signLink,
      senderName: document.uploadedBy.name,
      senderEmail,
      senderPassword
    })

    await prisma.auditLog.create({
      data: {
        action: `REVIEW_REQUEST_SENT → ${receiverEmail}`,
        ipAddress: req.ip,
        documentId
      }
    })

    res.status(200).json({ message: 'Review request sent successfully!' })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to send email. Check your Gmail credentials.' })
  }
}

// GET /api/sign/:token — public page to view document (no auth needed)
const getDocumentByToken = async (req, res) => {
  try {
    const { token } = req.params

    const document = await prisma.document.findUnique({
      where: { signToken: token }
    })

    if (!document) {
      return res.status(404).json({ message: 'Invalid or expired link' })
    }

    res.status(200).json({ document, signature: null })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

// POST /api/sign/:token/respond — reviewer approves or rejects
const respondToSignature = async (req, res) => {
  try {
    const { token } = req.params
    const { action, reason } = req.body

    const document = await prisma.document.findUnique({
      where: { signToken: token }
    })

    if (!document) {
      return res.status(404).json({ message: 'Invalid link' })
    }

    await prisma.document.update({
  where: { id: document.id },
  data: { status: action === 'signed' ? 'approved' : 'rejected' }
})

    await prisma.auditLog.create({
      data: {
        action: `DOCUMENT_${action.toUpperCase()}${reason ? ` — Reason: ${reason}` : ''}`,
        ipAddress: req.ip,
        documentId: document.id
      }
    })

    res.status(200).json({ message: `Document ${action} successfully` })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { sendSignatureRequest, getDocumentByToken, respondToSignature }