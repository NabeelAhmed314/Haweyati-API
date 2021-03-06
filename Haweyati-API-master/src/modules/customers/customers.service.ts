import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { SimpleService } from '../../common/lib/simple.service'
import { ICustomerInterface } from '../../data/interfaces/customers.interface'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { PersonsService } from '../persons/persons.service'
import { IPerson } from '../../data/interfaces/person.interface'
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service'

@Injectable()
export class CustomersService extends SimpleService<ICustomerInterface>{
   constructor(
      @InjectModel('customers')
      protected readonly model: Model<ICustomerInterface>,
      protected readonly personService: PersonsService,
      protected readonly adminNotificationsService: AdminNotificationsService
   ) {
      super(model);
   }

   async fetch(id?: string): Promise<any> {
      if (id) {
         return (await this.model.findById(id).where('status', 'Active').populate('profile').exec()) as ICustomerInterface;
      }
      else {
         return await this.model.find().where('status', 'Active').populate('profile').exec() as ICustomerInterface[];
      }
   }

   async create(document: any): Promise<any> {

      let customer:any = undefined;
      const profile = await this.personService.create(document)
      if (profile){
         document.location = {
            longitude: document.longitude,
            latitude: document.latitude,
            address: document.address
         }
         document.profile = profile
         customer = await super.create(document)
      }
      else
         throw new HttpException(
           'Profile unable to SignUp, Please contact Admin Support',
           HttpStatus.NOT_ACCEPTABLE
         )

      //notification for admin
      if (customer){
         if (typeof(profile) != 'string'){
            await this.personService.change(document.profile)
         }
         const notification = {
            type: 'Customer',
            title: 'New Customer',
            // @ts-ignore
            message: 'New Customer SignUp with name : ' + (await this.model.findOne({profile: customer.profile}).populate('profile').exec()).profile.name +'.'
         }
         await this.adminNotificationsService.create(notification);
      }
      else {
         if (typeof(profile) == 'string'){
            await this.personService.delete(document.profile._id)
         }
         throw new HttpException(
           'Profile unable to SignUp, Please contact Admin Support',
           HttpStatus.NOT_ACCEPTABLE
         )
      }

      return await this.model.findById(customer._id).populate('profile').exec()
   }

   async change(document: any): Promise<any> {
      const _id = document._id
      document._id = document.personId

      const person = await this.personService.change(document)

      document.personId = document._id
      document._id = _id
      if (person){
         try {
            console.log('in try')
            document.location = {
               longitude: document.longitude,
               latitude: document.latitude,
               address: document.address
            }
            document.profile = document.personId
            await super.change(document)
         }catch (e) {
            throw new HttpException(
              'Customer unable to Update, Please contact Admin Support',
              HttpStatus.NOT_ACCEPTABLE
            )
         }
      }
      else
         throw new HttpException(
           'Customer unable to Update, Please contact Admin Support',
           HttpStatus.NOT_ACCEPTABLE
         )

      return await this.fetch(document._id);
   }

   async getProfile(contact: string): Promise<ICustomerInterface | string>{
      const person = await this.personService.fetchFromContact(contact);
      if (person){
         const customer = await this.model.findOne({profile: person._id}).populate('profile').exec()
         // @ts-ignore
         customer.profile.password = ''
         return customer
      }
      else{
         return "No Data"
      }
   }

   async getAll(id? : string): Promise<ICustomerInterface[] | ICustomerInterface>{
      if (id) return await this.model.findById(id).populate('profile').exec()
      else return await this.model.find().populate('profile').exec()
   }

   async getBlocked(id?: string, msg?: string): Promise<any>{
      if (id && msg)
         return await this.model.findByIdAndUpdate(id, {status: 'Blocked', message: msg}).exec();
      else if (id && !msg)
         return await this.model.findByIdAndUpdate(id, {status: 'Blocked'}).exec();
      else
      {
         const data = await this.model.find({status: 'Blocked'}).exec()
         if (data){
            for (let i = 0; i < data.length; ++i) {
               data[i].profile = <IPerson>await this.personService.fetch(data[i].profile.toString());
               if (data[i].profile != null){
                  // @ts-ignore
                  data[i].profile.username = "";
                  // @ts-ignore
                  data[i].profile.password = "";
               }
            }
         }
         return data;
      }
   }

   async getUnblocked(id: string): Promise<any>{
      return await this.model.findByIdAndUpdate(id, {status: 'Active'}).exec();
   }

   async searchActive(query: any){

      let results = []

      const persons = await this.personService.search(query);
      const activeCustomers = await this.model.find({status: 'Active'}).populate('profile').exec()
      if (activeCustomers){
         for (const item of persons){
            item.password = ''
            for (const index of activeCustomers){
               // @ts-ignore
               if (item._id == index.profile.id){
                  results.push(index)
               }
            }
         }
      }
      return results
   }

   async searchBlocked(query: any){
      const persons = await this.personService.search(query);
      const activeCustomers = await this.model.find({status: 'Blocked'}).populate('profile').exec()
      let results = []

      if (activeCustomers){
         for (const item of persons){
            item.password = ''
            for (const index of activeCustomers){
               // @ts-ignore
               if (item._id == index.profile.id){
                  results.push(index)
               }
            }
         }
      }
      return results
   }

}
