import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create system actor
  const systemActor = await prisma.actor.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      type: 'AGENT',
      name: 'System',
      email: 'system@opentask.local',
    },
  });
  console.log('✅ Created system actor:', systemActor.name);

  // Create sample agents
  const agent1 = await prisma.actor.create({
    data: {
      type: 'AGENT',
      name: 'CodeFixer Agent',
      email: 'codefixer@agents.local',
      metadata: {
        capabilities: ['code_analysis', 'bug_fixing', 'testing'],
        model: 'gpt-4',
      },
    },
  });
  console.log('✅ Created agent:', agent1.name);

  const agent2 = await prisma.actor.create({
    data: {
      type: 'AGENT',
      name: 'DataAnalyst Agent',
      email: 'analyst@agents.local',
      metadata: {
        capabilities: ['data_analysis', 'visualization', 'reporting'],
        model: 'claude-3',
      },
    },
  });
  console.log('✅ Created agent:', agent2.name);

  // Create sample human users
  const human1 = await prisma.actor.create({
    data: {
      type: 'HUMAN',
      name: 'Alice Developer',
      email: 'alice@company.com',
    },
  });
  console.log('✅ Created human:', human1.name);

  const human2 = await prisma.actor.create({
    data: {
      type: 'HUMAN',
      name: 'Bob Manager',
      email: 'bob@company.com',
    },
  });
  console.log('✅ Created human:', human2.name);

  // Create sample tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Fix authentication bug in login flow',
      description: 'Users report 401 errors when trying to login with OAuth',
      priority: 'HIGH',
      status: 'OPEN',
      tags: ['bug', 'auth', 'urgent'],
      createdById: human1.id,
      assignedAgentId: agent1.id,
    },
  });
  console.log('✅ Created ticket:', ticket1.title);

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Analyze user engagement metrics',
      description: 'Generate monthly report on user engagement trends',
      priority: 'MEDIUM',
      status: 'OPEN',
      tags: ['analytics', 'reporting'],
      createdById: human2.id,
      assignedAgentId: agent2.id,
    },
  });
  console.log('✅ Created ticket:', ticket2.title);

  // Create a completed ticket with attempts
  const ticket3 = await prisma.ticket.create({
    data: {
      title: 'Add email validation to signup form',
      description: 'Implement proper email validation',
      priority: 'LOW',
      status: 'COMPLETED',
      tags: ['feature', 'validation'],
      createdById: human1.id,
      assignedAgentId: agent1.id,
      startedAt: new Date('2024-01-10T10:00:00Z'),
      completedAt: new Date('2024-01-10T11:30:00Z'),
    },
  });

  // Add attempt to ticket3
  const attempt1 = await prisma.attempt.create({
    data: {
      ticketId: ticket3.id,
      agentId: agent1.id,
      attemptNumber: 1,
      status: 'SUCCESS',
      reasoning: 'I will add email validation using a regex pattern',
      outcome: 'Successfully added email validation with comprehensive tests',
      tokensUsed: 2500,
      executionTimeMs: 90000,
      startedAt: new Date('2024-01-10T10:00:00Z'),
      completedAt: new Date('2024-01-10T11:30:00Z'),
    },
  });

  // Add steps to attempt
  await prisma.attemptStep.createMany({
    data: [
      {
        attemptId: attempt1.id,
        stepNumber: 1,
        action: 'Analyzing current signup form code',
        status: 'COMPLETED',
        input: { file: 'components/SignupForm.tsx' },
        output: { linesAnalyzed: 150 },
        createdAt: new Date('2024-01-10T10:00:00Z'),
        completedAt: new Date('2024-01-10T10:15:00Z'),
      },
      {
        attemptId: attempt1.id,
        stepNumber: 2,
        action: 'Implementing email validation function',
        status: 'COMPLETED',
        input: { pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        output: { functionCreated: 'validateEmail' },
        createdAt: new Date('2024-01-10T10:15:00Z'),
        completedAt: new Date('2024-01-10T10:45:00Z'),
      },
      {
        attemptId: attempt1.id,
        stepNumber: 3,
        action: 'Writing unit tests',
        status: 'COMPLETED',
        input: { testCases: 10 },
        output: { testsPassed: 10, coverage: '100%' },
        createdAt: new Date('2024-01-10T10:45:00Z'),
        completedAt: new Date('2024-01-10T11:30:00Z'),
      },
    ],
  });

  // Add comments
  await prisma.comment.createMany({
    data: [
      {
        ticketId: ticket1.id,
        authorId: agent1.id,
        commentType: 'AGENT_UPDATE',
        content: 'Starting analysis of the authentication flow...',
        createdAt: new Date('2024-01-15T09:00:00Z'),
      },
      {
        ticketId: ticket3.id,
        authorId: human1.id,
        commentType: 'HUMAN_FEEDBACK',
        content: 'Great work! The validation is working perfectly.',
        createdAt: new Date('2024-01-10T12:00:00Z'),
      },
    ],
  });

  console.log('✅ Seed data created successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Actors: ${await prisma.actor.count()}`);
  console.log(`   - Tickets: ${await prisma.ticket.count()}`);
  console.log(`   - Attempts: ${await prisma.attempt.count()}`);
  console.log(`   - Comments: ${await prisma.comment.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
