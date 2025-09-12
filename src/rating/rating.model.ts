import { prop, Ref } from "@typegoose/typegoose";
import { MovieModel } from "src/movie/movie.model";
import { UserModel } from "src/user/user.model";

export class RatingModel {
    @prop({ ref: () => UserModel })
    userId: Ref<UserModel>

    @prop({ ref: () => MovieModel })
    movieId: Ref<MovieModel>

    @prop()
    value: number
}