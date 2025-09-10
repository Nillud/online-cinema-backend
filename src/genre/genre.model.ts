import { prop } from '@typegoose/typegoose';
import { TimeStamps, Base } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';

export class GenreModel extends TimeStamps implements Base {
  _id: Types.ObjectId;
  id: string;
  @prop()
  name: string;

  @prop({ unique: true })
  slug: string;

  @prop()
  description: string

  @prop()
  icon: string
}
