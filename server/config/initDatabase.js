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
        role: 'admin',
        emailVerified: true,
        emailVerifiedAt: new Date()
      });
      console.log('✅ Default admin user created (admin@gmail.com / admin123)');
    } else {
      let updated = false;
      if (!adminExists.emailVerified) {
        adminExists.emailVerified = true;
        adminExists.emailVerifiedAt = new Date();
        updated = true;
      }
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        updated = true;
      }
      if (updated) {
        await adminExists.save();
        console.log('✅ Existing admin user updated/verified (admin@gmail.com)');
      }
    }

    // Also check for admin@kubera.io from QUICKSTART.md
    const kuberaAdmin = await User.findOne({ where: { email: 'admin@kubera.io' } });
    if (!kuberaAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Kubera Admin',
        email: 'admin@kubera.io',
        password: hashedPassword,
        role: 'admin',
        emailVerified: true,
        emailVerifiedAt: new Date()
      });
      console.log('✅ Default admin user created (admin@kubera.io / admin123)');
    } else {
      let updated = false;
      if (!kuberaAdmin.emailVerified) {
        kuberaAdmin.emailVerified = true;
        kuberaAdmin.emailVerifiedAt = new Date();
        updated = true;
      }
      if (kuberaAdmin.role !== 'admin') {
        kuberaAdmin.role = 'admin';
        updated = true;
      }
      if (updated) {
        await kuberaAdmin.save();
        console.log('✅ Existing admin user updated/verified (admin@kubera.io)');
      }
    }

    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superadmin@kubera.io';
    const superAdminExists = await User.findOne({ where: { email: superAdminEmail.toLowerCase() } });

    if (!superAdminExists) {
      const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123';
      const hashedPassword = await bcrypt.hash(superAdminPassword, 10);
      await User.create({
        name: 'Super Admin',
        email: superAdminEmail.toLowerCase(),
        password: hashedPassword,
        role: 'super_admin',
        emailVerified: true,
        emailVerifiedAt: new Date()
      });
      console.log(`✅ Super admin user created (${superAdminEmail} / ${superAdminPassword})`);
    } else {
      let updated = false;
      if (superAdminExists.role !== 'super_admin') {
        superAdminExists.role = 'super_admin';
        updated = true;
      }
      if (!superAdminExists.emailVerified) {
        superAdminExists.emailVerified = true;
        superAdminExists.emailVerifiedAt = new Date();
        updated = true;
      }
      if (updated) {
        await superAdminExists.save();
        console.log(`✅ Existing super admin user updated/verified (${superAdminEmail})`);
      }
    }

    console.log('✅ Database initialization completed.');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

module.exports = initDatabase;





