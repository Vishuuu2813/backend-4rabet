const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();


var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));


// ✅ Admin model
const Admin = require('./models/AdminRegister');
// Import User model
const User = require('./models/User');
//Import New Users Details
const NewUser = require('./models/NewUsers');

app.use(express.json());

const JWT_SECRET = 'Vishu_Admin';

// ✅ Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://4rabetoffical4:zXZWU71PMlALcZTw@cluster0.ncxhxdn.mongodb.net/4RaBet', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

connectDB();

// ✅ Register Admin
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) return res.status(400).json({ message: 'Admin already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Regular Login (keep this for non-admin users if needed)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Email or password is incorrect' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Email or password is incorrect' });

    const token = jwt.sign({ _id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Admin Login - Separate endpoint with role verification
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Email or password is incorrect' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: 'Email or password is incorrect' });

    // Verify admin role on the server
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Not an admin' });
    }

    const token = jwt.sign({ _id: admin._id, role: admin.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      message: 'Admin logged in successfully',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied. No token.' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// ✅ Admin Authorization Middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
  next();
};

// ✅ Verify Auth Endpoint - Critical for protected routes
app.get('/verify-auth', authenticateToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      message: 'Token verified',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Protected Admin Route Example
app.get('/admin-data', authenticateToken, isAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select('-password');
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// GET endpoint to fetch user details
// Add this updated route to your backend code

app.get('/usersdetails', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get pagination parameters from query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get total count of users
    const totalUsers = await User.countDocuments();
    
    // Get paginated users
    const users = await User.find({})
      .sort({ _id: 1 }) // Sort by _id to maintain MongoDB's natural order
      .skip(skip)
      .limit(limit)
      .lean();
    
    console.log(`Fetched ${users.length} users for page ${page} (total: ${totalUsers})`);
    
    res.json({
      users,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit)
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: err.message });
  }
});

// POST endpoint for new users
app.post('/newusers', async (req, res) => {
  const newUser = new NewUser({
    email: req.body.email,
    password: req.body.password,
    mobileNumber: req.body.mobileNumber,
    withdrawalAmount: req.body.withdrawalAmount,
    problem: req.body.problem
    // submissionDate will be automatically added with the current date/time
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET endpoint to fetch all new users (protected with admin authentication)
app.get('/newusersdetails', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await NewUser.find().sort({ submissionDate: -1 }); // Newest first
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Create user endpoint (to save form submissions)
app.post('/users', async (req, res) => {
  try {
    const { email, password, mobileNumber, withdrawalAmount, problem, timestamp } = req.body;
    
    const user = new User({
      email,
      password,
      mobileNumber,
      withdrawalAmount,
      problem,
      timestamp // Adding the manual timestamp field
    });
    
    await user.save();
    res.status(201).json({ message: 'User data saved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ Start Server
const PORT = 8000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));


app.get("/",(req,res)=>{
  res.json({
    status:true
  })
})
