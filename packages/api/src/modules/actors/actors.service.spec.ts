import { Test, TestingModule } from '@nestjs/testing';
import { ActorsService } from './actors.service';
import { PrismaService } from '../../database/prisma.service';

describe('ActorsService', () => {
  let service: ActorsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    actor: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockActor = {
    id: 'actor-123',
    name: 'Test Actor',
    type: 'AGENT',
    email: 'test@example.com',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ActorsService>(ActorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an actor', async () => {
      mockPrismaService.actor.create.mockResolvedValue(mockActor);

      const result = await service.create('Test Actor', 'AGENT' as any, 'test@example.com');

      expect(result).toEqual(mockActor);
      expect(mockPrismaService.actor.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Actor',
          type: 'AGENT',
          email: 'test@example.com',
        },
      });
    });

    it('should create actor without email', async () => {
      mockPrismaService.actor.create.mockResolvedValue(mockActor);

      await service.create('Test Actor', 'AGENT' as any);

      expect(mockPrismaService.actor.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Actor',
          type: 'AGENT',
          email: undefined,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all actors', async () => {
      const mockActors = [mockActor];
      mockPrismaService.actor.findMany.mockResolvedValue(mockActors);

      const result = await service.findAll();

      expect(result).toEqual(mockActors);
      expect(mockPrismaService.actor.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by type', async () => {
      mockPrismaService.actor.findMany.mockResolvedValue([mockActor]);

      await service.findAll('AGENT' as any);

      expect(mockPrismaService.actor.findMany).toHaveBeenCalledWith({
        where: { type: 'AGENT' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an actor', async () => {
      mockPrismaService.actor.findUnique.mockResolvedValue(mockActor);

      const result = await service.findOne('actor-123');

      expect(result).toEqual(mockActor);
      expect(mockPrismaService.actor.findUnique).toHaveBeenCalledWith({
        where: { id: 'actor-123' },
      });
    });
  });
});
