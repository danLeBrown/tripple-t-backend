import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ProductsService } from '../shared/products/products.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreatePurchaseWithInvoiceDto } from './dto/create-purchase-with-invoice.dto';
import { Purchase } from './entities/purchase.entity';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private readonly repo: Repository<Purchase>,
    private readonly productsService: ProductsService,
    private readonly suppliersService: SuppliersService,
    private readonly uploadsService: UploadsService,
  ) {}

  async createWithInvoice(
    supplier_id: string,
    dto: CreatePurchaseWithInvoiceDto,
  ) {
    const upload = await this.uploadsService.create(dto.upload);

    const supplier = await this.suppliersService.findOneByOrFail({
      id: supplier_id,
    });

    const products = await this.productsService.findBy({
      id: In(dto.purchases.map((purchase) => purchase.product_id)),
    });

    return this.repo.save(
      this.repo.create(
        dto.purchases.map((purchase) => ({
          ...purchase,
          upload_id: upload.id,
          product_name: products.find(
            (product) => product.id === purchase.product_id,
          )?.name,
          supplier_name: supplier.business_name,
        })),
      ),
    );
  }
}
