import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { PrismaService } from '../../database/prisma.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockComment = {
    id: 'comment-123',
    ticketId: 'ticket-123',
    authorId: 'author-123',
    content: 'Test comment',
    commentType: 'COMMENT',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment', async () => {
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.create('ticket-123', 'author-123', 'Test comment');

      expect(result).toEqual(mockComment);
      expect(mockPrismaService.comment.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ticketId: 'ticket-123',
          authorId: 'author-123',
          content: 'Test comment',
        }),
        include: expect.any(Object),
      });
    });

    it('should create comment with specific type', async () => {
      mockPrismaService.comment.create.mockResolvedValue({
        ...mockComment,
        commentType: 'HUMAN_FEEDBACK',
      });

      await service.create('ticket-123', 'author-123', 'Test', 'HUMAN_FEEDBACK' as any);

      expect(mockPrismaService.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            commentType: 'HUMAN_FEEDBACK',
          }),
        })
      );
    });
  });

  describe('findByTicket', () => {
    it('should return comments for a ticket', async () => {
      const mockComments = [mockComment];
      mockPrismaService.comment.findMany.mockResolvedValue(mockComments);

      const result = await service.findByTicket('ticket-123');

      expect(result).toEqual(mockComments);
      expect(mockPrismaService.comment.findMany).toHaveBeenCalledWith({
        where: { 
          ticketId: 'ticket-123',
          deletedAt: null,
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
