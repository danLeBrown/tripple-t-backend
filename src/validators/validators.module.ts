import { Global, Module } from '@nestjs/common';

import { EntityExistsValidator } from './entity-exists';
import { EntityNotExistsValidator } from './entity-not-exists';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [EntityExistsValidator, EntityNotExistsValidator],
  exports: [EntityExistsValidator, EntityNotExistsValidator],
})
export class ValidatorsModule {}
