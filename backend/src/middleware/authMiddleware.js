const jwt = require('jsonwebtoken')

const protect = (req, res, next) => {
  try {
    // Get token from request header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token, access denied' })
    }

    // Extracting token — header looks like "Bearer eyJhbG..."
    const token = authHeader.split(' ')[1]

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user info to request object
    req.user = decoded

    next() 

  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired' })
  }
}

module.exports = protect