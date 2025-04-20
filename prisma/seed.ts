// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      country: 'US',
      industryType: 'Technology',
      role: 'ADMIN',
      onboardingCompleted: true,
      image: 'https://ui-avatars.com/api/?name=Test+User&background=random',
    },
  });

  // Create a workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Test Workspace',
      description: 'A workspace for testing',
      inviteCode: faker.string.alphanumeric(8),
      members: {
        create: {
          userId: user.id,
          accessLevel: 'OWNER',
        },
      },
    },
  });

  // Create projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Product Development',
        description: 'Main product development project',
        workspaceId: workspace.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Marketing Campaign',
        description: 'Q2 Marketing initiatives',
        workspaceId: workspace.id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Customer Support',
        description: 'Customer support and feedback',
        workspaceId: workspace.id,
      },
    }),
  ]);

  // Create tasks for each project
  for (const project of projects) {
    // Create 5-10 tasks per project
    const taskCount = faker.number.int({ min: 5, max: 10 });
    
    for (let i = 0; i < taskCount; i++) {
      const startDate = faker.date.future();
      const dueDate = faker.date.future({ refDate: startDate });
      
      await prisma.task.create({
        data: {
          title: faker.helpers.arrayElement([
            'Implement new feature',
            'Fix bug in production',
            'Write documentation',
            'Review pull request',
            'Update dependencies',
            'Design new UI component',
            'Conduct user testing',
            'Prepare presentation',
            'Schedule team meeting',
            'Update project roadmap',
          ]),
          description: faker.lorem.paragraph(),
          status: faker.helpers.arrayElement(['TODO', 'IN_PROGRESS', 'COMPLETED', 'IN_REVIEW', 'BACKLOG', 'BLOCKED']),
          priority: faker.helpers.arrayElement(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
          startDate,
          dueDate,
          position: i,
          projectId: project.id,
          assigneeId: user.id,
        },
      });
    }
  }

  // Create some activities
  for (const project of projects) {
    const activityCount = faker.number.int({ min: 3, max: 7 });
    
    for (let i = 0; i < activityCount; i++) {
      await prisma.activity.create({
        data: {
          type: faker.helpers.arrayElement(['TASK_CREATED', 'TASK_UPDATED', 'COMMENT_ADDED', 'PROJECT_UPDATED']),
          description: faker.lorem.sentence(),
          projectId: project.id,
          userId: user.id,
        },
      });
    }
  }

  // Create some comments
  for (const project of projects) {
    const commentCount = faker.number.int({ min: 2, max: 5 });
    
    for (let i = 0; i < commentCount; i++) {
      await prisma.comment.create({
        data: {
          content: faker.lorem.paragraph(),
          projectId: project.id,
          userId: user.id,
        },
      });
    }
  }

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });