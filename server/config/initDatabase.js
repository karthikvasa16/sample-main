const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync all models with database (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized.');

    // Check if admin user exists, if not create one
    const adminExists = await User.findOne({ where: { email: 'admin@gmail.com' } });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Default admin user created (admin@gmail.com / admin123)');
    }

    // Also check for admin@adventus.io from QUICKSTART.md
    const adventusAdmin = await User.findOne({ where: { email: 'admin@adventus.io' } });
    if (!adventusAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Adventus Admin',
        email: 'admin@adventus.io',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Default admin user created (admin@adventus.io / admin123)');
    }

    console.log('✅ Database initialization completed.');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

module.exports = initDatabase;







