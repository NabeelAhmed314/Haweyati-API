import { Controller } from '@nestjs/common';
import {SimpleController} from "../../common/lib/simple.controller";
import {IScaffoldingsInterface} from "../../data/interfaces/scaffoldings.interface";
import {ScaffoldingsService} from "./scaffoldings.service";

@Controller('scaffoldings')
export class ScaffoldingsController extends SimpleController<IScaffoldingsInterface>{
    constructor(protected readonly service: ScaffoldingsService) {
        super(service);
    }
}