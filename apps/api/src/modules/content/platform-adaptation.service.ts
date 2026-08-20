import { Injectable, Logger } from '@nestjs/common';
import { ProviderRouterService } from '../providers/provider-registry.service';

export interface MasterNarrativeInput {
  title: string;
  thesis: string;
  angle: string;
  keyPoints: string[];
  factsAndStats: string[];
  cta: string;
  brandContext: any;
}

@Injectable()
export class PlatformAdaptationService {
  private readonly logger = new Logger(PlatformAdaptationService.name);

  constructor(private router: ProviderRouterService) {}

  /**
   * Adapts master narrative to YouTube long video script & scene timeline
   */
  async adaptToYouTube(master: MasterNarrativeInput) {
    const prompt = `Adapt this master narrative into an 8-minute YouTube documentary script & scene breakdown.
Title: ${master.title}
Thesis: ${master.thesis}
Angle: ${master.angle}
Key Points: ${master.keyPoints.join(', ')}
CTA: ${master.cta}
Brand Voice: ${master.brandContext?.voiceTone || 'Professional and engaging'}

CRITICAL FOR VISUAL PROMPTS & B-ROLL: Every "visualPrompt" MUST be a detailed, highly descriptive 8K cinematic image/video prompt (e.g., "Cinematic 8k photorealistic shot of futuristic neon tech laboratory, volumetric lighting, Octane render, shallow depth of field, dramatic shadows").

Return JSON:
{
  "title": "YouTube Title",
  "hook": "Spoken opening hook (30s)",
  "sections": [
    {
      "heading": "Section 1",
      "content": "Full narration text...",
      "durationSeconds": 120,
      "visualType": "AI_IMAGE",
      "visualPrompt": "Cinematic 8k photorealistic scene prompt with camera lighting and composition",
      "onScreenText": "Key takeaway text"
    }
  ],
  "callToAction": "Spoken CTA",
  "seoKeywords": ["keyword1", "keyword2"]
}`;

    return this.router.generateStructuredText<any>(prompt, 'You are an expert YouTube producer and visual director.', 'scriptwriting');
  }

  /**
   * Adapts master narrative to Instagram 8-slide educational carousel
   */
  async adaptToInstagramCarousel(master: MasterNarrativeInput) {
    const prompt = `Adapt this master narrative into an 8-slide educational Instagram Carousel.
Title: ${master.title}
Thesis: ${master.thesis}
Key Points: ${master.keyPoints.join(', ')}
CTA: ${master.cta}
Brand Voice: ${master.brandContext?.voiceTone || 'Bold & engaging'}

CRITICAL: "visualPrompt" MUST describe a high-end 8k aesthetic graphic/background composition with lighting, textures, and gradient accents.

Return JSON:
{
  "title": "Carousel Title",
  "slides": [
    {
      "slideIndex": 1,
      "headline": "Cover Headline",
      "bodyText": "Subtitle copy",
      "visualPrompt": "Ultra-HD 8k dark glassmorphic cover graphic prompt with luminous accents",
      "designDirection": "Dark gradient, bold typography"
    },
    {
      "slideIndex": 2,
      "headline": "Slide Headline",
      "bodyText": "1-2 concise bullet points",
      "visualPrompt": "Clean 8k minimalist diagram or visual graphic prompt",
      "designDirection": "Clean card layout"
    }
  ],
  "caption": "Full Instagram caption with hashtags",
  "hashtags": ["#AI", "#Tech"]
}`;

    return this.router.generateStructuredText<any>(prompt, 'You are a viral Instagram carousel designer and visual director.', 'copywriting');
  }

  /**
   * Adapts master narrative to TikTok / Shorts 45-second short script
   */
  async adaptToTikTok(master: MasterNarrativeInput) {
    const prompt = `Adapt this master narrative into a 45-second high-retention TikTok / Shorts script.
Title: ${master.title}
Thesis: ${master.thesis}
CTA: ${master.cta}

CRITICAL FOR B-ROLL: Every "visualPrompt" MUST be a 4k/8k fast-paced cinematic motion shot prompt (e.g., "Cinematic 8k dynamic drone shot gliding over modern futuristic city skyline, sunset reflections, IMAX 60fps feel").

Return JSON:
{
  "title": "TikTok Title",
  "hook": "0-3s Pattern Interrupt Hook",
  "scenes": [
    {
      "narrationText": "Spoken line",
      "durationSeconds": 5,
      "visualType": "B_ROLL",
      "visualPrompt": "Cinematic 8k fast motion camera visual prompt with dynamic lighting",
      "onScreenText": "BOLD CAPTION"
    }
  ],
  "caption": "TikTok caption + hashtags"
}`;

    return this.router.generateStructuredText<any>(prompt, 'You are a viral TikTok creator and video director.', 'scriptwriting');
  }

  /**
   * Adapts master narrative to LinkedIn thought-leadership post
   */
  async adaptToLinkedIn(master: MasterNarrativeInput) {
    const prompt = `Adapt this master narrative into an insightful LinkedIn thought-leadership article post.
Title: ${master.title}
Thesis: ${master.thesis}
Key Points: ${master.keyPoints.join(', ')}
CTA: ${master.cta}

Return JSON:
{
  "title": "LinkedIn Article Headline",
  "postCopy": "Full LinkedIn post formatted with short paragraphs, emojis, and bullet points",
  "takeaways": ["Takeaway 1", "Takeaway 2"],
  "hashtags": ["#Leadership", "#Innovation"]
}`;

    return this.router.generateStructuredText<any>(prompt, 'You are a top 1% LinkedIn thought leader.', 'copywriting');
  }

  /**
   * Adapts master narrative to Promotional Flyer / Poster layout
   */
  async adaptToFlyer(master: MasterNarrativeInput) {
    const prompt = `Adapt this master narrative into a promotional flyer / poster graphic layout.
Title: ${master.title}
Thesis: ${master.thesis}
CTA: ${master.cta}

Return JSON:
{
  "headline": "Bold Main Poster Headline",
  "subheadline": "Supporting Subheadline",
  "bulletPoints": ["Benefit 1", "Benefit 2", "Benefit 3"],
  "ctaText": "Clear Call To Action",
  "visualPrompt": "Cinematic 8k high-impact background poster graphic with 3D elements and dramatic lighting",
  "colorPalette": "Navy Blue, Cyber Gold, Pure White"
}`;

    return this.router.generateStructuredText<any>(prompt, 'You are a senior graphic designer.', 'copywriting');
  }
}
