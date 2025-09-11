import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ActorService } from './actor.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { ActorDto } from './actor.dto';

@Controller('actors')
export class ActorController {
        constructor(private readonly actorService: ActorService) { }
    
        @Get('by-slug/:slug')
        async bySlug(@Param('slug') slug: string) {
            return this.actorService.bySlug(slug)
        }
    
        @Get()
        async getAll(@Query('searchTerm') searchTerm?: string) {
            return this.actorService.getAll(searchTerm)
        }
    
        @Get(':_id')
        @Auth('admin')
        async get(@Param('_id', IdValidationPipe) _id: string) {
            return this.actorService.byId(_id)
        }
    
        @UsePipes(new ValidationPipe())
        @Post()
        @HttpCode(200)
        @Auth('admin')
        async create() {
            return this.actorService.create()
        }
    
        @UsePipes(new ValidationPipe())
        @Put(':_id')
        @HttpCode(200)
        @Auth('admin')
        async update(@Param('_id', IdValidationPipe) _id: string, @Body() dto: ActorDto) {
            return this.actorService.update(_id, dto)
        }
    
        @UsePipes(new ValidationPipe())
        @Delete(':_id')
        @HttpCode(200)
        @Auth('admin')
        async delete(@Param('_id', IdValidationPipe) _id: string) {
            return this.actorService.delete(_id)
        }
}
