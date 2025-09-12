import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { MovieModel } from './movie.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { UpdateMovieDto } from './update-movie.dto';
import { Types } from 'mongoose'
import { TelegramService } from 'src/telegram/telegram.service';

@Injectable()
export class MovieService {
    constructor(
        @InjectModel(MovieModel)
        private readonly MovieModel: ModelType<MovieModel>,
        private readonly telegramService: TelegramService
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
        // if (!doc) throw new NotFoundException('Movies not found')
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
        if (!dto.isSendTelegram) {
            await this.sendNotification(dto)
            dto.isSendTelegram = true
        }

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

    async sendNotification(dto: UpdateMovieDto) {
        if (process.env.NODE_ENV !== 'development')
            await this.telegramService.sendPhoto(dto.poster)

        await this.telegramService.sendPhoto('https://www.tallengestore.com/cdn/shop/products/JohnWick-KeanuReeves-HollywoodEnglishActionMoviePoster-1_f986460a-0315-44b9-947f-3aa483cbf282.jpg?v=1649071588')

        const msg = `<b>${dto.title}</b>`

        await this.telegramService.sendMessage(msg, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            url: 'https://okko.tv/movie/free-guy',
                            text: 'Go to watch'
                        }
                    ]
                ]
            }
        })
    }
}
