require('dotenv').config()
const express = require('express')
const cors = require('cors')


const authRoutes = require('./src/routes/authRoutes')

const app = express()
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'DocuSign API running' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))