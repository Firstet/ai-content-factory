import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PromptsService {
  constructor(private prisma: PrismaService) {}

  findAll(category?: string, brandId?: string) {
    return this.prisma.prompt.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
        ...(brandId ? { OR: [{ brandId }, { isGlobal: true }] } : { isGlobal: true }),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  findOne(id: string) {
    return this.prisma.prompt.findUniqueOrThrow({ where: { id } });
  }

  create(data: object) {
    return this.prisma.prompt.create({ data: data as any });
  }

  update(id: string, data: object) {
    return this.prisma.prompt.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.prompt.update({ where: { id }, data: { isActive: false } });
  }

  /**
   * Render a prompt template by replacing {{variable}} placeholders.
   */
  async render(id: string, variables: Record<string, string>): Promise<string> {
    const prompt = await this.findOne(id);
    let rendered = prompt.template;
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{\\s*${key}\\s*}}`, 'g'), value);
    }
    return rendered;
  }
}
