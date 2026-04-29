import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KeyBundle } from 'src/keys/key.schema';

@Injectable()
export class KeyService {
  constructor(
    @InjectModel(KeyBundle.name) private keyModel: Model<KeyBundle>,
  ) {}

  async registerKeys(userId: string, bundleData: any) {
    return this.keyModel.findOneAndUpdate(
      { userId },
      { ...bundleData, userId },
      { upsert: true, new: true },
    );
  }

  async getBundleAndPopKey(targetUserId: string) {
    const bundle = await this.keyModel.findOneAndUpdate(
      { userId: targetUserId, 'oneTimePreKeys.0': { $exists: true } },
      { $pop: { oneTimePreKeys: 1 } },
      { projection: { oneTimePreKeys: { $slice: -1 } } },
    );

    if (!bundle) {
      return this.keyModel.findOne({ userId: targetUserId });
    }

    return bundle;
  }
  y;
  async getKeyCount(userId: string): Promise<number> {
    const result = await this.keyModel.findOne(
      { userId },
      { oneTimePreKeys: 1 },
    );
    return result?.oneTimePreKeys?.length || 0;
  }

  async getLastKeyId(userId: string): Promise<number> {
    const bundle = await this.keyModel
      .findOne({ userId }, { oneTimePreKeys: { $slice: -1 } })
      .lean();

    if (!bundle) return 0;

    if (bundle?.oneTimePreKeys?.length > 0) {
      return bundle.oneTimePreKeys[0].id;
    }

    const fullBundle = await this.keyModel
      .findOne({ userId }, { signedPreKey: 1 })
      .lean();
    return fullBundle?.signedPreKey?.id || 0;
  }

  async appendPreKeys(userId: string, newKeys: any[]) {
    return this.keyModel.updateOne(
      { userId },
      { $push: { oneTimePreKeys: { $each: newKeys } } },
    );
  }
}
