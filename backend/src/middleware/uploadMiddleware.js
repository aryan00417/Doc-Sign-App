const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

// Configure where and how files are stored
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')  // save to /uploads folder
  },
  filename: (req, file, cb) => {
    // Generate unique filename: uuid + original extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

// Only allow PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true)
  } else {
    cb(new Error('Only PDF files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
})

module.exports = upload