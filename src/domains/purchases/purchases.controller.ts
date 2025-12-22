import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuditLog } from '@/decorators/audit-log.decorator';

import { CreatePurchaseWithInvoiceDto } from './dto/create-purchase-with-invoice.dto';
import { PurchaseDto } from './dto/purchase.dto';
import { PurchasesService } from './purchases.service';

@ApiBearerAuth()
@ApiTags('Purchases')
@Controller({ path: 'purchases', version: '1' })
@AuditLog({
  model: 'Purchases',
})
export class PurchasesController {
  constructor(private purchasesService: PurchasesService) {}

  @Post('suppliers/:supplier_id')
  async createWithInvoice(
    @Param('supplier_id', ParseUUIDPipe) supplier_id: string,
    @Body() dto: CreatePurchaseWithInvoiceDto,
  ) {
    const data = await this.purchasesService.createWithInvoice(
      supplier_id,
      dto,
    );

    return {
      data: PurchaseDto.collection(data),
    };
  }
}
