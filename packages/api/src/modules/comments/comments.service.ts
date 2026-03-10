import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CommentType } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(
    ticketId: string,
    authorId: string,
    content: string,
    type: CommentType = CommentType.COMMENT
  ) {
    return this.prisma.comment.create({
      data: {
        ticketId,
        authorId,
        content,
        commentType: type,
      },
      include: {
        author: true,
      },
    });
  }

  async findByTicket(ticketId: string) {
    return this.prisma.comment.findMany({
      where: { ticketId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        replyToComment: true,
      },
    });
  }
}
