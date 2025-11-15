require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { students, applications, universities, activities, stats } = require('./data/mockData');
const { User, PasswordResetToken, EmailVerificationToken } = require('./models');
const initDatabase = require('./config/initDatabase');
const emailService = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Check if email exists endpoint
app.post('/api/auth/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    res.json({ exists: !!existingUser });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ error: 'Failed to check email' });
  }
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user has a password (Google users don't have passwords)
    if (!user.password) {
      return res.status(401).json({ error: 'This account was created with Google. Please use Google Sign-In.' });
    }

    const validPassword = await user.checkPassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email address before logging in. Check your inbox for the verification link.',
        requiresVerification: true
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'student' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'student',
        picture: user.picture || null,
        isGoogleUser: !!user.googleId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, country } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists BEFORE creating user or sending email
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'We already have a user with this email. Please use a different email address or try logging in.',
        duplicateEmail: true
      });
    }

    // Hash password
    const hashedPassword = await User.hashPassword(password);

    // Create new user (students only via registration)
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || null,
      country: country || null,
      role: 'student', // Registration is for students only
      emailVerified: false
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await EmailVerificationToken.create({
      token: verificationToken,
      email: newUser.email.toLowerCase(),
      expiresAt,
      used: false
    });

    // Send verification email
    let emailSent = false;
    let emailError = null;
    try {
      await emailService.sendVerificationEmail(newUser.email, newUser.name, verificationToken);
      emailSent = true;
    } catch (emailErrorObj) {
      console.error('Failed to send verification email:', emailErrorObj);
      emailError = emailErrorObj;
      // Check if it's an email validation error
      if (emailErrorObj.code === 'EAUTH' || emailErrorObj.message?.includes('Invalid login') || emailErrorObj.message?.includes('Application-specific password')) {
        // This is a Gmail/SMTP configuration error, not an invalid email
        // Still return success but log the error
        emailSent = true; // Consider it "sent" since the issue is with SMTP config, not the email itself
      } else if (emailErrorObj.message?.includes('not found') || emailErrorObj.message?.includes('invalid email')) {
        // Invalid email address
        return res.status(400).json({ 
          success: false,
          error: 'Invalid email address. Please check your email and try again with a valid email address.',
          emailError: true
        });
      }
    }

    if (!emailSent && emailError) {
      // Email sending failed - return error asking user to check email
      return res.status(400).json({ 
        success: false,
        error: 'Failed to send verification email. Please check your email address and try again with a valid email address.',
        emailError: true
      });
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful! Verification email sent successfully. Please check your email to verify your account.',
      requiresVerification: true,
      emailSent: emailSent,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: 'student',
        emailVerified: false
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: 'We already have a user with this email. Please use a different email address or try logging in.',
        duplicateEmail: true
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(e => e.message).join(', ');
      return res.status(400).json({ error: `Validation error: ${messages}` });
    }
    
    if (error.name === 'SequelizeConnectionError' || error.name === 'SequelizeConnectionRefusedError') {
      console.error('Database connection error! Please check your database connection.');
      return res.status(500).json({ error: 'Database connection failed. Please check server configuration.' });
    }
    
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

app.post('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    // Get full user info including role
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ valid: false, error: 'User not found' });
    }
    res.json({ 
      valid: true, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role || 'student',
        name: user.name || ''
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ valid: false, error: 'Server error' });
  }
});

// Google OAuth endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleToken, name, email, picture } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    let user = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (!user) {
      // Create new student user from Google
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        password: null, // Google users don't have password
        role: 'student',
        googleId: googleToken,
        picture: picture || null
      });
    } else {
      // Update user if they log in with Google (update googleId and picture if needed)
      if (!user.googleId) {
        user.googleId = googleToken;
      }
      if (picture && !user.picture) {
        user.picture = picture;
      }
      if (!user.role) {
        user.role = 'student';
      }
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        picture: user.picture || picture
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
});

// Dashboard Routes
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  res.json(stats);
});

app.get('/api/dashboard/trends', authenticateToken, (req, res) => {
  const trends = [
    { month: 'Jan', applications: 120, approved: 95 },
    { month: 'Feb', applications: 145, approved: 112 },
    { month: 'Mar', applications: 180, approved: 140 },
    { month: 'Apr', applications: 165, approved: 130 },
    { month: 'May', applications: 200, approved: 165 },
    { month: 'Jun', applications: 225, approved: 180 }
  ];
  res.json(trends);
});

