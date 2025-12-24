import mongoose from 'mongoose';
import { User } from '../src/models/user.model.js';
import { UserRole, UserStatus } from '../src/enums/user.enum.js';
import { envConfig } from '../src/configs/env.config.js';
import logger from '../src/configs/logger.config.js';

const users = [
  {
    name: 'Admin User',
    email: 'admin@eduflow.com',
    password: 'Admin@123456',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  {
    name: 'Nguyễn Văn Minh',
    email: 'minh.teacher@eduflow.com',
    password: 'Teacher@123',
    role: UserRole.TEACHER,
    status: UserStatus.ACTIVE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher1',
  },
  {
    name: 'Trần Thị Mai',
    email: 'mai.student@eduflow.com',
    password: 'Student@123',
    role: UserRole.STUDENT,
    status: UserStatus.ACTIVE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=student1',
  },
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(envConfig.mongodbUri);
    logger.info('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    logger.info('Cleared existing users');

    // Insert users
    const createdUsers = await User.create(users);
    logger.info(`✅ Successfully seeded ${createdUsers.length} users:`);

    createdUsers.forEach((user) => {
      logger.info(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    logger.info('\n📧 Login Credentials:');
    users.forEach((user) => {
      logger.info(`  Email: ${user.email}`);
      logger.info(`  Password: ${user.password}`);
      logger.info(`  ---`);
    });

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding users:', error);
    process.exit(1);
  }
}

seedUsers();
