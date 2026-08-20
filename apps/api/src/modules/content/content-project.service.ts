import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderRouterService } from '../providers/provider-registry.service';
import { PlatformAdaptationService } from './platform-adaptation.service';
import { ContentQAService } from './content-qa.service';

export interface CreateProjectDto {
  title: string;
  brandId: string;
  nicheId?: string;
  goal?: string; // ENGAGEMENT, GROWTH, LEAD_GEN, SALES
  platforms?: string[];
  formats?: string[];
  periodDays?: number;
  aspectRatio?: string; // 16:9, 9:16, 1:1
  captionStyle?: string; // HORMOZI_YELLOW, NEON_CYBERPUNK, MINIMALIST_DARK, BOLD_WHITE
  captionPosition?: string; // BOTTOM, MIDDLE, TOP
}

@Injectable()
export class ContentProjectService {
  private readonly logger = new Logger(ContentProjectService.name);

  constructor(
    private prisma: PrismaService,
    private router: ProviderRouterService,
    private adaptation: PlatformAdaptationService,
    private qa: ContentQAService,
  ) {}

  async create(dto: CreateProjectDto) {
    let brandId = dto.brandId;
    let brand = brandId ? await this.prisma.brand.findUnique({ where: { id: brandId } }) : null;

    if (!brand) {
      const firstBrand = await this.prisma.brand.findFirst();
      if (firstBrand) {
        brand = firstBrand;
        brandId = firstBrand.id;
      } else {
        brand = await this.prisma.brand.create({
          data: {
            name: 'AI Content Studio Main',
            slug: `ai-studio-main-${Date.now()}`,
            voiceTone: 'Professional, Engaging, and Insightful',
            niche: 'Technology & Business',
            aspectRatio: dto.aspectRatio || '16:9',
            captionStyle: dto.captionStyle || 'HORMOZI_YELLOW',
            captionPosition: dto.captionPosition || 'BOTTOM',
          },
        });
        brandId = brand.id;
      }
    }

    const niche = dto.nicheId ? await this.prisma.niche.findUnique({ where: { id: dto.nicheId } }) : null;

    const project = await this.prisma.contentProject.create({
      data: {
        title: dto.title,
        brandId: brandId,
        nicheId: dto.nicheId,
        goal: dto.goal || 'ENGAGEMENT',
        platforms: dto.platforms || ['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN'],
        formats: dto.formats || ['VIDEO', 'CAROUSEL', 'FLYER'],
        periodDays: dto.periodDays || 7,
        aspectRatio: dto.aspectRatio || brand?.aspectRatio || '16:9',
        captionStyle: dto.captionStyle || brand?.captionStyle || 'HORMOZI_YELLOW',
        captionPosition: dto.captionPosition || brand?.captionPosition || 'BOTTOM',
        status: 'DRAFT',
      },
    });

    return project;
  }