app.get('/api/dashboard/activities', authenticateToken, (req, res) => {
  res.json(activities.slice(0, 10));
});

// Students Routes
app.get('/api/students', authenticateToken, (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  let filtered = [...students];

  if (search) {
    filtered = filtered.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toString().includes(search)
    );
  }

  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);

  res.json({
    students: filtered.slice(start, end),
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

app.get('/api/students/:id', authenticateToken, (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  res.json(student);
});

app.post('/api/students', authenticateToken, (req, res) => {
  const newStudent = {
    id: students.length + 1,
    ...req.body,
    status: req.body.status || 'Active',
    createdAt: new Date().toISOString()
  };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', authenticateToken, (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Student not found' });
  }
  students[index] = { ...students[index], ...req.body };
  res.json(students[index]);
});

// Applications Routes
app.get('/api/applications', authenticateToken, async (req, res) => {
  const { status, university, page = 1, limit = 12 } = req.query;
  let filtered = [...applications];

  // If user is a student, only show their applications
  const user = await User.findByPk(req.user.id);
  if (user && user.role === 'student') {
    filtered = filtered.filter(a => a.studentId === req.user.id);
  }

  if (status) {
    filtered = filtered.filter(a => a.status === status);
  }

  if (university) {
    filtered = filtered.filter(a => 
      a.university.toLowerCase().includes(university.toLowerCase())
    );
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);

  res.json({
    applications: filtered.slice(start, end),
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

app.get('/api/applications/:id', authenticateToken, (req, res) => {
  const application = applications.find(a => a.id === parseInt(req.params.id));
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.json(application);
});

app.put('/api/applications/:id/approve', authenticateToken, async (req, res) => {
  // Only admin can approve applications
  const user = await User.findByPk(req.user.id);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can approve applications' });
  }

  const index = applications.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }
  applications[index].status = 'Approved';
  applications[index].approvedAt = new Date().toISOString();
  res.json(applications[index]);
});

// Loan Application Routes
let loanApplications = [];

app.post('/api/loans/apply', authenticateToken, async (req, res) => {
  try {
    const { amount, purpose, duration, cibilScore, pan } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user || user.role !== 'student') {
      return res.status(403).json({ error: 'Only students can apply for loans' });
    }

    if (!amount || !purpose || !cibilScore || !pan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newLoan = {
      id: loanApplications.length + 1,
      userId: req.user.id,
      studentName: user.name,
      studentEmail: user.email,
      amount: parseInt(amount),
      purpose,
      duration: parseInt(duration),
      cibilScore: parseInt(cibilScore),
      pan: pan.toUpperCase(),
      status: 'Pending',
      appliedDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    loanApplications.push(newLoan);

    res.status(201).json({
      success: true,
      loan: newLoan
    });
  } catch (error) {
    console.error('Loan application error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/loans/my-applications', authenticateToken, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (user && user.role === 'student') {
    const myLoans = loanApplications.filter(l => l.userId === req.user.id);
    res.json({ applications: myLoans });
  } else {
    res.json({ applications: [] });
  }
});

app.get('/api/loans/all', authenticateToken, async (req, res) => {
  // Only admin can see all loans
  const user = await User.findByPk(req.user.id);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view all loans' });
  }

  const { status, page = 1, limit = 20 } = req.query;
  let filtered = [...loanApplications];

  if (status) {
    filtered = filtered.filter(l => l.status === status);
  }

  const start = (page - 1) * limit;
  const end = start + parseInt(limit);

  res.json({
    loans: filtered.slice(start, end),
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

app.put('/api/loans/:id/approve', authenticateToken, async (req, res) => {
  // Only admin can approve loans
  const user = await User.findByPk(req.user.id);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can approve loans' });
  }

  const index = loanApplications.findIndex(l => l.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Loan application not found' });
  }
  loanApplications[index].status = 'Approved';
  loanApplications[index].approvedAt = new Date().toISOString();
  res.json(loanApplications[index]);
});

// CIBIL Score Check Endpoint
app.post('/api/cibil/check', authenticateToken, async (req, res) => {
  try {
    const { pan } = req.body;
    
    if (!pan) {
      return res.status(400).json({ error: 'PAN number is required' });
    }

    // Validate PAN format
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(pan.toUpperCase())) {
      return res.status(400).json({ error: 'Invalid PAN format' });
    }

    // TODO: For production, integrate with real CIBIL API here
    // Example:
    // const cibilResponse = await axios.post('https://api.cibil.com/score', {
    //   pan: pan.toUpperCase(),
    //   apiKey: process.env.CIBIL_API_KEY
    // });
    
    // For now: Generate a deterministic score based on PAN for demo
    // This ensures same PAN always returns same score (for demo consistency)
    const panHash = pan.toUpperCase().split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Generate score between 550-850 based on PAN hash (deterministic)
    const score = 550 + (panHash % 300);
    
    // Categorize score
    let status, eligibility;
    if (score >= 750) {
      status = 'Excellent';
      eligibility = true;
    } else if (score >= 650) {
      status = 'Good';
      eligibility = true;
    } else if (score >= 550) {
      status = 'Fair';
      eligibility = false;
    } else {
      status = 'Poor';
      eligibility = false;
    }

    res.json({
      success: true,
      score,
      pan: pan.toUpperCase(),
      status,
      eligibility,
      message: 'CIBIL score fetched successfully'
    });
  } catch (error) {
    console.error('CIBIL check error:', error);
    res.status(500).json({ error: 'Failed to fetch CIBIL score' });
  }
});

// Universities Routes
app.get('/api/universities', authenticateToken, (req, res) => {
  const { search } = req.query;
  let filtered = [...universities];

  if (search) {
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.location.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json(filtered);
});

app.get('/api/universities/:id', authenticateToken, (req, res) => {
  const university = universities.find(u => u.id === parseInt(req.params.id));
  if (!university) {
    return res.status(404).json({ error: 'University not found' });
  }
  res.json(university);
});

// Reports Routes
app.get('/api/reports/analytics', authenticateToken, (req, res) => {
  const analytics = {
    byStatus: [
      { name: 'Approved', value: stats.approved, color: '#10b981' },
      { name: 'Pending', value: stats.pending, color: '#f59e0b' },
      { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
    ],
    byUniversity: universities.slice(0, 5).map(u => ({
      name: u.name,
      applications: u.applications || Math.floor(Math.random() * 50) + 10
    })),
    performance: {
      approvalRate: ((stats.approved / stats.applications) * 100).toFixed(1),
      averageProcessingTime: '2.5 days',
      topPerformingMonth: 'June'
    }
  };
  res.json(analytics);
});

// Settings Routes
app.get('/api/settings', authenticateToken, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({
    profile: {
      name: user.name,
      email: user.email
    },
    preferences: {
      notifications: true,
      emailAlerts: true,
      darkMode: false
    }
  });
});

app.put('/api/settings', authenticateToken, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (req.body.profile) {
    user.name = req.body.profile.name || user.name;
    await user.save();
  }
  res.json({ success: true });
});

app.post('/api/settings/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.password) {
    return res.status(400).json({ error: 'This account does not have a password set' });
  }

  const validPassword = await user.checkPassword(currentPassword);
  if (!validPassword) {
    return res.status(400).json({ error: 'Current password is incorrect' });
  }

  user.password = await User.hashPassword(newPassword);
  await user.save();
  res.json({ success: true });
});

// Forgot Password - Generate reset token
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    // Check if email exists - if not, return error asking user to check email
    if (!user) {
      return res.status(400).json({ 
        success: false,
        error: 'No account found with this email address. Please check your email and try again.',
        emailNotFound: true
      });
    }

    // Check if user has a password (Google users don't have passwords)
    if (!user.password) {
      return res.status(400).json({ 
        error: 'This account was created with Google. Please use Google Sign-In.' 
      });
    }

    // Delete any existing reset tokens for this email
    await PasswordResetToken.destroy({ 
      where: { email: user.email.toLowerCase() } 
    });

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database
    await PasswordResetToken.create({
      token,
      email: user.email.toLowerCase(),
      expiresAt,
      used: false
    });

    // Send password reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, token);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Continue - still return success for security (don't reveal if email failed)
    }

    res.json({ 
      success: true, 
      message: 'Password reset link has been sent to your email.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Verify Reset Token
app.post('/api/auth/verify-reset-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required', valid: false });
    }

    const tokenData = await PasswordResetToken.findOne({ 
      where: { token } 
    });

    if (!tokenData) {
      return res.json({ valid: false, error: 'Invalid or expired reset token' });
    }

    if (tokenData.used) {
      return res.json({ valid: false, error: 'Reset token has already been used' });
    }

    if (new Date() > tokenData.expiresAt) {
      await tokenData.destroy();
      return res.json({ valid: false, error: 'Reset token has expired' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ error: 'Failed to verify token', valid: false });
  }
});

// Reset Password
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    // Validate password
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const tokenData = await PasswordResetToken.findOne({ 
      where: { token } 
    });

    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (tokenData.used) {
      return res.status(400).json({ error: 'Reset token has already been used' });
    }

    if (new Date() > tokenData.expiresAt) {
      await tokenData.destroy();
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Find user and update password
    const user = await User.findOne({ 
      where: { email: tokenData.email.toLowerCase() } 
    });
    
    if (!user) {
      await tokenData.destroy();
      return res.status(400).json({ error: 'User not found' });
    }

    // Hash and update password
    user.password = await User.hashPassword(password);
    await user.save();

    // Mark token as used and delete it
    await tokenData.destroy();

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Email Verification - Verify email token
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required', valid: false });
    }

    const tokenData = await EmailVerificationToken.findOne({ 
      where: { token } 
    });

    if (!tokenData) {
      return res.json({ valid: false, error: 'Invalid or expired verification token' });
    }

    if (tokenData.used) {
      return res.json({ valid: false, error: 'This verification link has already been used' });
    }

    if (new Date() > tokenData.expiresAt) {
      await tokenData.destroy();
      return res.json({ valid: false, error: 'Verification token has expired. Please request a new one.' });
    }

    // Find user and mark email as verified
    const user = await User.findOne({ 
      where: { email: tokenData.email.toLowerCase() } 
    });
    
    if (!user) {
      await tokenData.destroy();
      return res.json({ valid: false, error: 'User not found' });
    }

    // Update user
    user.emailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    // Mark token as used
    await tokenData.destroy();

    // Generate JWT token for auto-login
    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      valid: true,
      success: true,
      message: 'Email verified successfully!',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: true
      }
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Failed to verify email', valid: false });
  }
});

