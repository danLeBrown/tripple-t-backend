import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ColoursController } from './colours/colours.controller';
import { ColoursService } from './colours/colours.service';
import { Colour } from './colours/entities/colour.entity';
import { Document } from './documents/entities/document.entity';
import { Product } from './products/entities/product.entity';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { Size } from './sizes/entities/size.entity';
import { SizesController } from './sizes/sizes.controller';
import { SizesService } from './sizes/sizes.service';
import { Unit } from './units/entities/unit.entity';
import { UnitsController } from './units/units.controller';
import { UnitsService } from './units/units.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Document, Unit, Colour, Size, Product])],
  controllers: [
    UnitsController,
    ColoursController,
    SizesController,
    ProductsController,
  ],
  providers: [UnitsService, ColoursService, SizesService, ProductsService],
  exports: [
    UnitsService,
    ColoursService,
    SizesService,
    ProductsService,
    TypeOrmModule,
  ],
})
export class SharedModule {}
