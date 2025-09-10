import { Module } from '@nestjs/common';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { TypegooseModule } from 'nestjs-typegoose';
import { GenreModel } from './genre.model';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [GenreController],
    imports: [
      TypegooseModule.forFeature([
        {
          typegooseClass: GenreModel,
          schemaOptions: {
            collection: 'Genre'
          }
        }
      ]),
      ConfigModule,
    ],
  providers: [GenreService]
})
export class GenreModule {}