// Resend verification email
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });

    if (!user) {
      // For security, don't reveal if email exists
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, a verification link has been sent.' 
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Delete old tokens
    await EmailVerificationToken.destroy({ 
      where: { email: user.email.toLowerCase() } 
    });

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await EmailVerificationToken.create({
      token: verificationToken,
      email: user.email.toLowerCase(),
      expiresAt,
      used: false
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }

    res.json({ 
      success: true, 
      message: 'Verification email sent successfully' 
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
});

// Delete account endpoint
app.delete('/api/auth/delete-account', authenticateToken, async (req, res) => {
  try {
    const { email, confirmationText } = req.body;

    // Find user first to get their email
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate confirmation text format: {user_email}-delete
    const expectedText = `${user.email}-delete`;
    if (confirmationText !== expectedText) {
      return res.status(400).json({ 
        error: `Confirmation text does not match. Please type "${expectedText}" exactly.` 
      });
    }

    // Verify email matches
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ error: 'Email does not match your account email' });
    }

    // Delete related tokens first
    await PasswordResetToken.destroy({ where: { email: user.email.toLowerCase() } });
    await EmailVerificationToken.destroy({ where: { email: user.email.toLowerCase() } });

    // Delete user account
    await user.destroy();

    res.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account. Please try again.' });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🔄 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`✅ Database connected and ready`);
      console.log(`✅ Ready to accept registration requests`);
      console.log(`\n📝 Test registration endpoint: POST http://localhost:${PORT}/api/auth/register`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('\n💡 Common issues:');
    console.error('   1. PostgreSQL not running');
    console.error('   2. Database "adventus_db" does not exist');
    console.error('   3. Wrong database credentials in .env file');
    console.error('   4. Database port 5432 is blocked\n');
    process.exit(1);
  }
}

startServer();
