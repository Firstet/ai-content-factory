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
      "visualPrompt": "Detailed visual scene prompt",
      "onScreenText": "Key takeaway text"
    }
  ],
  "callToAction": "Spoken CTA",
  "seoKeywords": ["keyword1", "keyword2"]
}`;

    return this.router.generateStructuredText<any>(prompt, 'You are an expert YouTube producer.', 'scriptwriting');
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

Return JSON:
{
  "title": "Carousel Title",
  "slides": [
    {
      "slideIndex": 1,
      "headline": "Cover Headline",
      "bodyText": "Subtitle copy",
      "visualPrompt": "Cover graphic visual prompt",
      "designDirection": "Dark gradient, bold typography"
    },
    {
      "slideIndex": 2,
      "headline": "Slide Headline",
      "bodyText": "1-2 concise bullet points",
      "visualPrompt": "Minimalist diagram visual prompt",
      "designDirection": "Clean card layout"
    }
  ],
  "caption": "Full Instagram caption with hashtags",
  "hashtags": ["#AI", "#Tech"]
}`;

    return this.router.generateStructuredText<any>(prompt, 'You are a viral Instagram carousel designer.', 'copywriting');
  }

  /**
   * Adapts master narrative to TikTok / Shorts 45-second short script
   */
  async adaptToTikTok(master: MasterNarrativeInput) {
    const prompt = `Adapt this master narrative into a 45-second high-retention TikTok / Shorts script.
Title: ${master.title}
Thesis: ${master.thesis}
CTA: ${master.cta}

Return JSON:
{
  "title": "TikTok Title",
  "hook": "0-3s Pattern Interrupt Hook",
  "scenes": [
    {
      "narrationText": "Spoken line",
      "durationSeconds": 5,
      "visualType": "B_ROLL",
      "visualPrompt": "Fast motion camera visual prompt",
      "onScreenText": "BOLD CAPTION"
    }
  ],
  "caption": "TikTok caption + hashtags"
}`;

    return this.router.generateStructuredText<any>(prompt, 'You are a viral TikTok creator.', 'scriptwriting');
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
  "visualPrompt": "High-impact background poster graphic prompt",
  "colorPalette": "Navy Blue, Cyber Gold, Pure White"
}`;

    return this.router.generateStructuredText<any>(prompt, 'You are a senior graphic designer.', 'copywriting');
  }
}
