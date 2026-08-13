import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SocialPublisher, PublishPayload, PublishResult } from '../interfaces/publisher.interface';

/**
 * TikTokPublisher — TikTok Content Posting API v2
 * Requires TikTok for Developers app with video.publish scope
 */
@Injectable()
export class TikTokPublisher implements SocialPublisher {
  readonly platform = 'TIKTOK';
  private readonly logger = new Logger(TikTokPublisher.name);

  async publish(payload: PublishPayload): Promise<PublishResult> {
    try {
      // Step 1: Initialize upload
      const initRes = await axios.post(
        'https://open.tiktokapis.com/v2/post/publish/video/init/',
        {
          post_info: {
            title: payload.title.substring(0, 150),
            privacy_level: 'PUBLIC_TO_EVERYONE',
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: 'PULL_FROM_URL',
            video_url: payload.videoUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${payload.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const publishId = initRes.data?.data?.publish_id;
      this.logger.log(`TikTok publish_id: ${publishId}`);

      return {
        success: true,
        platformVideoId: publishId,
        platformUrl: `https://tiktok.com`,
      };
    } catch (err: any) {
      this.logger.error(`TikTok publish failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async getAnalytics(videoId: string, accessToken: string) {
    const res = await axios.get(
      `https://open.tiktokapis.com/v2/video/list/?fields=id,title,view_count,like_count,comment_count,share_count`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return res.data?.data || {};
  }
}
