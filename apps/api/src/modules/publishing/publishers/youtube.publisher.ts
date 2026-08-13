import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { SocialPublisher, PublishPayload, PublishResult } from '../interfaces/publisher.interface';

/**
 * YouTubePublisher — Full YouTube Data API v3 integration.
 * Handles video upload (resumable upload), thumbnail set, and analytics fetch.
 */
@Injectable()
export class YouTubePublisher implements SocialPublisher {
  readonly platform = 'YOUTUBE';
  private readonly logger = new Logger(YouTubePublisher.name);
  private readonly apiBase = 'https://www.googleapis.com/youtube/v3';
  private readonly uploadBase = 'https://www.googleapis.com/upload/youtube/v3';

  async publish(payload: PublishPayload): Promise<PublishResult> {
    try {
      this.logger.log(`📤 Uploading to YouTube: "${payload.title}"`);

      // 1. Initiate resumable upload session
      const uploadUrl = await this.initiateUpload(payload);

      // 2. Upload the video file
      const videoId = await this.uploadVideoFile(uploadUrl, payload.videoUrl, payload.accessToken);

      // 3. Set thumbnail if provided
      if (payload.thumbnailUrl && videoId) {
        await this.setThumbnail(videoId, payload.thumbnailUrl, payload.accessToken);
      }

      // 4. Set to published or schedule
      if (payload.scheduledAt) {
        await this.scheduleVideo(videoId, payload.scheduledAt, payload.accessToken);
      }

      this.logger.log(`✅ YouTube upload complete: ${videoId}`);

      return {
        success: true,
        platformVideoId: videoId,
        platformUrl: `https://youtube.com/watch?v=${videoId}`,
      };
    } catch (error: any) {
      this.logger.error(`❌ YouTube upload failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  private async initiateUpload(payload: PublishPayload): Promise<string> {
    const metadata = {
      snippet: {
        title: payload.title.substring(0, 100),
        description: payload.description.substring(0, 5000),
        tags: payload.tags.slice(0, 500),
        categoryId: '22', // People & Blogs
        defaultLanguage: 'en',
        defaultAudioLanguage: 'en',
      },
      status: {
        privacyStatus: payload.scheduledAt ? 'private' : 'public',
        selfDeclaredMadeForKids: false,
      },
    };

    const response = await axios.post(
      `${this.uploadBase}/videos?uploadType=resumable&part=snippet,status`,
      metadata,
      {
        headers: {
          Authorization: `Bearer ${payload.accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/*',
        },
      },
    );

    return response.headers.location;
  }

  private async uploadVideoFile(uploadUrl: string, videoUrl: string, _accessToken: string): Promise<string> {
    // Download the video from MinIO first
    const videoResponse = await axios.get(videoUrl, { responseType: 'stream' });
    
    const uploadResponse = await axios.put(uploadUrl, videoResponse.data, {
      headers: {
        'Content-Type': 'video/mp4',
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    return uploadResponse.data.id;
  }

  private async setThumbnail(videoId: string, thumbnailUrl: string, accessToken: string) {
    const imgResponse = await axios.get(thumbnailUrl, { responseType: 'arraybuffer' });
    
    await axios.post(
      `${this.uploadBase}/thumbnails/set?videoId=${videoId}&uploadType=media`,
      imgResponse.data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'image/jpeg',
        },
      },
    );
  }

  private async scheduleVideo(videoId: string, scheduledAt: Date, accessToken: string) {
    await axios.put(
      `${this.apiBase}/videos?part=status`,
      {
        id: videoId,
        status: {
          privacyStatus: 'private',
          publishAt: scheduledAt.toISOString(),
        },
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  }

  async getAnalytics(videoId: string, accessToken: string): Promise<Record<string, unknown>> {
    const response = await axios.get(
      `https://youtubeanalytics.googleapis.com/v2/reports`,
      {
        params: {
          ids: 'channel==MINE',
          startDate: '2020-01-01',
          endDate: new Date().toISOString().split('T')[0],
          metrics: 'views,likes,dislikes,comments,shares,estimatedMinutesWatched,averageViewDuration,impressions,impressionClickThroughRate',
          filters: `video==${videoId}`,
          dimensions: 'video',
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return response.data;
  }
}
