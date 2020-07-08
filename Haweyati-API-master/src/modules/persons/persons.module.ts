import { Module } from '@nestjs/common';
import { PersonsController } from './persons.controller';
import { PersonsService } from './persons.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PersonsSchema } from 'src/data/schemas/persons.schema';
import {PersonVerificationSchema} from "../../data/schemas/personVerification.schema";
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'persons',
        schema: PersonsSchema
      }
    ]),
    MongooseModule.forFeature([
      {
        name: 'personverification',
        schema: PersonVerificationSchema
      }
    ]),
    MulterModule.register({
      dest: '../uploads',
    })
      ],
  controllers: [PersonsController],
  providers: [PersonsService],
  exports: [PersonsService]
})
export class PersonsModule {}
