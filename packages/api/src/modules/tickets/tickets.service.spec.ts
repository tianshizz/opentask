import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../../database/prisma.service';
import { TicketStateMachine } from './ticket-state-machine.service';
import { NotFoundException } from '@nestjs/common';

describe('TicketsService', () => {
  let service: TicketsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    comment: {
      create: jest.fn(),
    },
  };

  const mockStateMachine = {
    canTransition: jest.fn().mockReturnValue(true),
    validateTransition: jest.fn(),
  };

  const mockTicket = {
    id: '123',
    title: 'Test Ticket',
    description: 'Test Description',
    status: 'OPEN',
    priority: 'HIGH',
    tags: ['test'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TicketStateMachine,
          useValue: mockStateMachine,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a ticket', async () => {
      const createDto = {
        title: 'Test Ticket',
        description: 'Test Description',
        priority: 'HIGH' as any,
        tags: ['test'],
      };
      const actorId = 'actor-123';

      mockPrismaService.ticket.create.mockResolvedValue(mockTicket);

      const result = await service.create(createDto, actorId);

      expect(result).toEqual(mockTicket);
      expect(mockPrismaService.ticket.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: createDto.title,
          description: createDto.description,
          priority: createDto.priority,
          tags: createDto.tags,
          createdById: actorId,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated tickets', async () => {
      const mockTickets = [mockTicket];
      mockPrismaService.ticket.findMany.mockResolvedValue(mockTickets);
      mockPrismaService.ticket.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: mockTickets,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      });
    });

    it('should filter by status', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([mockTicket]);
      mockPrismaService.ticket.count.mockResolvedValue(1);

      await service.findAll({ status: 'OPEN' as any });

      expect(mockPrismaService.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'OPEN' },
        })
      );
    });

    it('should handle pagination', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([mockTicket]);
      mockPrismaService.ticket.count.mockResolvedValue(100);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(result.pagination.page).toBe(2);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(10);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrevious).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a ticket', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      const result = await service.findOne('123');

      expect(result).toEqual(mockTicket);
      expect(mockPrismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: '123' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when ticket not found', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('approve', () => {
    it('should approve a ticket', async () => {
      const updatedTicket = { ...mockTicket, status: 'COMPLETED' };
      // Mock findOne which is called by updateStatus
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.ticket.update.mockResolvedValue(updatedTicket);
      mockPrismaService.comment.create.mockResolvedValue({});

      const result = await service.approve('123', 'Looks good', 'actor-123');

      expect(result.status).toBe('COMPLETED');
      expect(mockPrismaService.ticket.update).toHaveBeenCalled();
      expect(mockPrismaService.comment.create).toHaveBeenCalled();
    });
  });

  describe('requestRevision', () => {
    it('should request revision on a ticket', async () => {
      const updatedTicket = { ...mockTicket, status: 'NEEDS_REVISION' };
      // Mock findOne which is called by updateStatus
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.ticket.update.mockResolvedValue(updatedTicket);
      mockPrismaService.comment.create.mockResolvedValue({});

      const result = await service.requestRevision('123', 'Please fix', 'actor-123');

      expect(result.status).toBe('NEEDS_REVISION');
      expect(mockPrismaService.ticket.update).toHaveBeenCalled();
      expect(mockPrismaService.comment.create).toHaveBeenCalled();
    });
  });
});
