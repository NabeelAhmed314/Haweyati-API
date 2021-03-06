import { Module } from '@nestjs/common'
import { PersonsController } from './persons.controller'
import { PersonsService } from './persons.service'
import { MongooseModule } from '@nestjs/mongoose'
import { PersonsSchema } from 'src/data/schemas/persons.schema'
import { MulterModule } from '@nestjs/platform-express'
import { AdminForgotPasswordSchema } from '../../data/schemas/adminForgotPassword.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'persons',
        schema: PersonsSchema
      },
      {
        name: 'forgotpassword',
        schema: AdminForgotPasswordSchema
      }
    ]),
    MulterModule.register({
      dest: '../uploads'
    })
  ],
  controllers: [PersonsController],
  providers: [PersonsService],
  exports: [PersonsService]
})
export class PersonsModule {}
