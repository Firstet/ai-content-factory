import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { SocialPublisher, PublishPayload, PublishResult } from '../interfaces/publisher.interface';

/** LinkedIn API — Video publishing to Company Pages or profiles */
@Injectable()
export class LinkedInPublisher implements SocialPublisher {
  readonly platform = 'LINKEDIN';
  private readonly logger = new Logger(LinkedInPublisher.name);

  async publish(payload: PublishPayload): Promise<PublishResult> {
    try {
      const personUrn = `urn:li:person:${payload.channelId}`;

      // Step 1: Register upload
      const registerRes = await axios.post(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-video'],
            owner: personUrn,
            serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
          },
        },
        { headers: { Authorization: `Bearer ${payload.accessToken}`, 'Content-Type': 'application/json' } },
      );

      const uploadUrl = registerRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
      const asset = registerRes.data.value.asset;

      // Step 2: Upload video
      const videoData = await axios.get(payload.videoUrl, { responseType: 'arraybuffer' });
      await axios.put(uploadUrl, videoData.data, {
        headers: { Authorization: `Bearer ${payload.accessToken}`, 'Content-Type': 'application/octet-stream' },
      });

      // Step 3: Create post
      const postRes = await axios.post(
        'https://api.linkedin.com/v2/ugcPosts',
        {
          author: personUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: { text: `${payload.title}\n\n${payload.description}`.substring(0, 3000) },
              shareMediaCategory: 'VIDEO',
              media: [{
                status: 'READY',
                description: { text: payload.description.substring(0, 200) },
                media: asset,
                title: { text: payload.title.substring(0, 200) },
              }],
            },
          },
          visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
        },
        { headers: { Authorization: `Bearer ${payload.accessToken}`, 'Content-Type': 'application/json' } },
      );

      return { success: true, platformVideoId: postRes.data.id };
    } catch (err: any) {
      this.logger.error(`LinkedIn publish failed: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async getAnalytics(postId: string, accessToken: string) {
    const res = await axios.get(
      `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:share:${postId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return res.data || {};
  }
}
