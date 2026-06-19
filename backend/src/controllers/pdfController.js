const { PDFDocument, rgb, StandardFonts } = require('pdf-lib')
const fs = require('fs')
const path = require('path')
const prisma = require('../prismaClient')

const generateSignedPdf = async (req, res) => {
  try {
    const { id } = req.params

    const document = await prisma.document.findUnique({
      where: { id },
      include: { signatures: true }
    })

    if (!document) {
      return res.status(404).json({ message: 'Document not found' })
    }

    if (document.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' })
    }

    if (document.signatures.length === 0) {
      return res.status(400).json({ message: 'No signature fields to embed' })
    }

    const existingPdfBytes = fs.readFileSync(document.fileUrl)
    const pdfDoc = await PDFDocument.load(existingPdfBytes)
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)

    for (const sig of document.signatures) {
      const pages = pdfDoc.getPages()
      const pageIndex = (sig.page || 1) - 1
      const page = pages[pageIndex] || pages[0]

      const { height } = page.getSize()
      const scaleRatio = 1.5

      const adjustedX = sig.x / scaleRatio
      const adjustedY = height - (sig.y / scaleRatio) - (sig.height / scaleRatio)

      page.drawText(sig.signerName.replace(/_/g, ' '), {
        x: adjustedX + 8,
        y: adjustedY + (sig.height / scaleRatio / 2) - 5,
        size: 16,
        font,
        color: rgb(0.1, 0.1, 0.5)
      })

      page.drawRectangle({
        x: adjustedX,
        y: adjustedY,
        width: sig.width / scaleRatio,
        height: sig.height / scaleRatio,
        borderColor: rgb(0, 0.4, 0.8),
        borderWidth: 1,
        opacity: 0
      })
    }

    const signedPdfBytes = await pdfDoc.save()
    const fileName = `signed-${id}.pdf`
    const filePath = path.join('signed-pdfs', fileName)

    fs.writeFileSync(filePath, signedPdfBytes)

    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        status: 'signed',
        signedFileUrl: filePath
      }
    })

    await prisma.signature.updateMany({
      where: { documentId: id },
      data: { status: 'signed' }
    })

    await prisma.auditLog.create({
      data: {
        action: 'DOCUMENT_SIGNED — Final PDF generated',
        ipAddress: req.ip,
        documentId: id
      }
    })

    res.status(200).json({
      message: 'Signed PDF generated successfully',
      document: updatedDoc
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error generating signed PDF' })
  }
}

module.exports = { generateSignedPdf }