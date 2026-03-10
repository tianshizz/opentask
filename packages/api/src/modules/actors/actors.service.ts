import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ActorType } from '@prisma/client';

@Injectable()
export class ActorsService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, type: ActorType, email?: string) {
    return this.prisma.actor.create({
      data: {
        name,
        type,
        email,
      },
    });
  }

  async findAll(type?: ActorType) {
    return this.prisma.actor.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.actor.findUnique({
      where: { id },
    });
  }
}
