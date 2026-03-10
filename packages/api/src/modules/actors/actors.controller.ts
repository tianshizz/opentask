import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ActorType } from '@prisma/client';
import { ActorsService } from './actors.service';
import { CreateActorDto } from './dto';

@ApiTags('actors')
@Controller('actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new actor',
    description: 'Create a new actor (human user or AI agent)'
  })
  @ApiResponse({ status: 201, description: 'Actor created successfully' })
  create(@Body() createActorDto: CreateActorDto) {
    return this.actorsService.create(
      createActorDto.name,
      createActorDto.type as ActorType,
      createActorDto.email
    );
  }

  @Get()
  @ApiOperation({ 
    summary: 'List all actors',
    description: 'Retrieve all actors, optionally filtered by type'
  })
  @ApiQuery({ 
    name: 'type', 
    enum: ActorType, 
    required: false,
    description: 'Filter by actor type (HUMAN or AGENT)'
  })
  @ApiResponse({ status: 200, description: 'Actors retrieved successfully' })
  findAll(@Query('type') type?: ActorType) {
    return this.actorsService.findAll(type);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get an actor',
    description: 'Retrieve a single actor by ID'
  })
  @ApiParam({ name: 'id', description: 'Actor ID' })
  @ApiResponse({ status: 200, description: 'Actor found' })
  @ApiResponse({ status: 404, description: 'Actor not found' })
  findOne(@Param('id') id: string) {
    return this.actorsService.findOne(id);
  }
}
