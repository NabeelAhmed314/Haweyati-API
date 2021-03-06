import {
  Body,
  Controller,
  Patch, Post
} from '@nestjs/common'
import { SimpleController } from '../../common/lib/simple.controller'
import { ITimeSlots } from '../../data/interfaces/timeSlots.interface'
import { TimeSlotsService } from './time-slots.service'

@Controller('time-slots')
export class TimeSlotsController extends SimpleController<ITimeSlots> {
  constructor(protected readonly service: TimeSlotsService) {
    super(service)
  }
  @Post()
  post(data: ITimeSlots): Promise<ITimeSlots> {
    return super.post(data)
  }

  @Patch()
  async update(@Body() data: any): Promise<ITimeSlots[]> {
    return await this.service.update1(data)
  }
}
