import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { MovieModel } from './movie.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { UpdateMovieDto } from './update-movie.dto';
import { Types } from 'mongoose'

@Injectable()
export class MovieService {
    constructor(
        @InjectModel(MovieModel)
        private readonly MovieModel: ModelType<MovieModel>
    ) { }
    async getAll(searchTerm?: string) {
        let options = {}

        if (searchTerm)
            options = {
                $or: [
                    {
                        title: new RegExp(searchTerm, 'i')
                    }
                ]
            }

        // Agregation

        return this.MovieModel.find(options).select('-updatedAt -__v').sort({ createdAt: 'desc' }).populate('actors genres').exec()
    }

    async bySlug(slug: string) {
        const doc = await this.MovieModel.findOne({ slug }).populate('actors genres').exec()
        if (!doc) throw new NotFoundException('Movie not found')
        return doc
    }

    async byActor(actorId: Types.ObjectId) {
        const doc = await this.MovieModel.find({ actors: actorId }).exec()
        if (!doc) throw new NotFoundException('Movies not found')
        return doc
    }

    async byGenres(genreIds: Types.ObjectId[]) {
        const doc = await this.MovieModel.findOne({
            genres: {
                $in: genreIds
            }
        }).populate('actors genres').exec()
        if (!doc) throw new NotFoundException('Movies not found')
        return doc
    }

    async getMostPopular() {
        return this.MovieModel.find({ countOpened: { $gt: 0 } }).sort({ countOpened: -1 }).populate('genres').exec()
    }

    async updateCountOpened(slug: string) {
        const updateDoc = await this.MovieModel.findOneAndUpdate(
            { slug },
            {
                $inc: { countOpened: 1 },
            },
            {
                new: true
            }
        ).exec()

        if (!updateDoc) throw new NotFoundException('Movie not found')
        return updateDoc
    }

    async updateRating(id: Types.ObjectId, newRating: number) {
        return this.MovieModel
            .findByIdAndUpdate(id,
                {
                    rating: newRating
                },
                {
                    new: true
                }
            )
            .exec()
    }

    // Admin Place

    async byId(_id: string) {
        const doc = await this.MovieModel.findById({ _id })
        if (!doc) throw new NotFoundException('Movie not found')

        return doc
    }

    async create() {
        const defaultValue: UpdateMovieDto = {
            poster: '',
            bigPoster: '',
            title: '',
            slug: '',
            videoUrl: '',
            genres: [],
            actors: [],
        }
        const movie = await this.MovieModel.create(defaultValue)
        return movie._id
    }

    async update(_id: string, dto: UpdateMovieDto) {
        const updateMovie = await this.MovieModel.findByIdAndUpdate(_id, dto, {
            new: true
        }).exec()

        if (!updateMovie) throw new NotFoundException('Movie not found')
        return updateMovie
    }

    async delete(id: string) {
        const deleteDoc = await this.MovieModel.findByIdAndDelete(id).exec()

        if (!deleteDoc) throw new NotFoundException('Movie not found')
        return deleteDoc
    }
}
