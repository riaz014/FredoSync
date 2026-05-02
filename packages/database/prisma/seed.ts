import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('Demo123!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@fredocloud.com' },
    update: {},
    create: {
      email: 'demo@fredocloud.com',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create additional users
  const user2 = await prisma.user.upsert({
    where: { email: 'jane@fredocloud.com' },
    update: {},
    create: {
      email: 'jane@fredocloud.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'john@fredocloud.com' },
    update: {},
    create: {
      email: 'john@fredocloud.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
  });

  // Create demo workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Fredo Cloud Demo',
      description: 'Demo workspace for testing',
      accentColor: '#6366f1',
      createdById: demoUser.id,
      members: {
        create: [
          { userId: demoUser.id, role: 'ADMIN' },
          { userId: user2.id, role: 'MEMBER' },
          { userId: user3.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✅ Workspace created:', workspace.name);

  // Create goals
  const goal1 = await prisma.goal.create({
    data: {
      title: 'Launch Product v2.0',
      description: 'Complete redesign and new features for the next major release',
      workspaceId: workspace.id,
      ownerId: demoUser.id,
      status: 'IN_PROGRESS',
      dueDate: new Date('2026-06-30'),
      milestones: {
        create: [
          {
            title: 'Design System',
            description: 'Create comprehensive design system',
            progressPercent: 80,
            dueDate: new Date('2026-05-15'),
          },
          {
            title: 'Backend API',
            description: 'Build RESTful API endpoints',
            progressPercent: 60,
            dueDate: new Date('2026-05-30'),
          },
          {
            title: 'Frontend Development',
            description: 'Implement new UI components',
            progressPercent: 40,
            dueDate: new Date('2026-06-15'),
          },
        ],
      },
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      title: 'Improve Security',
      description: 'Implement advanced security measures and compliance',
      workspaceId: workspace.id,
      ownerId: user2.id,
      status: 'IN_PROGRESS',
      dueDate: new Date('2026-05-31'),
      milestones: {
        create: [
          {
            title: 'Security Audit',
            progressPercent: 100,
          },
          {
            title: 'Implement MFA',
            progressPercent: 70,
          },
        ],
      },
    },
  });

  console.log('✅ Goals created');

  // Create action items
  await prisma.actionItem.createMany({
    data: [
      {
        title: 'Design landing page mockups',
        workspaceId: workspace.id,
        goalId: goal1.id,
        assigneeId: user2.id,
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date('2026-05-10'),
        position: 0,
      },
      {
        title: 'Implement user authentication',
        workspaceId: workspace.id,
        goalId: goal1.id,
        assigneeId: demoUser.id,
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        dueDate: new Date('2026-05-15'),
        position: 1,
      },
      {
        title: 'Write API documentation',
        workspaceId: workspace.id,
        goalId: goal1.id,
        assigneeId: user3.id,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-05-20'),
        position: 2,
      },
      {
        title: 'Set up monitoring and alerts',
        workspaceId: workspace.id,
        goalId: goal2.id,
        assigneeId: user2.id,
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date('2026-05-25'),
        position: 3,
      },
    ],
  });

  console.log('✅ Action items created');

  // Create announcements
  const announcement1 = await prisma.announcement.create({
    data: {
      title: 'Welcome to Fredo Cloud!',
      content:
        '<p>Welcome to our demo workspace! This platform helps teams collaborate and track progress efficiently. Feel free to explore all the features.</p>',
      workspaceId: workspace.id,
      isPinned: true,
    },
  });

  const announcement2 = await prisma.announcement.create({
    data: {
      title: 'Weekly Sprint Review',
      content:
        '<p>Great progress this week team! We completed 12 action items and made significant progress on our goals. Keep up the excellent work! 🎉</p>',
      workspaceId: workspace.id,
      isPinned: false,
    },
  });

  console.log('✅ Announcements created');

  // Create reactions
  await prisma.reaction.createMany({
    data: [
      { announcementId: announcement1.id, userId: demoUser.id, emoji: '👍' },
      { announcementId: announcement1.id, userId: user2.id, emoji: '❤️' },
      { announcementId: announcement2.id, userId: user3.id, emoji: '🎉' },
    ],
  });

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'Excited to be part of this team!',
      announcementId: announcement1.id,
      userId: user2.id,
    },
  });

  console.log('✅ Reactions and comments created');

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: demoUser.id,
        action: 'CREATE',
        entity: 'WORKSPACE',
        entityId: workspace.id,
        changes: { name: workspace.name },
      },
      {
        workspaceId: workspace.id,
        userId: demoUser.id,
        action: 'CREATE',
        entity: 'GOAL',
        entityId: goal1.id,
        changes: { title: goal1.title },
      },
    ],
  });

  console.log('✅ Audit logs created');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
