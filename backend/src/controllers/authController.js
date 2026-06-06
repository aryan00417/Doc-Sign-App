const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../prismaClient')


const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}




const login = async (req, res) => {
  try {
    const { email, password } = req.body

    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' })
    }

   
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { register, login }