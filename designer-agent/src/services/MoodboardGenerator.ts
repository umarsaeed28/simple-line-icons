import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import sharp from 'sharp';
import { Logger } from '../utils/Logger';
import axios from 'axios';

interface InspirationSpec {
  id: string;
  name: string;
  style_tags: string[];
  palette: string[];
  forms: string[];
  motifs: string[];
  materials: string[];
  mood: string;
}

export class MoodboardGenerator {
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async generateMoodboard(spec: InspirationSpec): Promise<string> {
    this.logger.info('Generating moodboard', { id: spec.id, name: spec.name });

    try {
      // Create canvas
      const canvas = createCanvas(1200, 800);
      const ctx = canvas.getContext('2d');

      // Set background
      ctx.fillStyle = spec.palette[0] || '#ffffff';
      ctx.fillRect(0, 0, 1200, 800);

      // Add title
      await this.addTitle(ctx, spec.name, spec.palette);

      // Add color palette
      await this.addColorPalette(ctx, spec.palette);

      // Add mood and style text
      await this.addTextElements(ctx, spec);

      // Add decorative elements based on forms
      await this.addDecorativeElements(ctx, spec);

      // Convert to buffer
      const buffer = canvas.toBuffer('image/png');

      // Optimize with sharp
      const optimizedBuffer = await sharp(buffer)
        .png({ quality: 90 })
        .toBuffer();

      // In a real implementation, this would upload to S3/storage
      const url = await this.uploadToStorage(optimizedBuffer, spec.id);

      this.logger.info('Moodboard generated successfully', { id: spec.id, url });
      return url;

    } catch (error) {
      this.logger.error('Failed to generate moodboard', { id: spec.id, error });
      throw new Error('Moodboard generation failed');
    }
  }

  private async addTitle(ctx: CanvasRenderingContext2D, title: string, palette: string[]) {
    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = palette[4] || '#333333';
    ctx.textAlign = 'center';
    ctx.fillText(title, 600, 80);

    // Add subtitle line
    ctx.strokeStyle = palette[2] || '#cccccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(400, 100);
    ctx.lineTo(800, 100);
    ctx.stroke();
  }

