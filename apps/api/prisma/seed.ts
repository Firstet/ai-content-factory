// ============================================================
// Prisma Seed — Creates super admin, default providers & prompts
// ============================================================
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Super Admin ───────────────────────────────────────────
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@aicontentfactory.local';
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe!2024';

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Super Admin',
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
    });
    console.log(`✅ Super Admin created: ${adminEmail}`);
  } else {
    console.log(`ℹ️  Super Admin already exists: ${adminEmail}`);
  }

  // ─── Default AI Providers ──────────────────────────────────
  const providers = [
    {
      name: 'OPENAI',
      displayName: 'OpenAI',
      enabled: false,
      capabilities: ['TEXT', 'IMAGE', 'SPEECH', 'EMBEDDINGS'],
      preferredFor: ['TEXT', 'IMAGE'],
      modelConfig: {
        textModel: 'gpt-4o',
        imageModel: 'dall-e-3',
        speechModel: 'tts-1-hd',
        embeddingModel: 'text-embedding-3-small',
      },
    },
    {
      name: 'GEMINI',
      displayName: 'Google Gemini',
      enabled: false,
      capabilities: ['TEXT', 'IMAGE', 'EMBEDDINGS'],
      preferredFor: [],
      modelConfig: {
        textModel: 'gemini-1.5-pro',
        imageModel: 'imagen-3.0-generate-001',
        embeddingModel: 'text-embedding-004',
      },
    },
    {
      name: 'ANTHROPIC',
      displayName: 'Anthropic Claude',
      enabled: false,
      capabilities: ['TEXT'],
      preferredFor: [],
      modelConfig: {
        textModel: 'claude-3-5-sonnet-20241022',
      },
    },
    {
      name: 'OPENROUTER',
      displayName: 'OpenRouter',
      enabled: false,
      capabilities: ['TEXT', 'IMAGE'],
      preferredFor: [],
      modelConfig: {
        textModel: 'meta-llama/llama-3.1-70b-instruct',
      },
    },
    {
      name: 'NVIDIA',
      displayName: 'NVIDIA NIM',
      enabled: false,
      capabilities: ['TEXT', 'IMAGE', 'EMBEDDINGS'],
      preferredFor: [],
      modelConfig: {
        textModel: 'meta/llama-3.1-70b-instruct',
        baseUrl: 'https://integrate.api.nvidia.com/v1',
      },
    },
    {
      name: 'OLLAMA',
      displayName: 'Ollama (Self-hosted)',
      enabled: false,
      capabilities: ['TEXT', 'EMBEDDINGS'],
      preferredFor: [],
      baseUrl: 'http://host.docker.internal:11434',
      modelConfig: {
        textModel: 'llama3.1',
        embeddingModel: 'nomic-embed-text',
      },
    },
  ];

  for (const provider of providers) {
    await prisma.provider.upsert({
      where: { name: provider.name },
      update: {},
      create: provider,
    });
  }
  console.log('✅ AI Providers seeded');

  // ─── Default Prompts ───────────────────────────────────────
  const defaultPrompts = [
    {
      name: 'Research Query Generator',
      category: 'research',
      template: `You are a YouTube content researcher. Generate 10 highly engaging research queries for the topic: "{{topic}}".
Brand voice: {{brandVoice}}
Target audience: {{audience}}
Format: JSON array of query strings.`,
      variables: ['topic', 'brandVoice', 'audience'],
      isGlobal: true,
    },
    {
      name: 'YouTube Script Writer',
      category: 'script',
      template: `You are an expert YouTube scriptwriter. Write a complete script for a {{duration}}-minute video.
Topic: {{topic}}
Brand voice: {{brandVoice}}
Key points from research: {{researchSummary}}

Structure the script with:
1. A powerful hook (first 30 seconds)
2. Main content sections with clear transitions
3. A strong call-to-action

Return as JSON matching the ScriptContent schema.`,
      variables: ['topic', 'brandVoice', 'duration', 'researchSummary'],
      isGlobal: true,
    },
    {
      name: 'SEO Optimizer',
      category: 'seo',
      template: `Optimize this YouTube video for maximum discoverability.
Title draft: {{title}}
Script summary: {{scriptSummary}}
Target keywords: {{keywords}}

Generate:
1. Optimized title (max 60 chars)
2. SEO description (first 150 chars most important)
3. 30 relevant tags
4. 5 hashtags
Return as JSON.`,
      variables: ['title', 'scriptSummary', 'keywords'],
      isGlobal: true,
    },
    {
      name: 'Image Scene Generator',
      category: 'image',
      template: `Generate a detailed, vivid image prompt for an AI image generator.
Scene context: {{sceneContext}}
Brand style: {{brandStyle}}
Mood: {{mood}}
Technical: 16:9 aspect ratio, photorealistic, high detail, cinematic lighting.`,
      variables: ['sceneContext', 'brandStyle', 'mood'],
      isGlobal: true,
    },
    {
      name: 'Thumbnail Copy Generator',
      category: 'thumbnail',
      template: `Create compelling thumbnail text for a YouTube video.
Video title: {{title}}
Main hook: {{hook}}
Emotion target: {{emotion}}

Generate 5 thumbnail text options. Each max 4 words. Bold, clickable.
Return as JSON array.`,
      variables: ['title', 'hook', 'emotion'],
      isGlobal: true,
    },
    {
      name: 'YouTube Shorts Script',
      category: 'shorts',
      template: `Convert this long-form video into a viral YouTube Short.
Original title: {{title}}
Script summary: {{scriptSummary}}

Create a 60-second vertical short with:
1. Instant hook (first 3 seconds)
2. Core value delivery
3. Cliffhanger ending
4. 5 viral hashtags
Return as JSON.`,
      variables: ['title', 'scriptSummary'],
      isGlobal: true,
    },
    {
      name: 'Fact Checker',
      category: 'fact-check',
      template: `Review the following YouTube script for factual accuracy.
Script: {{scriptContent}}

For each claim:
1. Rate confidence (high/medium/low/unverifiable)
2. Flag any potentially incorrect statements
3. Suggest corrections where needed

Return as JSON with an overall accuracy score.`,
      variables: ['scriptContent'],
      isGlobal: true,
    },
  ];

  for (const prompt of defaultPrompts) {
    const existing = await prisma.prompt.findFirst({
      where: { name: prompt.name, isGlobal: true },
    });
    if (!existing) {
      await prisma.prompt.create({ data: prompt });
    }
  }
  console.log('✅ Default prompts seeded');

  console.log('🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
