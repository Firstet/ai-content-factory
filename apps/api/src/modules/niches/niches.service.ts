import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderRouterService } from '../providers/provider-registry.service';

export const PREDEFINED_NICHES = [
  { name: 'AI & Technology', slug: 'ai-technology', category: 'Technology', description: 'AI tools, future tech, automation, robotics, software development' },
  { name: 'Business & Entrepreneurship', slug: 'business-entrepreneurship', category: 'Business', description: 'Startups, scaling, leadership, growth strategy, productivity' },
  { name: 'Finance & Wealth', slug: 'finance-wealth', category: 'Finance', description: 'Personal finance, investing, crypto, real estate, passive income' },
  { name: 'Marketing & Sales', slug: 'marketing-sales', category: 'Marketing', description: 'Digital marketing, social media growth, SEO, brand strategy, sales funnels' },
  { name: 'Personal Development', slug: 'personal-development', category: 'Self Improvement', description: 'Mindset, habits, goal setting, time management, psychology' },
  { name: 'Fitness & Health', slug: 'fitness-health', category: 'Health', description: 'Workouts, nutrition, biohacking, mental health, wellness' },
  { name: 'Education & Learning', slug: 'education-learning', category: 'Education', description: 'Study tips, online courses, career advice, skill building' },
  { name: 'Real Estate', slug: 'real-estate', category: 'Business', description: 'Property investing, home buying tips, market analysis, interior design' },
  { name: 'Travel & Lifestyle', slug: 'travel-lifestyle', category: 'Lifestyle', description: 'Digital nomad, travel guides, luxury lifestyle, culture, food' },
  { name: 'Gaming & Esports', slug: 'gaming-esports', category: 'Entertainment', description: 'Game reviews, streaming tips, hardware guides, esports news' },
];

@Injectable()
export class NichesService {
  private readonly logger = new Logger(NichesService.name);

  constructor(
    private prisma: PrismaService,
    private router: ProviderRouterService,
  ) {}

  async seedPredefinedNiches() {
    for (const n of PREDEFINED_NICHES) {
      await this.prisma.niche.upsert({
        where: { slug: n.slug },
        update: {},
        create: {
          name: n.name,
          slug: n.slug,
          category: n.category,
          description: n.description,
          isCustom: false,
        },
      });
    }
  }

  async findAll() {
    await this.seedPredefinedNiches();
    return this.prisma.niche.findMany({
      include: { intelligence: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(idOrSlug: string) {
    return this.prisma.niche.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: { intelligence: true },
    });
  }

  async createCustomNiche(name: string, description?: string, category: string = 'Custom') {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.niche.create({
      data: {
        name,
        slug,
        description,
        category,
        isCustom: true,
      },
    });
  }

  /**
   * Generates or refreshes deep NicheIntelligence using AI Provider Router.
   */
  async refreshNicheIntelligence(nicheId: string) {
    const niche = await this.prisma.niche.findUniqueOrThrow({ where: { id: nicheId } });

    this.logger.log(`Building Niche Intelligence Profile for "${niche.name}"...`);

    const prompt = `Perform comprehensive research for the content niche: "${niche.name}".
Description: ${niche.description || niche.name}

Return JSON with:
{
  "audienceDescription": "Deep profile of the core target audience",
  "demographics": { "ageRange": "18-35", "primaryLocation": "Global", "genderRatio": "Balanced" },
  "interests": ["interest 1", "interest 2", "interest 3"],
  "painPoints": ["pain point 1", "pain point 2", "pain point 3"],
  "searchIntent": ["search query 1", "search query 2"],
  "keywordOpportunities": ["keyword 1", "keyword 2", "keyword 3"],
  "commonQuestions": ["question 1?", "question 2?"],
  "contentGaps": ["gap 1", "gap 2"],
  "evergreenTopics": ["evergreen topic 1", "evergreen topic 2"],
  "trendingTopics": ["trending topic 1", "trending topic 2"],
  "monetizationOpportunities": ["monetization strategy 1", "strategy 2"]
}`;

    let intelData: any = {};
    try {
      intelData = await this.router.generateStructuredText(prompt, 'You are a senior niche intelligence market researcher.', 'research');
    } catch (e: any) {
      this.logger.warn(`AI Niche Intelligence generation fallback: ${e.message}`);
      intelData = {
        audienceDescription: `Enthusiasts and professionals interested in ${niche.name}.`,
        demographics: { ageRange: '18-45', primaryLocation: 'Global' },
        interests: [niche.name, 'Industry News', 'Best Practices'],
        painPoints: ['Finding reliable information', 'Staying updated'],
        searchIntent: [`How to get started in ${niche.name}`, `Best tools for ${niche.name}`],
        keywordOpportunities: [niche.name, `${niche.name} guide`, `${niche.name} tips`],
        commonQuestions: [`What is the future of ${niche.name}?`],
        contentGaps: [`Advanced breakdown of ${niche.name}`],
        evergreenTopics: [`Complete beginner guide to ${niche.name}`],
        trendingTopics: [`Latest trends in ${niche.name}`],
        monetizationOpportunities: ['Digital Products', 'Sponsorships', 'Consulting'],
      };
    }

    return this.prisma.nicheIntelligence.upsert({
      where: { nicheId: niche.id },
      update: {
        audienceDescription: intelData.audienceDescription,
        demographics: intelData.demographics || {},
        interests: intelData.interests || [],
        painPoints: intelData.painPoints || [],
        searchIntent: intelData.searchIntent || [],
        keywordOpportunities: intelData.keywordOpportunities || [],
        commonQuestions: intelData.commonQuestions || [],
        contentGaps: intelData.contentGaps || [],
        evergreenTopics: intelData.evergreenTopics || [],
        trendingTopics: intelData.trendingTopics || [],
        monetizationOpportunities: intelData.monetizationOpportunities || [],
        lastResearchedAt: new Date(),
      },
      create: {
        nicheId: niche.id,
        audienceDescription: intelData.audienceDescription,
        demographics: intelData.demographics || {},
        interests: intelData.interests || [],
        painPoints: intelData.painPoints || [],
        searchIntent: intelData.searchIntent || [],
        keywordOpportunities: intelData.keywordOpportunities || [],
        commonQuestions: intelData.commonQuestions || [],
        contentGaps: intelData.contentGaps || [],
        evergreenTopics: intelData.evergreenTopics || [],
        trendingTopics: intelData.trendingTopics || [],
        monetizationOpportunities: intelData.monetizationOpportunities || [],
      },
    });
  }
}
