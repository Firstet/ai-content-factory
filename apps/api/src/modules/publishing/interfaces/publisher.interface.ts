// ============================================================
// Publisher Interface — All social publishers implement this
// ============================================================

export interface PublishPayload {
  videoUrl: string;        // URL to the rendered video file
  thumbnailUrl?: string;
  title: string;
  description: string;
  tags: string[];
  accessToken: string;     // decrypted OAuth access token
  channelId: string;       // platform-specific channel/account ID
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface PublishResult {
  success: boolean;
  platformVideoId?: string;
  platformUrl?: string;
  error?: string;
}

export interface SocialPublisher {
  readonly platform: string;
  publish(payload: PublishPayload): Promise<PublishResult>;
  getAnalytics(platformVideoId: string, accessToken: string): Promise<Record<string, unknown>>;
}
