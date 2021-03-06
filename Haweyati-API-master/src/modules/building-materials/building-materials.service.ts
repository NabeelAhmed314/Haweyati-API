import { Injectable } from '@nestjs/common'
import { SimpleService } from '../../common/lib/simple.service'
import { IBuildingMaterialsInterface } from '../../data/interfaces/buildingMaterials.interface'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ShopRegistrationService } from '../shop-registration/shop-registration.service'
import { BuildingMaterialCategoryService } from '../building-material-category/building-material-category.service'
import { IBuildingMaterialCategory } from '../../data/interfaces/buildingMaterialCategory.interface'
import { IShopRegistrationInterface } from '../../data/interfaces/shop-registration.interface'
import { ImageConversionUtils } from '../../common/lib/image-conversion-utils'

@Injectable()
export class BuildingMaterialsService extends SimpleService<
  IBuildingMaterialsInterface
> {
  constructor(
    @InjectModel('buildingmaterials')
    protected readonly model: Model<IBuildingMaterialsInterface>,
    private readonly service: ShopRegistrationService,
    private readonly categoryService: BuildingMaterialCategoryService
  ) {
    super(model)
  }

  async fetch(
    id?: string
  ): Promise<IBuildingMaterialsInterface[] | IBuildingMaterialsInterface> {
    if (id) {
      let data = await this.model.findOne({ _id: id, status: 'Active' }).exec()
      for (let i = 0; i < data.suppliers.length; ++i) {
        data.suppliers[i] = (await this.service.fetch(
          data.suppliers[i].toString()
        )) as IShopRegistrationInterface
      }
      return data
    } else {
      let big = await this.model.find({ status: 'Active' }).exec()
      for (let data of big) {
        for (let i = 0; i < data.suppliers.length; ++i) {
          data.suppliers[i] = (await this.service.fetch(
            data.suppliers[i].toString()
          )) as IShopRegistrationInterface
        }
      }
      return big
    }
  }

  async create(document: IBuildingMaterialsInterface): Promise<IBuildingMaterialsInterface> {
    const bm = await super.create(document)
    if (document.image){
      await ImageConversionUtils.toWebp(process.cwd()+"\\"+bm.image.path, process.cwd()+"\\..\\uploads\\"+bm.image.name, 20)
    }
    return bm
  }

  async change(document: IBuildingMaterialsInterface): Promise<IBuildingMaterialsInterface> {
    const bm = await super.change(document)
    if (document.image){
      await ImageConversionUtils.toWebp(process.cwd()+"\\"+bm.image.path, process.cwd()+"\\..\\uploads\\"+bm.image.name, 20)
    }
    return bm
  }

  async fetchByParentId(id: string): Promise<IBuildingMaterialsInterface[]> {
    return await this.model
      .find({ status: 'Active' })
      .where('parent', id)
      .exec()
  }

  async getByCity(city: string, parent: string): Promise<any> {
    if (city) {
      const data = await this.service.getDataFromCityName(
        city,
        'Building Material'
      )
      const dump = await this.model
        .find({ status: 'Active' })
        .where('parent', parent)
        .exec()

      const result = []

      for (const item of dump) {
        for (const supplier of data) {
          if (item.suppliers.includes(supplier)) {
            result.push(item)
          }
        }
      }
      return result
    }
  }

  async getSuppliers(id: string): Promise<any> {
    const dump = await this.model.find({ status: 'Active' }).exec()
    const result = []

    for (const item of dump) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (item.suppliers.includes(id)) {
        item.parent = (await this.categoryService.fetch(
          item.parent.toString()
        )) as IBuildingMaterialCategory
        result.push(item)
      }
    }
    return result
  }

  async remove(id: string): Promise<any> {
    return this.model.findByIdAndUpdate(id, { status: 'Inactive' })
  }

  //deleting building material category
  async deleteCategory(id: string): Promise<any> {
    await this.categoryService.remove(id)
    const data = await this.fetchByParentId(id)
    for (const item of data) {
      await this.remove(item._id)
    }
    return 'Category Deleted'
  }
}