  private async addColorPalette(ctx: CanvasRenderingContext2D, palette: string[]) {
    const swatchSize = 80;
    const spacing = 20;
    const startX = 150;
    const startY = 150;

    palette.forEach((color, index) => {
      const x = startX + (index * (swatchSize + spacing));
      const y = startY;

      // Draw color swatch
      ctx.fillStyle = color;
      ctx.fillRect(x, y, swatchSize, swatchSize);

      // Add border
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, swatchSize, swatchSize);

      // Add color code
      ctx.font = '12px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.fillText(color.toUpperCase(), x + swatchSize/2, y + swatchSize + 20);
    });
  }

  private async addTextElements(ctx: CanvasRenderingContext2D, spec: InspirationSpec) {
    const textColor = spec.palette[4] || '#333333';
    
    // Style tags
    ctx.font = '24px Arial';
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.fillText('Style:', 150, 350);
    
    ctx.font = '20px Arial';
    const styleText = spec.style_tags.join(' • ');
    ctx.fillText(styleText, 150, 380);

    // Materials
    ctx.font = '24px Arial';
    ctx.fillText('Materials:', 150, 450);
    
    ctx.font = '20px Arial';
    const materialText = spec.materials.join(' • ');
    ctx.fillText(materialText, 150, 480);

    // Mood
    ctx.font = '24px Arial';
    ctx.fillText('Mood:', 150, 550);
    
    ctx.font = '20px Arial';
    ctx.fillText(spec.mood.charAt(0).toUpperCase() + spec.mood.slice(1), 150, 580);

    // Forms
    if (spec.forms.length > 0) {
      ctx.font = '24px Arial';
      ctx.fillText('Forms:', 150, 650);
      
      ctx.font = '20px Arial';
      const formsText = spec.forms.join(' • ');
      ctx.fillText(formsText, 150, 680);
    }
  }

  private async addDecorativeElements(ctx: CanvasRenderingContext2D, spec: InspirationSpec) {
    const decorColor = spec.palette[2] || '#cccccc';
    ctx.strokeStyle = decorColor;
    ctx.fillStyle = decorColor;

    // Add geometric shapes based on forms
    if (spec.forms.includes('geometric')) {
      this.drawGeometricShapes(ctx, decorColor);
    }

    if (spec.forms.includes('organic')) {
      this.drawOrganicShapes(ctx, decorColor);
    }

    if (spec.forms.includes('curved')) {
      this.drawCurvedElements(ctx, decorColor);
    }
  }

  private drawGeometricShapes(ctx: CanvasRenderingContext2D, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Draw rectangles
    ctx.strokeRect(700, 300, 100, 60);
    ctx.strokeRect(850, 350, 80, 80);

    // Draw triangles
    ctx.beginPath();
    ctx.moveTo(700, 500);
    ctx.lineTo(750, 450);
    ctx.lineTo(800, 500);
    ctx.closePath();
    ctx.stroke();
  }

  private drawOrganicShapes(ctx: CanvasRenderingContext2D, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Draw organic curves
    ctx.beginPath();
    ctx.moveTo(700, 300);
    ctx.bezierCurveTo(750, 280, 800, 320, 850, 300);
    ctx.bezierCurveTo(880, 340, 820, 380, 780, 360);
    ctx.stroke();
  }

  private drawCurvedElements(ctx: CanvasRenderingContext2D, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;

    // Draw curved lines
    ctx.beginPath();
    ctx.arc(750, 400, 50, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(850, 450, 30, 0, Math.PI);
    ctx.stroke();
  }

  private async uploadToStorage(buffer: Buffer, specId: string): Promise<string> {
    // Placeholder for storage upload
    // In a real implementation, this would upload to S3, Supabase Storage, etc.
    
    const filename = `moodboard-${specId}.png`;
    const url = `${process.env.STORAGE_BASE_URL || 'http://localhost:3001/storage'}/${filename}`;
    
    this.logger.info('Moodboard uploaded to storage', { filename, url });
    
    // Simulate storage upload
    return url;
  }

  async generateAdvancedMoodboard(spec: InspirationSpec, referenceImages: string[] = []): Promise<string> {
    this.logger.info('Generating advanced moodboard with references', { 
      id: spec.id, 
      referenceCount: referenceImages.length 
    });

    try {
      const canvas = createCanvas(1600, 1200);
      const ctx = canvas.getContext('2d');

      // Set background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, 1200);
      gradient.addColorStop(0, spec.palette[0] || '#ffffff');
      gradient.addColorStop(1, spec.palette[1] || '#f5f5f5');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1600, 1200);

      // Add enhanced title
      await this.addEnhancedTitle(ctx, spec.name, spec.palette);

      // Add large color palette
      await this.addEnhancedColorPalette(ctx, spec.palette);

      // Load and add reference images if provided
      if (referenceImages.length > 0) {
        await this.addReferenceImages(ctx, referenceImages);
      }

      // Add detailed text information
      await this.addDetailedText(ctx, spec);

      // Add sophisticated decorative elements
      await this.addSophisticatedDecoration(ctx, spec);

      const buffer = canvas.toBuffer('image/png');
      const optimizedBuffer = await sharp(buffer)
        .png({ quality: 95 })
        .toBuffer();

      const url = await this.uploadToStorage(optimizedBuffer, `${spec.id}-advanced`);
      
      return url;

    } catch (error) {
      this.logger.error('Failed to generate advanced moodboard', { id: spec.id, error });
      throw new Error('Advanced moodboard generation failed');
    }
  }

  private async addEnhancedTitle(ctx: CanvasRenderingContext2D, title: string, palette: string[]) {
    // Add background for title
    ctx.fillStyle = palette[1] || '#f5f5f5';
    ctx.fillRect(0, 0, 1600, 120);

    ctx.font = 'bold 64px Arial';
    ctx.fillStyle = palette[4] || '#333333';
    ctx.textAlign = 'center';
    ctx.fillText(title, 800, 75);
  }

  private async addEnhancedColorPalette(ctx: CanvasRenderingContext2D, palette: string[]) {
    const swatchWidth = 150;
    const swatchHeight = 100;
    const spacing = 20;
    const startX = 200;
    const startY = 150;

    palette.forEach((color, index) => {
      const x = startX + (index * (swatchWidth + spacing));
      const y = startY;

      // Draw color swatch with shadow
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 3;
      ctx.shadowOffsetY = 3;

      ctx.fillStyle = color;
      ctx.fillRect(x, y, swatchWidth, swatchHeight);

      // Reset shadow
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Add color information
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#333333';
      ctx.textAlign = 'center';
      ctx.fillText(color.toUpperCase(), x + swatchWidth/2, y + swatchHeight + 25);
    });
  }

  private async addReferenceImages(ctx: CanvasRenderingContext2D, imageUrls: string[]) {
    const imageSize = 200;
    const spacing = 20;
    const startX = 1000;
    const startY = 300;

    for (let i = 0; i < Math.min(imageUrls.length, 4); i++) {
      try {
        const response = await axios.get(imageUrls[i], { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);
        const image = await loadImage(buffer);

        const x = startX + (i % 2) * (imageSize + spacing);
        const y = startY + Math.floor(i / 2) * (imageSize + spacing);

        ctx.drawImage(image, x, y, imageSize, imageSize);

        // Add border
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, imageSize, imageSize);

      } catch (error) {
        this.logger.error('Failed to load reference image', { url: imageUrls[i], error });
      }
    }
  }

  private async addDetailedText(ctx: CanvasRenderingContext2D, spec: InspirationSpec) {
    const textColor = spec.palette[4] || '#333333';
    const startX = 50;
    let currentY = 350;

    ctx.textAlign = 'left';

    // Style tags
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = textColor;
    ctx.fillText('Design Style', startX, currentY);
    currentY += 40;

    ctx.font = '22px Arial';
    spec.style_tags.forEach(tag => {
      ctx.fillText(`• ${tag}`, startX + 20, currentY);
      currentY += 30;
    });

    currentY += 20;

    // Materials
    ctx.font = 'bold 28px Arial';
    ctx.fillText('Materials & Textures', startX, currentY);
    currentY += 40;

    ctx.font = '22px Arial';
    spec.materials.forEach(material => {
      ctx.fillText(`• ${material}`, startX + 20, currentY);
      currentY += 30;
    });

    currentY += 20;

    // Motifs
    if (spec.motifs.length > 0) {
      ctx.font = 'bold 28px Arial';
      ctx.fillText('Design Motifs', startX, currentY);
      currentY += 40;

      ctx.font = '22px Arial';
      spec.motifs.forEach(motif => {
        ctx.fillText(`• ${motif}`, startX + 20, currentY);
        currentY += 30;
      });
    }
  }

  private async addSophisticatedDecoration(ctx: CanvasRenderingContext2D, spec: InspirationSpec) {
    const decorColor = spec.palette[2] || '#cccccc';
    const accentColor = spec.palette[3] || '#999999';

    // Add background pattern based on mood
    if (spec.mood === 'luxurious') {
      this.drawLuxuriousPattern(ctx, decorColor);
    } else if (spec.mood === 'minimalist') {
      this.drawMinimalistPattern(ctx, decorColor);
    } else {
      this.drawDefaultPattern(ctx, decorColor);
    }

    // Add corner decorations
    this.drawCornerDecorations(ctx, accentColor);
  }

  private drawLuxuriousPattern(ctx: CanvasRenderingContext2D, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.1;

    // Draw diamond pattern
    for (let x = 0; x < 1600; x += 100) {
      for (let y = 0; y < 1200; y += 100) {
        ctx.beginPath();
        ctx.moveTo(x + 50, y);
        ctx.lineTo(x + 100, y + 50);
        ctx.lineTo(x + 50, y + 100);
        ctx.lineTo(x, y + 50);
        ctx.closePath();
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }

  private drawMinimalistPattern(ctx: CanvasRenderingContext2D, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.05;

    // Draw subtle grid
    for (let x = 0; x < 1600; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 1200);
      ctx.stroke();
    }

    for (let y = 0; y < 1200; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1600, y);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  private drawDefaultPattern(ctx: CanvasRenderingContext2D, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.1;

    // Draw flowing curves
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(0, 100 + i * 100);
      ctx.bezierCurveTo(400, 50 + i * 100, 800, 150 + i * 100, 1600, 100 + i * 100);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  }

  private drawCornerDecorations(ctx: CanvasRenderingContext2D, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(20, 50);
    ctx.lineTo(50, 20);
    ctx.moveTo(20, 80);
    ctx.lineTo(80, 20);
    ctx.stroke();

    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(1580, 50);
    ctx.lineTo(1550, 20);
    ctx.moveTo(1580, 80);
    ctx.lineTo(1520, 20);
    ctx.stroke();

    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(20, 1150);
    ctx.lineTo(50, 1180);
    ctx.moveTo(20, 1120);
    ctx.lineTo(80, 1180);
    ctx.stroke();

    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(1580, 1150);
    ctx.lineTo(1550, 1180);
    ctx.moveTo(1580, 1120);
    ctx.lineTo(1520, 1180);
    ctx.stroke();
  }
}