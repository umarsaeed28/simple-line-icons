import OpenAI from 'openai';
import RSSParser from 'rss-parser';
import axios from 'axios';
import { Logger } from '../utils/Logger';
import { v4 as uuidv4 } from 'uuid';

interface TrendSource {
  type: 'rss' | 'instagram' | 'pinterest' | 'trend_report';
  url: string;
  confidence?: number;
}

interface TrendData {
  source: TrendSource;
  content: string;
  images?: string[];
  tags: string[];
  timestamp: Date;
}

interface InspirationInput {
  description?: string;
  style_hints: string[];
  trend_data: TrendData[];
}

interface InspirationSpec {
  id: string;
  name: string;
  style_tags: string[];
  palette: string[];
  forms: string[];
  motifs: string[];
  materials: string[];
  mood: string;
  sources: TrendSource[];
  created_at: string;
  version: string;
}

export class TrendAnalyzer {
  private openai: OpenAI;
  private rssParser: RSSParser;
  private logger: Logger;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.rssParser = new RSSParser();
    this.logger = Logger.getInstance();
  }

  async analyzeTrends(sources: TrendSource[] = []): Promise<TrendData[]> {
    this.logger.info('Analyzing trends', { sources: sources.length });
    
    const defaultSources: TrendSource[] = [
      {
        type: 'rss',
        url: 'https://www.dezeen.com/feed/',
        confidence: 0.8
      },
      {
        type: 'rss',
        url: 'https://www.architecturaldigest.com/feed',
        confidence: 0.9
      },
      {
        type: 'rss',
        url: 'https://www.elledecor.com/feed',
        confidence: 0.8
      }
    ];

    const allSources = [...defaultSources, ...sources];
    const trendData: TrendData[] = [];

    for (const source of allSources) {
      try {
        const data = await this.analyzeTrendSource(source);
        trendData.push(...data);
      } catch (error) {
        this.logger.error('Failed to analyze trend source', { source, error });
      }
    }

    return trendData;
  }

  async generateInspirationSpec(input: InspirationInput): Promise<InspirationSpec> {
    this.logger.info('Generating inspiration spec', { 
      description: input.description,
      style_hints: input.style_hints.length,
      trend_data: input.trend_data.length 
    });

    // Prepare context from trend data
    const trendContext = input.trend_data
      .map(trend => `${trend.source.type}: ${trend.content} (tags: ${trend.tags.join(', ')})`)
      .join('\n');

    const prompt = this.buildInspirationPrompt(input.description, input.style_hints, trendContext);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert interior designer and trend analyst. Generate detailed, creative inspiration specifications based on current trends and user preferences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return this.parseInspirationResponse(response, input);

    } catch (error) {
      this.logger.error('Failed to generate inspiration spec', error);
      
      // Fallback to rule-based generation
      return this.generateFallbackInspiration(input);
    }
  }

  async runFullAnalysis(forceRefresh: boolean = false): Promise<TrendData[]> {
    this.logger.info('Running full trend analysis', { forceRefresh });
    
    // This would typically check cache first unless forceRefresh is true
    const sources: TrendSource[] = [
      { type: 'rss', url: 'https://www.dezeen.com/feed/', confidence: 0.8 },
      { type: 'rss', url: 'https://www.architecturaldigest.com/feed', confidence: 0.9 },
      { type: 'rss', url: 'https://www.elledecor.com/feed', confidence: 0.8 },
      { type: 'rss', url: 'https://www.dwell.com/feed', confidence: 0.7 }
    ];

    const allTrendData: TrendData[] = [];

    for (const source of sources) {
      try {
        const trends = await this.analyzeTrendSource(source);
        allTrendData.push(...trends);
      } catch (error) {
        this.logger.error('Failed to analyze source in full analysis', { source, error });
      }
    }

    // Store results in cache/database
    await this.storeTrendData(allTrendData);

    return allTrendData;
  }

  private async analyzeTrendSource(source: TrendSource): Promise<TrendData[]> {
    switch (source.type) {
      case 'rss':
        return this.analyzeRSSFeed(source);
      case 'instagram':
        return this.analyzeInstagramFeed(source);
      case 'pinterest':
        return this.analyzePinterestFeed(source);
      default:
        this.logger.warn('Unsupported trend source type', { type: source.type });
        return [];
    }
  }

  private async analyzeRSSFeed(source: TrendSource): Promise<TrendData[]> {
    try {
      const feed = await this.rssParser.parseURL(source.url);
      const trendData: TrendData[] = [];

      for (const item of feed.items.slice(0, 10)) { // Limit to recent items
        if (!item.title || !item.contentSnippet) continue;

        const content = `${item.title}\n${item.contentSnippet}`;
        const tags = await this.extractTags(content);

        trendData.push({
          source,
          content: content.substring(0, 500), // Truncate for processing
          tags,
          timestamp: new Date(item.pubDate || Date.now())
        });
      }

      return trendData;

    } catch (error) {
      this.logger.error('Failed to analyze RSS feed', { url: source.url, error });
      return [];
    }
  }

  private async analyzeInstagramFeed(source: TrendSource): Promise<TrendData[]> {
    // Placeholder for Instagram API integration
    this.logger.info('Instagram analysis not yet implemented', { source });
    return [];
  }

  private async analyzePinterestFeed(source: TrendSource): Promise<TrendData[]> {
    // Placeholder for Pinterest API integration
    this.logger.info('Pinterest analysis not yet implemented', { source });
    return [];
  }

  private async extractTags(content: string): Promise<string[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Extract interior design style tags from the given content. Return only relevant design and style keywords as a comma-separated list.'
          },
          {
            role: 'user',
            content: content
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) return [];

      return response
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 2);

    } catch (error) {
      this.logger.error('Failed to extract tags', error);
      return [];
    }
  }

  private buildInspirationPrompt(description?: string, styleHints: string[] = [], trendContext: string = ''): string {
    return `
Generate an interior design inspiration specification based on the following:

User Description: ${description || 'Not provided'}
Style Hints: ${styleHints.join(', ') || 'None'}

Current Trends Context:
${trendContext}

Please respond with a valid JSON object containing:
{
  "name": "A creative name for this style",
  "style_tags": ["array", "of", "style", "keywords"],
  "palette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "forms": ["geometric", "organic", "curved"],
  "motifs": ["pattern", "descriptions"],
  "materials": ["wood", "metal", "fabric"],
  "mood": "one of: cozy, energetic, calm, luxurious, minimalist, eclectic, warm, cool"
}

Ensure the palette contains 3-8 hex color codes, and all arrays contain relevant entries.
`;
  }

  private parseInspirationResponse(response: string, input: InspirationInput): InspirationSpec {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        id: uuidv4(),
        name: parsed.name || 'Untitled Style',
        style_tags: parsed.style_tags || ['modern'],
        palette: parsed.palette || ['#ffffff', '#000000', '#cccccc'],
        forms: parsed.forms || ['geometric'],
        motifs: parsed.motifs || [],
        materials: parsed.materials || ['wood', 'metal'],
        mood: parsed.mood || 'calm',
        sources: input.trend_data.map(t => t.source),
        created_at: new Date().toISOString(),
        version: '1.0'
      };

    } catch (error) {
      this.logger.error('Failed to parse inspiration response', { response, error });
      return this.generateFallbackInspiration(input);
    }
  }

  private generateFallbackInspiration(input: InspirationInput): InspirationSpec {
    const fallbackPalettes = [
      ['#f7f3e9', '#e8ddd4', '#d0b8a8', '#8b5a3c', '#4a4a4a'],
      ['#ffffff', '#f5f5f5', '#e0e0e0', '#757575', '#212121'],
      ['#fefefe', '#f8f9fa', '#e9ecef', '#6c757d', '#495057']
    ];

    const randomPalette = fallbackPalettes[Math.floor(Math.random() * fallbackPalettes.length)];

    return {
      id: uuidv4(),
      name: 'Contemporary Style',
      style_tags: input.style_hints.length > 0 ? input.style_hints : ['modern', 'contemporary'],
      palette: randomPalette,
      forms: ['geometric', 'linear'],
      motifs: ['clean lines', 'minimalist'],
      materials: ['wood', 'metal', 'glass'],
      mood: 'calm',
      sources: input.trend_data.map(t => t.source),
      created_at: new Date().toISOString(),
      version: '1.0'
    };
  }

  private async storeTrendData(trendData: TrendData[]): Promise<void> {
    // Placeholder for database storage
    this.logger.info('Storing trend data', { count: trendData.length });
    // In a real implementation, this would save to database
  }
}