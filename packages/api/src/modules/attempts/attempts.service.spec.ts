import { Test, TestingModule } from '@nestjs/testing';
import { AttemptsService } from './attempts.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AttemptsService', () => {
  let service: AttemptsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    ticket: {
      findUnique: jest.fn(),
    },
    attempt: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    attemptStep: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockAttempt = {
    id: 'attempt-123',
    attemptNumber: 1,
    ticketId: 'ticket-123',
    agentId: 'agent-123',
    status: 'RUNNING',
    reasoning: 'Test reasoning',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AttemptsService>(AttemptsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an attempt', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({ id: 'ticket-123' });
      mockPrismaService.attempt.findFirst.mockResolvedValue(null);
      mockPrismaService.attempt.create.mockResolvedValue(mockAttempt);

      const result = await service.create('ticket-123', 'agent-123', 'Test reasoning');

      expect(result).toEqual(mockAttempt);
      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: 'ticket-123' },
      });
    });

    it('should throw NotFoundException when ticket not found', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.create('999', 'agent-123')).rejects.toThrow(NotFoundException);
    });

    it('should calculate attempt number correctly', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({ id: 'ticket-123' });
      mockPrismaService.attempt.findFirst.mockResolvedValue({ attemptNumber: 2 });
      mockPrismaService.attempt.create.mockResolvedValue({
        ...mockAttempt,
        attemptNumber: 3,
      });

      await service.create('ticket-123', 'agent-123');

      expect(mockPrismaService.attempt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            attemptNumber: 3,
          }),
        })
      );
    });
  });

  describe('addStep', () => {
    it('should add a step to attempt', async () => {
      const mockStep = {
        id: 'step-123',
        stepNumber: 1,
        action: 'Test action',
      };
      mockPrismaService.attemptStep.findFirst.mockResolvedValue(null);
      mockPrismaService.attemptStep.create.mockResolvedValue(mockStep);

      const result = await service.addStep('attempt-123', 'Test action');

      expect(result).toEqual(mockStep);
      expect(mockPrismaService.attemptStep.create).toHaveBeenCalled();
    });

    it('should calculate step number correctly', async () => {
      mockPrismaService.attemptStep.findFirst.mockResolvedValue({ stepNumber: 5 });
      mockPrismaService.attemptStep.create.mockResolvedValue({ stepNumber: 6 });

      await service.addStep('attempt-123', 'Test action');

      expect(mockPrismaService.attemptStep.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stepNumber: 6,
          }),
        })
      );
    });
  });

  describe('complete', () => {
    it('should complete an attempt', async () => {
      const completedAttempt = { ...mockAttempt, status: 'SUCCESS' };
      mockPrismaService.attempt.update.mockResolvedValue(completedAttempt);

      const result = await service.complete('attempt-123', 'Completed successfully', 'SUCCESS');

      expect(result.status).toBe('SUCCESS');
      expect(mockPrismaService.attempt.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'attempt-123' },
          data: expect.objectContaining({
            status: 'SUCCESS',
            outcome: 'Completed successfully',
          }),
        })
      );
    });
  });

  describe('findByTicket', () => {
    it('should return attempts for a ticket', async () => {
      const mockAttempts = [mockAttempt];
      mockPrismaService.attempt.findMany.mockResolvedValue(mockAttempts);

      const result = await service.findByTicket('ticket-123');

      expect(result).toEqual(mockAttempts);
      expect(mockPrismaService.attempt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ticketId: 'ticket-123' },
        })
      );
    });
  });
});
