import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart, CartSchema } from './schemas/cart.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import Logger from '../utils/Logger';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule implements OnModuleInit {
  constructor(@InjectConnection() private connection: Connection) {}

  async onModuleInit() {
    try {
      // Drop the problematic unique index if it exists
      const collection = this.connection.collection('carts');
      const indexes = await collection.indexes();
      
      Logger.log('Checking for problematic indexes on carts collection...');
      
      // Find all indexes that might be problematic
      const problematicIndexes = indexes.filter(
        (idx) => {
          const indexName = idx.name || '';
          const indexKey = idx.key || {};
          return (
            indexName.includes('items.productId') ||
            ('items.productId' in indexKey && idx.unique === true)
          );
        }
      );

      if (problematicIndexes.length > 0) {
        Logger.warn(`Found ${problematicIndexes.length} problematic index(es), dropping them...`);
        for (const idx of problematicIndexes) {
          try {
            await collection.dropIndex(idx.name);
            Logger.success(`Successfully dropped index: ${idx.name}`);
          } catch (dropError) {
            Logger.warn(`Could not drop index ${idx.name}:`, dropError instanceof Error ? dropError.message : String(dropError));
          }
        }
      } else {
        Logger.log('No problematic indexes found on carts collection');
      }
    } catch (error) {
      // Index might not exist, which is fine
      Logger.warn('Error checking/dropping indexes:', error instanceof Error ? error.message : String(error));
    }
  }
}
