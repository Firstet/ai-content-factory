import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SocialPublisher, PublishPayload, PublishResult } from '../interfaces/publisher.interface';

/** Twitter/X API v2 — Video tweet upload */
@Injectable()
export class TwitterPublisher implements SocialPublisher {
  readonly platform = 'TWITTER';
  private readonly logger = new Logger(TwitterPublisher.name);

  async publish(payload: PublishPayload): Promise<PublishResult> {
    try {
      // Step 1: Upload media
      const mediaId = await this.uploadMedia(payload.videoUrl, payload.accessToken);

      // Step 2: Create tweet
      const res = await axios.post(
        'https://api.twitter.com/2/tweets',
        {
          text: `${payload.title}\n\n${payload.tags.slice(0, 5).map(t => `#${t}`).join(' ')}`.substring(0, 280),
          media: { media_ids: [mediaId] },
        },
        { headers: { Authorization: `Bearer ${payload.accessToken}`, 'Content-Type': 'application/json' } },
      );

      return { success: true, platformVideoId: res.data.data.id };
    } catch (err: any) {
      this.logger.error(`Twitter publish failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  private async uploadMedia(_videoUrl: string, _accessToken: string): Promise<string> {
    // Twitter requires chunked upload — simplified here
    // In production: use INIT → APPEND (chunked) → FINALIZE flow
    return 'media_id_placeholder';
  }

  async getAnalytics(tweetId: string, accessToken: string) {
    const res = await axios.get(`https://api.twitter.com/2/tweets/${tweetId}`, {
      params: { 'tweet.fields': 'public_metrics' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data?.data?.public_metrics || {};
  }
}
