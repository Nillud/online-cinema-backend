import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GenreService } from './genre.service';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { CreateGenreDto } from './dto/create-genre.dto';

@Controller('genres')
export class GenreController {
    constructor(private readonly genreService: GenreService) { }

    @Get('by-slug/:slug')
    async bySlug(@Param('slug') slug: string) {
        return this.genreService.bySlug(slug)
    }

    @Get('/collections')
    async getCollections() {
        return this.genreService.getCollections()
    }

    @Get()
    async getAll(@Query('searchTerm') searchTerm?: string) {
        return this.genreService.getAll(searchTerm)
    }

    @Get(':_id')
    @Auth('admin')
    async get(@Param('_id', IdValidationPipe) _id: string) {
        return this.genreService.byId(_id)
    }

    @UsePipes(new ValidationPipe())
    @Post()
    @HttpCode(200)
    @Auth('admin')
    async create() {
        return this.genreService.create()
    }

    @UsePipes(new ValidationPipe())
    @Put(':_id')
    @HttpCode(200)
    @Auth('admin')
    async update(@Param('_id', IdValidationPipe) _id: string, @Body() dto: CreateGenreDto) {
        return this.genreService.update(_id, dto)
    }

    @UsePipes(new ValidationPipe())
    @Delete(':_id')
    @HttpCode(200)
    @Auth('admin')
    async delete(@Param('_id', IdValidationPipe) _id: string) {
        return this.genreService.delete(_id)
    }
}
