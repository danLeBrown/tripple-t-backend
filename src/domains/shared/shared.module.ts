import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ColoursController } from './colours/colours.controller';
import { ColoursService } from './colours/colours.service';
import { Colour } from './colours/entities/colour.entity';
import { Document } from './documents/entities/document.entity';
import { Size } from './sizes/entities/size.entity';
import { SizesController } from './sizes/sizes.controller';
import { SizesService } from './sizes/sizes.service';
import { Unit } from './units/entities/unit.entity';
import { UnitsController } from './units/units.controller';
import { UnitsService } from './units/units.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Document, Unit, Colour, Size])],
  controllers: [UnitsController, ColoursController, SizesController],
  providers: [UnitsService, ColoursService, SizesService],
  exports: [UnitsService, ColoursService, SizesService, TypeOrmModule],
})
export class SharedModule {}
