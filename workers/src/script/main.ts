// ============================================================
// Script Worker — Step 2: Write the full video script
// ============================================================
import 'dotenv/config';
import { Job } from 'bullmq';
import { createWorker, prisma, emitJobProgress, enqueueNextStep } from '../shared/worker.base';
import { callTextProvider } from '../shared/ai-helper';
import { CryptoService } from '../shared/crypto-helper';
import { QUEUE_NAMES, PipelineStep } from '@acf/shared';

interface ScriptJobData {
  videoId: string;
  brandId: string;
  metadata: {
    topic: string;
    researchSummary: string;
    suggestedAngles: string[];
    targetDuration: number;
    language: string;
    tone?: string;
  };
}

createWorker(QUEUE_NAMES.SCRIPT, async (job: Job<ScriptJobData>) => {
  const { videoId, brandId, metadata } = job.data;
  const { topic, researchSummary, targetDuration, language, tone } = metadata;

  console.log(`📝 Writing script for: "${topic}" (${videoId})`);
  await emitJobProgress(videoId, PipelineStep.SCRIPT, 10, 'Starting script writing...');

  // Get brand for voice tone
  const brand = await prisma.brand.findUnique({ where: { id: brandId } });
  const voiceTone = brand?.voiceTone || tone || 'Professional and engaging';

  // Get script prompt
  const promptTemplate = await prisma.prompt.findFirst({
    where: { category: 'script', isActive: true, OR: [{ brandId }, { isGlobal: true }] },
  });

  // Get AI provider
  const provider = await prisma.provider.findFirst({
    where: { enabled: true, apiKeys: { some: { isActive: true } } },
    include: { apiKeys: { where: { isActive: true }, take: 1 } },
  });

  let scriptContent: any = null;
  let rawText = '';

  if (provider && provider.apiKeys.length > 0) {
    const activeKey = provider.apiKeys[0];
    const apiKey = CryptoService.decrypt(activeKey.encryptedKey);
    const customBaseURL = activeKey.platform || provider.baseUrl || undefined;
    
    const systemPrompt = `You are an expert YouTube scriptwriter. Always return valid JSON.`;
    
    let promptText = promptTemplate?.template || `Write a comprehensive ${targetDuration}-minute YouTube script about: "${topic}"

Research context: ${researchSummary.substring(0, 2000)}
Brand voice: ${voiceTone}
Language: ${language}

Return ONLY valid JSON in this exact structure:
{
  "title": "Compelling YouTube title (max 60 chars)",
  "hook": "First 30 seconds - attention-grabbing opening",
  "sections": [
    {
      "id": "s1",
      "heading": "Section title",
      "content": "Full spoken content for this section",
      "durationSeconds": 120,
      "imagePrompt": "Detailed prompt for AI image generation",
      "voiceNote": "Tone/emphasis note for TTS"
    }
  ],
  "callToAction": "Subscribe, comment, like - specific CTA",
  "totalDuration": ${targetDuration * 60},
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

    await emitJobProgress(videoId, PipelineStep.SCRIPT, 30, `Writing with ${provider.displayName}...`);

    const response = await callTextProvider(provider.name, apiKey, promptText, systemPrompt, undefined, customBaseURL);
    rawText = response;

    try {
      const cleaned = response.replace(/```json\n?|\n?```/g, '').trim();
      scriptContent = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, build a basic structure
      scriptContent = {
        title: topic,
        hook: `Today we're going to explore ${topic}...`,
        sections: [{ id: 's1', heading: 'Main Content', content: rawText, durationSeconds: targetDuration * 60, imagePrompt: topic }],
        callToAction: 'Like and subscribe for more content!',
        totalDuration: targetDuration * 60,
        keywords: [topic],
      };
    }
  } else {
    scriptContent = {
      title: topic,
      hook: `Welcome to today's video about ${topic}`,
      sections: [{ id: 's1', heading: 'Introduction', content: `This video covers ${topic} in detail.`, durationSeconds: 60, imagePrompt: topic }],
      callToAction: 'Like and subscribe!',
      totalDuration: 60,
      keywords: [topic],
    };
    rawText = scriptContent.sections[0].content;
  }

  await emitJobProgress(videoId, PipelineStep.SCRIPT, 80, 'Script written, saving...');

  // Save script to DB
  await prisma.script.upsert({
    where: { videoId },
    update: { content: scriptContent, rawText, version: { increment: 1 } },
    create: { videoId, content: scriptContent, rawText, wordCount: rawText.split(' ').length },
  });

  // Update video title from script
  await prisma.video.update({
    where: { id: videoId },
    data: { title: scriptContent.title || topic, pipelineStep: PipelineStep.FACT_CHECK },
  });

  await prisma.job.updateMany({
    where: { videoId, queue: QUEUE_NAMES.SCRIPT },
    data: { status: 'COMPLETED', progress: 100 },
  });

  await emitJobProgress(videoId, PipelineStep.SCRIPT, 100, 'Script complete! Running fact check...');

  // Chain to fact check → SEO → storyboard → voice (in parallel flow)
  await enqueueNextStep(QUEUE_NAMES.FACT_CHECK, videoId, brandId, 'fact-check', {
    scriptContent,
    topic,
    runFullPipeline: true,
  });

  await prisma.job.create({
    data: { queue: QUEUE_NAMES.FACT_CHECK, videoId, payload: { topic } },
  });

  return { success: true, title: scriptContent.title };
});
