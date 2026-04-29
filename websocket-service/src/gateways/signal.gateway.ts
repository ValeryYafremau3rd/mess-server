import { SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { redisClient } from '../redis-io.adapter';
import { KeyService } from 'src/keys/key.service';
import { Server, Socket } from 'socket.io';

export abstract class SignalGateway {
  abstract server: Server;
  abstract readonly keyService: KeyService;

  @SubscribeMessage('UPLOAD_PREKEYS')
  async handleUploadMorePreKeys(
    @MessageBody() data: { userId: string; oneTimePreKeys: any[] },
  ) {
    try {
      const { userId, oneTimePreKeys } = data;

      if (!userId || !oneTimePreKeys || oneTimePreKeys.length === 0) {
        return { success: false, error: 'No keys provided' };
      }

      await this.keyService.appendPreKeys(userId, oneTimePreKeys);
      return {
        success: true,
        countAdded: oneTimePreKeys.length,
      };
    } catch (error) {
      console.error('[Signal] Failed to append PreKeys:', error);
      return { success: false, error: 'Database update failed' };
    }
  }

  @SubscribeMessage('register_keys')
  async handleRegisterKeys(
    @MessageBody() data: { userId: string; bundle: any },
  ) {
    try {
      const { userId, bundle } = data;

      if (!userId || !bundle) {
        return { success: false, error: 'Incomplete data' };
      }

      await this.keyService.registerKeys(userId, bundle);

      console.log(`Successfully registered keys for user: ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: 'Internal server error' };
    }
  }

  @SubscribeMessage('get_bundle')
  async handleGetBundle(@MessageBody() targetUserId: string) {
    const bundle = await this.keyService.getBundleAndPopKey(targetUserId);

    if (!bundle) return { error: 'User not found' };

    const remainingCount = await this.keyService.getKeyCount(targetUserId);

    if (remainingCount < 10) {
      const lastKey = bundle.oneTimePreKeys[bundle.oneTimePreKeys.length - 1];

      const isOnline = await redisClient.exists(`online:${targetUserId}`);

      if (isOnline) {
        this.server
          .to(`user:${targetUserId}`)
          .emit('low_prekeys', { lastId: lastKey?.id || 0 });
      }
    }

    return {
      registrationId: bundle.registrationId,
      identityKey: bundle.identityKey,
      signedPreKey: bundle.signedPreKey,
      oneTimePreKey: bundle.oneTimePreKeys[0] || null,
    };
  }

  protected async checkPreKeys(client: Socket, userId) {
    const keyCount = await this.keyService.getKeyCount(userId);

    if (keyCount === 0) {
      client.emit('REQUEST_REGISTRATION');
    } else if (keyCount < 10) {
      const lastKeyId = await this.keyService.getLastKeyId(userId);
      client.emit('REQUEST_PREKEYS', { lastKeyId });
    }
  }
}
