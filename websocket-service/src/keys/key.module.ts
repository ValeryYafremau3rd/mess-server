import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KeyBundle, KeyBundleSchema } from './key.schema';
import { KeyService } from 'src/keys/key.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KeyBundle.name, schema: KeyBundleSchema },
    ]),
  ],
  providers: [KeyService],
  exports: [KeyService],
})
export class KeyModule {}
