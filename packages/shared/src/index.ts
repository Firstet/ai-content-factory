// ============================================================
// AI Content Factory — Shared Types & Constants
// ============================================================

// ─── Enums ────────────────────────────────────────────────────

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export enum Platform {
  YOUTUBE = 'YOUTUBE',
  TIKTOK = 'TIKTOK',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
}

export enum AIProviderName {
  OPENAI = 'OPENAI',
  GEMINI = 'GEMINI',
  ANTHROPIC = 'ANTHROPIC',
  OPENROUTER = 'OPENROUTER',
  NVIDIA = 'NVIDIA',
  OLLAMA = 'OLLAMA',
}

export enum AICapability {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SPEECH = 'SPEECH',
  VIDEO = 'VIDEO',
  EMBEDDINGS = 'EMBEDDINGS',
}

export enum PipelineStep {
  RESEARCH = 'RESEARCH',
  TOPIC_DISCOVERY = 'TOPIC_DISCOVERY',
  SCRIPT = 'SCRIPT',
  FACT_CHECK = 'FACT_CHECK',
  SEO = 'SEO',
  STORYBOARD = 'STORYBOARD',
  VOICE = 'VOICE',
  IMAGE = 'IMAGE',
  SUBTITLE = 'SUBTITLE',
  VIDEO = 'VIDEO',
  THUMBNAIL = 'THUMBNAIL',
  PUBLISHING = 'PUBLISHING',
  ANALYTICS = 'ANALYTICS',
}

export enum JobStatus {
  WAITING = 'WAITING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  DELAYED = 'DELAYED',
  PAUSED = 'PAUSED',
}

export enum VideoStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  RENDERED = 'RENDERED',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  SCHEDULED = 'SCHEDULED',
}

export enum VideoStrategy {
  FFMPEG_ASSEMBLY = 'FFMPEG_ASSEMBLY',    // Strategy A: Script → Voice → Images → FFmpeg
  AI_VIDEO_PROVIDER = 'AI_VIDEO_PROVIDER', // Strategy B: Script → AI Video API
}

export enum AssetType {
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  THUMBNAIL = 'THUMBNAIL',
  SUBTITLE = 'SUBTITLE',
  DOCUMENT = 'DOCUMENT',
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// ─── Queue Names ──────────────────────────────────────────────

export const QUEUE_NAMES = {
  RESEARCH: 'research',
  SCRIPT: 'script',
  FACT_CHECK: 'fact-check',
  SEO: 'seo',
  STORYBOARD: 'storyboard',
  VOICE: 'voice',
  IMAGE: 'image',
  SUBTITLE: 'subtitle',
  VIDEO: 'video',
  THUMBNAIL: 'thumbnail',
  UPLOAD: 'upload',
  ANALYTICS: 'analytics',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ─── API Response Wrapper ─────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// ─── Entity Types ─────────────────────────────────────────────

export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  brandId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandDto {
  id: string;
  name: string;
  logoUrl?: string;
  voiceTone: string;
  styleGuide?: string;
  videoStrategy: VideoStrategy;
  createdAt: string;
}

export interface ChannelDto {
  id: string;
  brandId: string;
  platform: Platform;
  name: string;
  platformChannelId?: string;
  isConnected: boolean;
  subscriberCount?: number;
  createdAt: string;
}

export interface VideoDto {
  id: string;
  title: string;
  description?: string;
  status: VideoStatus;
  brandId: string;
  channelId?: string;
  pipelineStep?: PipelineStep;
  durationSeconds?: number;
  thumbnailUrl?: string;
  videoUrl?: string;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobDto {
  id: string;
  queue: QueueName;
  status: JobStatus;
  progress: number;
  videoId?: string;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderDto {
  id: string;
  name: AIProviderName;
  enabled: boolean;
  capabilities: AICapability[];
  preferredFor: AICapability[];
  modelConfig: Record<string, unknown>;
  createdAt: string;
}

export interface PromptDto {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: string[];
  version: number;
  isActive: boolean;
  createdAt: string;
}

export interface AnalyticsDto {
  id: string;
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  avgViewDuration?: number;
  clickThroughRate?: number;
  impressions?: number;
  syncedAt: string;
}

// ─── Pipeline Types ───────────────────────────────────────────

export interface PipelineJobPayload {
  videoId: string;
  brandId: string;
  channelId?: string;
  step: PipelineStep;
  metadata: Record<string, unknown>;
}

export interface ScriptContent {
  title: string;
  hook: string;
  sections: ScriptSection[];
  callToAction: string;
  totalDuration: number;
  keywords: string[];
  seoScore?: number;
}

export interface ScriptSection {
  id: string;
  heading: string;
  content: string;
  durationSeconds: number;
  imagePrompt?: string;
  voiceNote?: string;
}

export interface StoryboardFrame {
  id: string;
  sectionId: string;
  imagePrompt: string;
  duration: number;
  transition: 'fade' | 'cut' | 'slide' | 'zoom';
  voiceText: string;
}

// ─── WebSocket Events ─────────────────────────────────────────

export enum WSEvent {
  JOB_PROGRESS = 'job:progress',
  JOB_COMPLETED = 'job:completed',
  JOB_FAILED = 'job:failed',
  PIPELINE_STARTED = 'pipeline:started',
  PIPELINE_COMPLETED = 'pipeline:completed',
}

export interface WSJobProgressPayload {
  jobId: string;
  videoId: string;
  step: PipelineStep;
  progress: number;
  message: string;
}
