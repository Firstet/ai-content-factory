import { Injectable, Logger } from '@nestjs/common';
import { ProviderRouterService } from '../providers/provider-registry.service';

export interface SceneInput {
  sceneId: string;
  type: string;
  duration: number;
  narration: string;
  previousScene?: any;
  nextScene?: any;
  brandContext?: any;
  platform?: string;
  aspectRatio?: string;
}

export interface StructuredVisualPrompt {
  subject: string;
  environment: string;
  action: string;
  composition: string;
  camera: string;
  lighting: string;
  mood: string;
  visualStyle: string;
  colorDirection: string;
  motion: string;
  negativePrompt: string;
  aspectRatio: string;
  finalPrompt: string;
}

export interface DirectSceneOutput {
  sceneId: string;
  visualTreatment: 'TALKING_HEAD' | 'CINEMATIC_BROLL' | 'PRODUCT_SHOT' | 'INFOGRAPHIC' | 'DATA_VISUALIZATION' | 'TYPOGRAPHY' | 'GENERATED_IMAGE' | 'GENERATED_VIDEO';
  visualPrompt: StructuredVisualPrompt;
  cameraDirection: string;
  motionDirection: string;
  onScreenText: string;
  transition: string;
}

@Injectable()
export class SceneDirectorService {
  private readonly logger = new Logger(SceneDirectorService.name);

  constructor(private router: ProviderRouterService) {}

  /**
   * Directs scene visual treatment and builds structured production prompt with scene continuity
   */
  async directScene(input: SceneInput): Promise<DirectSceneOutput> {
    const prompt = `You are a Hollywood Scene Director & Visual Effects Lead.
Analyze this narration line and determine the best visual treatment and structured 8K visual prompt.

Narration Line: "${input.narration}"
Platform: ${input.platform || 'YOUTUBE'}
Aspect Ratio: ${input.aspectRatio || '16:9'}
Brand Style: ${input.brandContext?.videoStyle || 'Modern, Cinematic & Photorealistic'}
Previous Scene Context: "${input.previousScene?.narration || 'Opening frame'}"
Next Scene Context: "${input.nextScene?.narration || 'Following frame'}"

Return JSON:
{
  "sceneId": "${input.sceneId}",
  "visualTreatment": "CINEMATIC_BROLL",
  "cameraDirection": "Slow forward dolly zoom, 35mm lens",
  "motionDirection": "Smooth 60fps pan across subject",
  "onScreenText": "KEY TAKEAWAY CAPTION",
  "transition": "Cross dissolve",
  "visualPrompt": {
    "subject": "Detailed main subject description",
    "environment": "High-tech lab or atmospheric environment",
    "action": "Dynamic movement or transformation",
    "composition": "Rule of thirds, centered subject, low angle",
    "camera": "Arri Alexa, 35mm anamorphic lens",
    "lighting": "Volumetric cinematic lighting, dramatic rim light",
    "mood": "Futuristic, authoritative, inspirational",
    "visualStyle": "Cinematic photorealistic 8k",
    "colorDirection": "Royal blue, deep obsidian black, gold accents",
    "motion": "Fluid camera motion",
    "negativePrompt": "blurry, low resolution, cartoon, distorted faces, ugly text",
    "aspectRatio": "${input.aspectRatio || '16:9'}"
  }
}`;

    try {
      const res = await this.router.generateStructuredText<any>(
        prompt,
        'You are an expert AI Scene Director.',
        'scriptwriting',
      );

      const vp = res.visualPrompt || {};
      const finalPrompt = `Cinematic 8k photorealistic shot of ${vp.subject || input.narration}. ${vp.environment || ''}, ${vp.action || ''}. ${vp.composition || ''}, ${vp.camera || ''}, ${vp.lighting || ''}, ${vp.colorDirection || ''}, ${vp.mood || ''}. Highly detailed Octane render quality --ar ${input.aspectRatio || '16:9'}`;

      return {
        sceneId: input.sceneId,
        visualTreatment: res.visualTreatment || 'CINEMATIC_BROLL',
        cameraDirection: res.cameraDirection || 'Steady center shot',
        motionDirection: res.motionDirection || 'Subtle pan',
        onScreenText: res.onScreenText || input.narration.substring(0, 40),
        transition: res.transition || 'Fade',
        visualPrompt: {
          subject: vp.subject || input.narration,
          environment: vp.environment || 'Modern studio environment',
          action: vp.action || 'Subtle movement',
          composition: vp.composition || 'Rule of thirds',
          camera: vp.camera || '35mm lens',
          lighting: vp.lighting || 'Cinematic studio lighting',
          mood: vp.mood || 'Professional',
          visualStyle: vp.visualStyle || '8k Photorealistic',
          colorDirection: vp.colorDirection || 'Royal Blue & Deep Dark',
          motion: vp.motion || 'Smooth forward dolly',
          negativePrompt: vp.negativePrompt || 'blurry, low quality',
          aspectRatio: input.aspectRatio || '16:9',
          finalPrompt,
        },
      };
    } catch (err: any) {
      this.logger.warn(`SceneDirector failed (${err.message}). Using fallback visual director.`);
      const fallbackPrompt = `Cinematic 8k photorealistic shot of ${input.narration}, volumetric lighting, 35mm lens --ar ${input.aspectRatio || '16:9'}`;
      return {
        sceneId: input.sceneId,
        visualTreatment: 'CINEMATIC_BROLL',
        cameraDirection: 'Slow zoom forward',
        motionDirection: 'Smooth motion',
        onScreenText: input.narration.substring(0, 35),
        transition: 'Cut',
        visualPrompt: {
          subject: input.narration,
          environment: 'Cinematic studio',
          action: 'Dynamic motion',
          composition: 'Centered',
          camera: '35mm lens',
          lighting: 'Volumetric',
          mood: 'Engaging',
          visualStyle: 'Photorealistic 8k',
          colorDirection: 'Royal Blue Accent',
          motion: 'Slow forward dolly',
          negativePrompt: 'blurry, distorted',
          aspectRatio: input.aspectRatio || '16:9',
          finalPrompt: fallbackPrompt,
        },
      };
    }
  }
}
