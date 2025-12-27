import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-pulse';



// Define Schemas
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
  },
  { timestamps: true }
);

const ProjectSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    startDate: Date,
    endDate: Date,
    status: String,
    healthScore: Number,
    clientId: mongoose.Schema.Types.ObjectId,
    employeeIds: [mongoose.Schema.Types.ObjectId],
  },
  { timestamps: true }
);

const CheckInSchema = new mongoose.Schema(
  {
    projectId: mongoose.Schema.Types.ObjectId,
    employeeId: mongoose.Schema.Types.ObjectId,
    weekStartDate: Date,
    progressSummary: String,
    blockers: String,
    confidenceLevel: Number,
    completionPercentage: Number,
  },
  { timestamps: true }
);

const FeedbackSchema = new mongoose.Schema(
  {
    projectId: mongoose.Schema.Types.ObjectId,
    clientId: mongoose.Schema.Types.ObjectId,
    weekStartDate: Date,
    satisfactionRating: Number,
    communicationRating: Number,
    comments: String,
    issueFlagged: Boolean,
  },
  { timestamps: true }
);

const RiskSchema = new mongoose.Schema(
  {
    projectId: mongoose.Schema.Types.ObjectId,
    employeeId: mongoose.Schema.Types.ObjectId,
    title: String,
    severity: String,
    mitigationPlan: String,
    status: String,
  },
  { timestamps: true }
);

// Models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
const CheckIn = mongoose.models.CheckIn || mongoose.model('CheckIn', CheckInSchema);
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
const Risk = mongoose.models.Risk || mongoose.model('Risk', RiskSchema);

