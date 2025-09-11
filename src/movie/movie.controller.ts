import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { MovieService } from './movie.service';
import { IdValidationPipe } from 'src/pipes/id.validation.pipe';
import { UpdateMovieDto } from './update-movie.dto';
import { Types } from 'mongoose';

@Controller('movies')
export class MovieController {
    constructor(private readonly movieService: MovieService) { }

    @Get('by-slug/:slug')
    async bySlug(@Param('slug') slug: string) {
        return this.movieService.bySlug(slug)
    }

    @Get('/by-actor/:actorId')
    async byActor(@Param('actorId', IdValidationPipe) actorId: Types.ObjectId) {
        return this.movieService.byActor(actorId)
    }

    @UsePipes(new ValidationPipe())
    @Post('/by-genres')
    @HttpCode(200)
    async byGenres(@Body('genreIds') genreIds: Types.ObjectId[]) {
        return this.movieService.byGenres(genreIds)
    }

    @Get()
    async getAll(@Query('searchTerm') searchTerm?: string) {
        return this.movieService.getAll(searchTerm)
    }

    @Get('most-popular')
    async getMostPopular() {
        return this.movieService.getMostPopular()
    }

    @Put('update-count-opened')
    @HttpCode(200)
    async updateCountOpened(
        @Body('slug') slug: string
    ) {
        return this.movieService.updateCountOpened(slug)
    }

    // Admin

    @Get(':_id')
    @Auth('admin')
    async get(
        @Param('_id', IdValidationPipe) _id: string
    ) {
        return this.movieService.byId(_id)
    }

    @UsePipes(new ValidationPipe())
    @Post()
    @HttpCode(200)
    @Auth('admin')
    async create() {
        return this.movieService.create()
    }

    @UsePipes(new ValidationPipe())
    @Put(':_id')
    @HttpCode(200)
    @Auth('admin')
    async update(@Param('_id', IdValidationPipe) _id: string, @Body() dto: UpdateMovieDto) {
        return this.movieService.update(_id, dto)
    }

    @UsePipes(new ValidationPipe())
    @Delete(':_id')
    @HttpCode(200)
    @Auth('admin')
    async delete(@Param('_id', IdValidationPipe) _id: string) {
        return this.movieService.delete(_id)
    }
}
