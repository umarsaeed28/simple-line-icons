import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../shared/utils/logging';

export interface InspirationSpecRequest {
  referenceImageUrl?: string;
  stylePreferences?: string[];
  roomType?: string;
}

export interface InspirationSpec {
  id: string;
  style_tags: string[];
  palette: {
    primary: string[];
    secondary: string[];
    accent: string[];
    neutral: string[];
  };
  forms: string[];
  motifs: string[];
  moodboard_url: string;
  created_at: string;
  trend_sources?: Array<{
    source: string;
    confidence: number;
  }>;
}

export class InspirationSpecGenerator {
  private openai: OpenAI;
  private logger: Logger;

  constructor(logger: Logger) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.logger = logger;
  }

  async generateInspirationSpec(request: InspirationSpecRequest): Promise<InspirationSpec> {
    this.logger.logOperationStart('generate_inspiration_spec', request);

    try {
      const prompt = this.buildPrompt(request);
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert interior designer and color theorist. Generate detailed inspiration specifications for room designs. Always respond with valid JSON that matches the required schema.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      const specData = JSON.parse(content);
      
      // Validate and enhance the specification
      const inspirationSpec: InspirationSpec = {
        id: uuidv4(),
        style_tags: specData.style_tags || ['modern'],
        palette: {
          primary: specData.palette?.primary || ['#2C3E50', '#34495E'],
          secondary: specData.palette?.secondary || ['#7F8C8D', '#95A5A6'],
          accent: specData.palette?.accent || ['#E74C3C'],
          neutral: specData.palette?.neutral || ['#ECF0F1', '#BDC3C7'],
        },
        forms: specData.forms || ['geometric'],
        motifs: specData.motifs || [],
        moodboard_url: '', // Will be set by moodboard generator
        created_at: new Date().toISOString(),
        trend_sources: specData.trend_sources || [
          { source: 'ai_generated', confidence: 0.9 }
        ],
      };

      this.logger.logOperationComplete('generate_inspiration_spec', inspirationSpec);
      return inspirationSpec;

    } catch (error) {
      this.logger.logOperationError('generate_inspiration_spec', error as Error, request);
      throw error;
    }
  }

  private buildPrompt(request: InspirationSpecRequest): string {
    let prompt = 'Generate an interior design inspiration specification in JSON format with the following structure:\n\n';
    prompt += '{\n';
    prompt += '  "style_tags": ["array of style descriptors"],\n';
    prompt += '  "palette": {\n';
    prompt += '    "primary": ["hex color codes"],\n';
    prompt += '    "secondary": ["hex color codes"],\n';
    prompt += '    "accent": ["hex color codes"],\n';
    prompt += '    "neutral": ["hex color codes"]\n';
    prompt += '  },\n';
    prompt += '  "forms": ["array of form descriptors"],\n';
    prompt += '  "motifs": ["array of pattern/motif descriptors"]\n';
    prompt += '}\n\n';

    if (request.referenceImageUrl) {
      prompt += `Reference image: ${request.referenceImageUrl}\n`;
    }

    if (request.stylePreferences && request.stylePreferences.length > 0) {
      prompt += `Style preferences: ${request.stylePreferences.join(', ')}\n`;
    }

    if (request.roomType) {
      prompt += `Room type: ${request.roomType}\n`;
    }

    prompt += '\nConsider current design trends and create a cohesive, modern specification. Use 3-5 colors per palette category and ensure all hex codes are valid.';

    return prompt;
  }

  async generateFromImage(imageUrl: string): Promise<InspirationSpec> {
    this.logger.logOperationStart('generate_from_image', { imageUrl });

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: 'Analyze this interior design image and extract the style, colors, forms, and motifs. Respond with JSON specification.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Generate an inspiration specification from this image. Include style tags, color palette (hex codes), forms, and motifs.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI Vision');
      }

      const specData = JSON.parse(content);
      
      const inspirationSpec: InspirationSpec = {
        id: uuidv4(),
        style_tags: specData.style_tags || ['extracted'],
        palette: {
          primary: specData.palette?.primary || ['#000000'],
          secondary: specData.palette?.secondary || ['#FFFFFF'],
          accent: specData.palette?.accent || ['#FF0000'],
          neutral: specData.palette?.neutral || ['#CCCCCC'],
        },
        forms: specData.forms || ['extracted'],
        motifs: specData.motifs || [],
        moodboard_url: '',
        created_at: new Date().toISOString(),
        trend_sources: [
          { source: 'image_analysis', confidence: 0.8 }
        ],
      };

      this.logger.logOperationComplete('generate_from_image', inspirationSpec);
      return inspirationSpec;

    } catch (error) {
      this.logger.logOperationError('generate_from_image', error as Error, { imageUrl });
      throw error;
    }
  }
}