  async findAll() {
    return this.prisma.contentProject.findMany({
      include: {
        brand: true,
        niche: { include: { intelligence: true } },
        outputs: { include: { scenes: true, slides: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.contentProject.findUnique({
      where: { id },
      include: {
        brand: true,
        niche: { include: { intelligence: true } },
        outputs: { include: { scenes: true, slides: true } },
        usage: true,
      },
    });
    if (!project) throw new NotFoundException(`Content project ${id} not found`);
    return project;
  }

  /**
   * Main Pipeline Orchestrator:
   * 1. Generate Master Content Narrative
   * 2. Adapt into platform outputs (YouTube, Instagram Carousel, TikTok, LinkedIn, Flyer)
   * 3. Run QA evaluation
   */
  async generateCampaign(projectId: string) {
    const project = await this.findOne(projectId);
    this.logger.log(`Starting Multi-Platform Content Generation for Project: "${project.title}" (${project.id})...`);

    await this.prisma.contentProject.update({
      where: { id: projectId },
      data: { status: 'GENERATING' },
    });

    try {
      // 1. Generate Master Narrative
      const masterPrompt = `Create a Master Content Narrative & Strategy for campaign: "${project.title}".
Brand Name: ${project.brand.name}
Brand Voice: ${project.brand.voiceTone || 'Professional and engaging'}
Niche: ${project.niche?.name || 'Technology & Business'}
Goal: ${project.goal}

Return JSON with:
{
  "title": "${project.title}",
  "thesis": "Core campaign thesis statement (1 sentence)",
  "angle": "Unique perspective or story hook",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "factsAndStats": ["Fact 1", "Fact 2"],
  "weeklyCalendar": [
    { "day": 1, "platform": "YOUTUBE", "format": "LONG_VIDEO", "topic": "Core Topic", "hook": "Attention hook", "cta": "Subscribe" },
    { "day": 2, "platform": "INSTAGRAM", "format": "CAROUSEL", "topic": "Key Takeaway", "hook": "Visual hook", "cta": "Save post" }
  ],
  "cta": "Primary call to action text"
}`;

      const masterNarrative = await this.router.generateStructuredText<any>(masterPrompt, 'You are a Chief Content Officer & Brand Strategist.', 'content_strategy');

      await this.prisma.contentProject.update({
        where: { id: projectId },
        data: { masterNarrative },
      });

      const masterInput = {
        title: project.title,
        thesis: masterNarrative.thesis || project.title,
        angle: masterNarrative.angle || 'Deep dive insights',
        keyPoints: masterNarrative.keyPoints || [project.title],
        factsAndStats: masterNarrative.factsAndStats || [],
        cta: masterNarrative.cta || 'Follow for more insights',
        brandContext: project.brand,
      };

      // 2. Adapt into Platform Outputs
      const platforms = project.platforms || ['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN'];

      for (const platform of platforms) {
        if (platform === 'YOUTUBE') {
          const ytData = await this.adaptation.adaptToYouTube(masterInput);
          const qaResult = await this.qa.evaluateOutput('YOUTUBE', ytData, project.brand.voiceTone);

          const output = await this.prisma.contentOutput.create({
            data: {
              projectId,
              platform: 'YOUTUBE',
              format: 'LONG_VIDEO',
              title: ytData.title || project.title,
              adaptedContent: ytData,
              qaPassed: qaResult.passed,
              qaReport: qaResult as any,
            },
          });

          // Create Scene Timelines
          if (ytData.sections) {
            for (let i = 0; i < ytData.sections.length; i++) {
              const sec = ytData.sections[i];
              await this.prisma.sceneTimeline.create({
                data: {
                  outputId: output.id,
                  sceneIndex: i + 1,
                  durationSeconds: sec.durationSeconds || 120,
                  narrationText: sec.content || '',
                  visualType: sec.visualType || 'AI_IMAGE',
                  visualGoal: sec.heading || `Scene ${i + 1}`,
                  visualPrompt: sec.visualPrompt || `Cinematic visual scene for: ${sec.heading}`,
                  onScreenText: sec.onScreenText || '',
                },
              });
            }
          }
        }

        if (platform === 'INSTAGRAM') {
          const igData = await this.adaptation.adaptToInstagramCarousel(masterInput);
          const qaResult = await this.qa.evaluateOutput('CAROUSEL', igData, project.brand.voiceTone);

          const output = await this.prisma.contentOutput.create({
            data: {
              projectId,
              platform: 'INSTAGRAM',
              format: 'CAROUSEL',
              title: igData.title || project.title,
              adaptedContent: igData,
              qaPassed: qaResult.passed,
              qaReport: qaResult as any,
            },
          });

          // Create Carousel Slides
          if (igData.slides) {
            for (const s of igData.slides) {
              await this.prisma.carouselSlide.create({
                data: {
                  outputId: output.id,
                  slideIndex: s.slideIndex || 1,
                  headline: s.headline || 'Slide',
                  bodyText: s.bodyText || '',
                  visualPrompt: s.visualPrompt || `Minimalist design background for: ${s.headline}`,
                  designDirection: s.designDirection || 'Clean card layout',
                },
              });
            }
          }
        }

        if (platform === 'TIKTOK' || platform === 'SHORTS') {
          const tkData = await this.adaptation.adaptToTikTok(masterInput);
          const qaResult = await this.qa.evaluateOutput('SHORT', tkData, project.brand.voiceTone);

          await this.prisma.contentOutput.create({
            data: {
              projectId,
              platform,
              format: 'SHORT_VIDEO',
              title: tkData.title || project.title,
              adaptedContent: tkData,
              qaPassed: qaResult.passed,
              qaReport: qaResult as any,
            },
          });
        }

        if (platform === 'LINKEDIN' || platform === 'FACEBOOK') {
          const liData = await this.adaptation.adaptToLinkedIn(masterInput);
          const qaResult = await this.qa.evaluateOutput('POST', liData, project.brand.voiceTone);

          await this.prisma.contentOutput.create({
            data: {
              projectId,
              platform,
              format: 'ARTICLE_POST',
              title: liData.title || project.title,
              adaptedContent: liData,
              qaPassed: qaResult.passed,
              qaReport: qaResult as any,
            },
          });
        }

        if (platform === 'FLYER' || project.formats.includes('FLYER')) {
          const flyerData = await this.adaptation.adaptToFlyer(masterInput);
          const qaResult = await this.qa.evaluateOutput('FLYER', flyerData, project.brand.voiceTone);

          await this.prisma.contentOutput.create({
            data: {
              projectId,
              platform: 'FLYER',
              format: 'PROMOTIONAL_FLYER',
              title: flyerData.headline || project.title,
              adaptedContent: flyerData,
              qaPassed: qaResult.passed,
              qaReport: qaResult as any,
            },
          });
        }
      }

      await this.prisma.contentProject.update({
        where: { id: projectId },
        data: { status: 'COMPLETED' },
      });

      return this.findOne(projectId);
    } catch (err: any) {
      this.logger.error(`Campaign generation failed for project ${projectId}: ${err.message}`);
      await this.prisma.contentProject.update({
        where: { id: projectId },
        data: { status: 'FAILED' },
      });
      throw err;
    }
  }

  /**
   * Component-Level Selective Regeneration
   */
  async regenerateSlide(slideId: string, customInstruction?: string) {
    const slide = await this.prisma.carouselSlide.findUniqueOrThrow({ where: { id: slideId }, include: { output: { include: { project: true } } } });

    const prompt = `Regenerate Carousel Slide #${slide.slideIndex} for topic: "${slide.headline}".
Current Body: ${slide.bodyText}
Instruction: ${customInstruction || 'Make it punchier, concise, and highly engaging'}

Return JSON: { "headline": "...", "bodyText": "...", "visualPrompt": "..." }`;

    const updated = await this.router.generateStructuredText<any>(prompt, 'You are a slide designer.', 'copywriting');

    return this.prisma.carouselSlide.update({
      where: { id: slideId },
      data: {
        headline: updated.headline || slide.headline,
        bodyText: updated.bodyText || slide.bodyText,
        visualPrompt: updated.visualPrompt || slide.visualPrompt,
        version: { increment: 1 },
      },
    });
  }

  async regenerateScene(sceneId: string, customInstruction?: string) {
    const scene = await this.prisma.sceneTimeline.findUniqueOrThrow({ where: { id: sceneId } });

    const prompt = `Regenerate Video Scene #${scene.sceneIndex} visual prompt and narration line.
Current Narration: ${scene.narrationText}
Current Visual Prompt: ${scene.visualPrompt}
Instruction: ${customInstruction || 'Improve visual dynamism and clarity'}

Return JSON: { "narrationText": "...", "visualPrompt": "...", "onScreenText": "..." }`;

    const updated = await this.router.generateStructuredText<any>(prompt, 'You are a video director.', 'scriptwriting');

    return this.prisma.sceneTimeline.update({
      where: { id: sceneId },
      data: {
        narrationText: updated.narrationText || scene.narrationText,
        visualPrompt: updated.visualPrompt || scene.visualPrompt,
        onScreenText: updated.onScreenText || scene.onScreenText,
        version: { increment: 1 },
      },
    });
  }
}
