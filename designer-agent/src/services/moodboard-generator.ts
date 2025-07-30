import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D } from 'canvas';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../shared/utils/logging';
import { InspirationSpec } from './inspiration-spec-generator';

export class MoodboardGenerator {
  private logger: Logger;
  private canvasWidth = 1200;
  private canvasHeight = 800;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  async generateMoodboard(inspirationSpec: InspirationSpec): Promise<string> {
    this.logger.logOperationStart('generate_moodboard', { specId: inspirationSpec.id });

    try {
      // Create canvas
      const canvas = createCanvas(this.canvasWidth, this.canvasHeight);
      const ctx = canvas.getContext('2d');

      // Fill background with neutral color
      const backgroundColor = inspirationSpec.palette.neutral[0] || '#F5F5F5';
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Draw color palette
      await this.drawColorPalette(ctx, inspirationSpec.palette);

      // Draw style tags
      this.drawStyleTags(ctx, inspirationSpec.style_tags);

      // Draw forms and motifs
      this.drawFormsAndMotifs(ctx, inspirationSpec.forms, inspirationSpec.motifs);

      // Convert canvas to buffer
      const buffer = canvas.toBuffer('image/png');

      // Optimize with sharp
      const optimizedBuffer = await sharp(buffer)
        .png({ quality: 90 })
        .toBuffer();

      // Generate filename
      const filename = `moodboard_${inspirationSpec.id}_${Date.now()}.png`;
      
      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll return a placeholder URL
      const moodboardUrl = `https://storage.example.com/moodboards/${filename}`;

      this.logger.logOperationComplete('generate_moodboard', { moodboardUrl });
      return moodboardUrl;

    } catch (error) {
      this.logger.logOperationError('generate_moodboard', error as Error, { specId: inspirationSpec.id });
      throw error;
    }
  }

  private async drawColorPalette(
    ctx: CanvasRenderingContext2D,
    palette: InspirationSpec['palette']
  ): Promise<void> {
    const paletteX = 50;
    const paletteY = 50;
    const colorSize = 60;
    const spacing = 20;

    // Draw palette title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Color Palette', paletteX, paletteY - 10);

    let currentY = paletteY + 20;

    // Draw each color category
    const categories = [
      { name: 'Primary', colors: palette.primary },
      { name: 'Secondary', colors: palette.secondary },
      { name: 'Accent', colors: palette.accent },
      { name: 'Neutral', colors: palette.neutral },
    ];

    for (const category of categories) {
      // Category label
      ctx.fillStyle = '#666666';
      ctx.font = '16px Arial';
      ctx.fillText(category.name, paletteX, currentY);

      // Color swatches
      let currentX = paletteX + 100;
      for (const color of category.colors) {
        ctx.fillStyle = color;
        ctx.fillRect(currentX, currentY - 15, colorSize, colorSize);
        
        // Border
        ctx.strokeStyle = '#CCCCCC';
        ctx.lineWidth = 1;
        ctx.strokeRect(currentX, currentY - 15, colorSize, colorSize);

        // Color code
        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        ctx.fillText(color, currentX, currentY + colorSize + 15);

        currentX += colorSize + spacing;
      }

      currentY += colorSize + 40;
    }
  }

  private drawStyleTags(
    ctx: CanvasRenderingContext2D,
    styleTags: string[]
  ): void {
    const tagsX = 50;
    const tagsY = 400;

    // Title
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Style Tags', tagsX, tagsY - 10);

    // Draw tags
    let currentX = tagsX;
    let currentY = tagsY + 20;
    const tagHeight = 30;
    const tagPadding = 10;

    for (const tag of styleTags) {
      const tagWidth = ctx.measureText(tag).width + tagPadding * 2;

      // Check if we need to wrap to next line
      if (currentX + tagWidth > this.canvasWidth - 100) {
        currentX = tagsX;
        currentY += tagHeight + 10;
      }

      // Tag background
      ctx.fillStyle = '#E8F4FD';
      ctx.fillRect(currentX, currentY, tagWidth, tagHeight);

      // Tag border
      ctx.strokeStyle = '#B3D9F2';
      ctx.lineWidth = 1;
      ctx.strokeRect(currentX, currentY, tagWidth, tagHeight);

      // Tag text
      ctx.fillStyle = '#2E86AB';
      ctx.font = '14px Arial';
      ctx.fillText(tag, currentX + tagPadding, currentY + 20);

      currentX += tagWidth + 10;
    }
  }

  private drawFormsAndMotifs(
    ctx: CanvasRenderingContext2D,
    forms: string[],
    motifs: string[]
  ): void {
    const rightX = this.canvasWidth - 350;
    const startY = 50;

    // Forms section
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Forms', rightX, startY);

    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    let currentY = startY + 30;
    for (const form of forms) {
      ctx.fillText(`• ${form}`, rightX, currentY);
      currentY += 20;
    }

    // Motifs section
    currentY += 20;
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Motifs', rightX, currentY);

    ctx.fillStyle = '#666666';
    ctx.font = '14px Arial';
    currentY += 30;
    for (const motif of motifs) {
      ctx.fillText(`• ${motif}`, rightX, currentY);
      currentY += 20;
    }
  }

  async uploadToStorage(buffer: Buffer, filename: string): Promise<string> {
    // In a real implementation, this would upload to Supabase Storage
    // For now, return a placeholder URL
    return `https://storage.example.com/moodboards/${filename}`;
  }
}