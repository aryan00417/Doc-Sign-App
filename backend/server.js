require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')

const authRoutes = require('./src/routes/authRoutes')
const documentRoutes = require('./src/routes/documentRoutes')
const signatureRoutes = require('./src/routes/signatureRoutes')
const publicSignRoutes = require('./src/routes/publicSignRoutes')
const auditRoutes = require('./src/routes/auditRoutes')

// Ensure upload directories exist
const uploadsDir = 'uploads'
const signedDir = 'signed-pdfs'

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
if (!fs.existsSync(signedDir)) {
  fs.mkdirSync(signedDir, { recursive: true })
}

const app = express()
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use('/signed-pdfs', express.static('signed-pdfs'))

app.use('/api/auth', authRoutes)
app.use('/api/docs', documentRoutes)
app.use('/api/signatures', signatureRoutes)
app.use('/api/sign', publicSignRoutes)
app.use('/api/audit', auditRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'DocuSign API running ' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))