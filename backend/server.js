require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./src/routes/authRoutes')
const documentRoutes = require('./src/routes/documentRoutes')
const signatureRoutes = require('./src/routes/signatureRoutes')
const publicSignRoutes = require('./src/routes/publicSignRoutes')
const auditRoutes = require('./src/routes/auditRoutes')

const app = express()
app.use(cors())
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