import { Product } from '../entities/product.entity';

export interface IProductCreatedEvent {
  product: Product;
}
