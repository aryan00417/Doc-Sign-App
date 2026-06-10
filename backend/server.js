require('dotenv').config()
const express = require('express')
const cors = require('cors')

const authRoutes = require('./src/routes/authRoutes')
const documentRoutes = require('./src/routes/documentRoutes')
const signatureRoutes = require('./src/routes/signatureRoutes')   

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))

app.use('/api/auth', authRoutes)
app.use('/api/docs', documentRoutes)
app.use('/api/signatures', signatureRoutes)                       

app.get('/', (req, res) => {
  res.json({ message: 'DocuSign API running ' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))