// Helper function to get week start date (Monday)
function getWeekStartDate(weeksAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - weeksAgo * 7);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// Seed data
async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Project.deleteMany({});
    await CheckIn.deleteMany({});
    await Feedback.deleteMany({});
    await Risk.deleteMany({});
    console.log('✅ Cleared existing data');

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const hashedEmpPassword = await bcrypt.hash('emp123', 10);
    const hashedClientPassword = await bcrypt.hash('client123', 10);

    // Create Users
    console.log('👤 Creating users...');
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@projectpulse.com',
      password: hashedPassword,
      role: 'Admin',
    });

    const employee1 = await User.create({
      name: 'John Developer',
      email: 'employee@projectpulse.com',
      password: hashedEmpPassword,
      role: 'Employee',
    });

    const employee2 = await User.create({
      name: 'Sarah Engineer',
      email: 'sarah@projectpulse.com',
      password: hashedEmpPassword,
      role: 'Employee',
    });

    const employee3 = await User.create({
      name: 'Mike Designer',
      email: 'mike@projectpulse.com',
      password: hashedEmpPassword,
      role: 'Employee',
    });

    const client1 = await User.create({
      name: 'Jane Client',
      email: 'client@projectpulse.com',
      password: hashedClientPassword,
      role: 'Client',
    });

    const client2 = await User.create({
      name: 'Bob Business',
      email: 'bob@projectpulse.com',
      password: hashedClientPassword,
      role: 'Client',
    });

    const client3 = await User.create({
      name: 'Alice Anderson',
      email: 'alice@projectpulse.com',
      password: hashedClientPassword,
      role: 'Client',
    });

    console.log('✅ Created 7 users (1 admin, 3 employees, 3 clients)');

    // Create Projects
    console.log('📁 Creating projects...');

    const project1 = await Project.create({
      name: 'E-Commerce Platform Redesign',
      description: 'Complete redesign of the online store with improved UX and performance',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      status: 'On Track',
      healthScore: 85,
      clientId: client1._id,
      employeeIds: [employee1._id, employee2._id],
    });

    const project2 = await Project.create({
      name: 'Mobile App Development',
      description: 'Native iOS and Android app for customer engagement',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-08-31'),
      status: 'At Risk',
      healthScore: 65,
      clientId: client2._id,
      employeeIds: [employee1._id, employee3._id],
    });

    const project3 = await Project.create({
      name: 'Data Analytics Dashboard',
      description: 'Real-time analytics dashboard with advanced reporting features',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-09-30'),
      status: 'Critical',
      healthScore: 45,
      clientId: client3._id,
      employeeIds: [employee2._id, employee3._id],
    });

    const project4 = await Project.create({
      name: 'API Integration System',
      description: 'Integration layer for third-party services and internal systems',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-15'),
      status: 'Completed',
      healthScore: 95,
      clientId: client1._id,
      employeeIds: [employee1._id],
    });

    console.log('✅ Created 4 projects');

    // Create Check-ins
    console.log('✅ Creating check-ins...');

    // Project 1 - On Track
    await CheckIn.create({
      projectId: project1._id,
      employeeId: employee1._id,
      weekStartDate: getWeekStartDate(0),
      progressSummary: 'Completed user authentication module. All tests passing.',
      blockers: 'None',
      confidenceLevel: 5,
      completionPercentage: 75,
    });

    await CheckIn.create({
      projectId: project1._id,
      employeeId: employee2._id,
      weekStartDate: getWeekStartDate(0),
      progressSummary: 'Finished frontend components for product catalog.',
      blockers: 'Waiting for API documentation',
      confidenceLevel: 4,
      completionPercentage: 70,
    });

    // Project 2 - At Risk
    await CheckIn.create({
      projectId: project2._id,
      employeeId: employee1._id,
      weekStartDate: getWeekStartDate(0),
      progressSummary: 'Working on push notification system. Facing some technical challenges.',
      blockers: 'iOS certificate issues',
      confidenceLevel: 3,
      completionPercentage: 55,
    });

    await CheckIn.create({
      projectId: project2._id,
      employeeId: employee3._id,
      weekStartDate: getWeekStartDate(0),
      progressSummary: 'UI designs are ready but implementation is behind schedule.',
      blockers: 'Need more developer resources',
      confidenceLevel: 2,
      completionPercentage: 50,
    });

    // Project 3 - Critical
    await CheckIn.create({
      projectId: project3._id,
      employeeId: employee2._id,
      weekStartDate: getWeekStartDate(0),
      progressSummary: 'Database optimization is taking longer than expected.',
      blockers: 'Performance issues with large datasets',
      confidenceLevel: 2,
      completionPercentage: 40,
    });

    await CheckIn.create({
      projectId: project3._id,
      employeeId: employee3._id,
      weekStartDate: getWeekStartDate(0),
      progressSummary: 'Dashboard layout completed but data integration pending.',
      blockers: 'Waiting for backend API endpoints',
      confidenceLevel: 2,
      completionPercentage: 35,
    });

    // Previous week check-ins
    await CheckIn.create({
      projectId: project1._id,
      employeeId: employee1._id,
      weekStartDate: getWeekStartDate(1),
      progressSummary: 'Set up project infrastructure and development environment.',
      blockers: 'None',
      confidenceLevel: 5,
      completionPercentage: 60,
    });

    await CheckIn.create({
      projectId: project2._id,
      employeeId: employee1._id,
      weekStartDate: getWeekStartDate(1),
      progressSummary: 'Initial app structure created.',
      blockers: 'None',
      confidenceLevel: 4,
      completionPercentage: 40,
    });

    console.log('✅ Created 8 check-ins');

    // Create Feedback
    console.log('💬 Creating feedback...');

    // Project 1 - Positive feedback
    await Feedback.create({
      projectId: project1._id,
      clientId: client1._id,
      weekStartDate: getWeekStartDate(0),
      satisfactionRating: 5,
      communicationRating: 5,
      comments: 'Excellent progress! Team is very responsive and delivers quality work.',
      issueFlagged: false,
    });

    await Feedback.create({
      projectId: project1._id,
      clientId: client1._id,
      weekStartDate: getWeekStartDate(1),
      satisfactionRating: 4,
      communicationRating: 5,
      comments: 'Good start. Looking forward to seeing more features.',
      issueFlagged: false,
    });

    // Project 2 - Mixed feedback
    await Feedback.create({
      projectId: project2._id,
      clientId: client2._id,
      weekStartDate: getWeekStartDate(0),
      satisfactionRating: 3,
      communicationRating: 3,
      comments: 'Progress is slower than expected. Need better communication about blockers.',
      issueFlagged: true,
    });

    await Feedback.create({
      projectId: project2._id,
      clientId: client2._id,
      weekStartDate: getWeekStartDate(1),
      satisfactionRating: 4,
      communicationRating: 4,
      comments: 'Better this week. Appreciate the updates.',
      issueFlagged: false,
    });

    // Project 3 - Critical feedback
    await Feedback.create({
      projectId: project3._id,
      clientId: client3._id,
      weekStartDate: getWeekStartDate(0),
      satisfactionRating: 2,
      communicationRating: 2,
      comments: 'Very concerned about the delays. We need to discuss timeline adjustments.',
      issueFlagged: true,
    });

    await Feedback.create({
      projectId: project3._id,
      clientId: client3._id,
      weekStartDate: getWeekStartDate(1),
      satisfactionRating: 2,
      communicationRating: 3,
      comments: 'Still not satisfied with progress but communication has improved slightly.',
      issueFlagged: true,
    });

    // Project 4 - Completed project
    await Feedback.create({
      projectId: project4._id,
      clientId: client1._id,
      weekStartDate: getWeekStartDate(2),
      satisfactionRating: 5,
      communicationRating: 5,
      comments: 'Project completed successfully! Great work by the team.',
      issueFlagged: false,
    });

    console.log('✅ Created 7 feedback entries');

    // Create Risks
    console.log('⚠️  Creating risks...');

    await Risk.create({
      projectId: project2._id,
      employeeId: employee1._id,
      title: 'iOS Certificate Expiration',
      severity: 'High',
      mitigationPlan: 'Renew certificate and update provisioning profiles by end of week.',
      status: 'Open',
    });

    await Risk.create({
      projectId: project2._id,
      employeeId: employee3._id,
      title: 'Insufficient Development Resources',
      severity: 'Medium',
      mitigationPlan: 'Request additional developer to join the team.',
      status: 'Open',
    });

    await Risk.create({
      projectId: project3._id,
      employeeId: employee2._id,
      title: 'Database Performance Issues',
      severity: 'High',
      mitigationPlan: 'Implement caching layer and optimize queries. May need database upgrade.',
      status: 'Open',
    });

    await Risk.create({
      projectId: project3._id,
      employeeId: employee3._id,
      title: 'API Endpoint Delays',
      severity: 'High',
      mitigationPlan: 'Coordinate with backend team to prioritize API development.',
      status: 'Open',
    });

    await Risk.create({
      projectId: project1._id,
      employeeId: employee2._id,
      title: 'API Documentation Pending',
      severity: 'Low',
      mitigationPlan: 'Follow up with API team daily.',
      status: 'Open',
    });

    await Risk.create({
      projectId: project4._id,
      employeeId: employee1._id,
      title: 'Third-party API Rate Limits',
      severity: 'Medium',
      mitigationPlan: 'Implemented caching and request throttling.',
      status: 'Resolved',
    });

   

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seed
seed();