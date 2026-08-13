import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SocialPublisher, PublishPayload, PublishResult } from '../interfaces/publisher.interface';

/** Instagram Graph API — Reels & Video publishing */
@Injectable()
export class InstagramPublisher implements SocialPublisher {
  readonly platform = 'INSTAGRAM';
  private readonly logger = new Logger(InstagramPublisher.name);

  async publish(payload: PublishPayload): Promise<PublishResult> {
    try {
      const igUserId = payload.channelId;

      // Step 1: Create media container
      const containerRes = await axios.post(
        `https://graph.facebook.com/v21.0/${igUserId}/media`,
        {
          video_url: payload.videoUrl,
          media_type: 'REELS',
          caption: `${payload.title}\n\n${payload.description}\n\n${payload.tags.map(t => `#${t}`).join(' ')}`,
          access_token: payload.accessToken,
        },
      );
      const containerId = containerRes.data.id;

      // Step 2: Wait for processing then publish
      await this.waitForProcessing(igUserId, containerId, payload.accessToken);

      const publishRes = await axios.post(
        `https://graph.facebook.com/v21.0/${igUserId}/media_publish`,
        { creation_id: containerId, access_token: payload.accessToken },
      );

      return { success: true, platformVideoId: publishRes.data.id };
    } catch (err: any) {
      this.logger.error(`Instagram publish failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  private async waitForProcessing(userId: string, containerId: string, token: string, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
      const res = await axios.get(`https://graph.facebook.com/v21.0/${containerId}`, {
        params: { fields: 'status_code', access_token: token },
      });
      if (res.data.status_code === 'FINISHED') return;
      if (res.data.status_code === 'ERROR') throw new Error('Instagram media processing failed');
      await new Promise(r => setTimeout(r, 5000));
    }
    throw new Error('Instagram media processing timeout');
  }

  async getAnalytics(videoId: string, accessToken: string) {
    const res = await axios.get(
      `https://graph.facebook.com/v21.0/${videoId}/insights`,
      { params: { metric: 'reach,impressions,video_views,likes,comments', access_token: accessToken } },
    );
    return res.data?.data || {};
  }
}
