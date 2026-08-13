import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SocialPublisher, PublishPayload, PublishResult } from '../interfaces/publisher.interface';

/** Facebook Graph API — Video publishing to Pages */
@Injectable()
export class FacebookPublisher implements SocialPublisher {
  readonly platform = 'FACEBOOK';
  private readonly logger = new Logger(FacebookPublisher.name);

  async publish(payload: PublishPayload): Promise<PublishResult> {
    try {
      const res = await axios.post(
        `https://graph.facebook.com/v21.0/${payload.channelId}/videos`,
        {
          file_url: payload.videoUrl,
          title: payload.title.substring(0, 255),
          description: payload.description.substring(0, 2000),
          published: !payload.scheduledAt,
          ...(payload.scheduledAt ? { scheduled_publish_time: Math.floor(payload.scheduledAt.getTime() / 1000) } : {}),
          access_token: payload.accessToken,
        },
      );
      return { success: true, platformVideoId: res.data.id };
    } catch (err: any) {
      this.logger.error(`Facebook publish failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async getAnalytics(videoId: string, accessToken: string) {
    const res = await axios.get(`https://graph.facebook.com/v21.0/${videoId}/video_insights`, {
      params: { metric: 'total_video_views,total_video_impressions,total_video_reactions_by_type_total', access_token: accessToken },
    });
    return res.data?.data || {};
  }
}
