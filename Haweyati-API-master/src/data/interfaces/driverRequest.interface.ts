import { Document } from 'mongoose'
import { IDriversInterface } from './drivers.interface'

export interface IDriverRequest extends Document {
  driver: IDriversInterface
  status: string
}
