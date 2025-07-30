import { createClient } from '@supabase/supabase-js';

export interface VectorEmbedding {
  id: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export class VectorUtils {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Generate embedding for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002',
      }),
    });

    const data = await response.json();
    return data.data[0].embedding;
  }

  /**
   * Store embedding in pgvector
   */
  async storeEmbedding(
    table: string,
    id: string,
    embedding: number[],
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.supabase
      .from(table)
      .upsert({
        id,
        embedding,
        metadata: metadata || {},
      });
  }

  /**
   * Find similar items using cosine similarity
   */
  async findSimilar(
    table: string,
    queryEmbedding: number[],
    limit: number = 10,
    threshold: number = 0.7
  ): Promise<VectorEmbedding[]> {
    const { data, error } = await this.supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      table_name: table,
    });

    if (error) {
      throw new Error(`Vector search error: ${error.message}`);
    }

    return data.map((item: any) => ({
      id: item.id,
      embedding: item.embedding,
      metadata: item.metadata,
      similarity: item.similarity,
    }));
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Normalize vector to unit length
   */
  static normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / magnitude);
  }

  /**
   * Combine multiple embeddings (for product search)
   */
  static combineEmbeddings(embeddings: number[][], weights?: number[]): number[] {
    if (embeddings.length === 0) {
      throw new Error('At least one embedding is required');
    }

    const dimension = embeddings[0].length;
    const result = new Array(dimension).fill(0);
    const weightSum = weights ? weights.reduce((sum, w) => sum + w, 0) : embeddings.length;

    embeddings.forEach((embedding, index) => {
      const weight = weights ? weights[index] : 1;
      for (let i = 0; i < dimension; i++) {
        result[i] += (embedding[i] * weight) / weightSum;
      }
    });

    return this.normalizeVector(result);
  }
}

/**
 * Product-specific vector utilities
 */
export class ProductVectorUtils extends VectorUtils {
  /**
   * Generate product embedding from multiple text fields
   */
  async generateProductEmbedding(product: {
    name: string;
    description?: string;
    category?: string;
    style_tags?: string[];
    materials?: string[];
  }): Promise<number[]> {
    const textFields = [
      product.name,
      product.description || '',
      product.category || '',
      ...(product.style_tags || []),
      ...(product.materials || []),
    ].filter(Boolean);

    const text = textFields.join(' ');
    return this.generateEmbedding(text);
  }

  /**
   * Search products by style and category
   */
  async searchProductsByStyle(
    styleTags: string[],
    category?: string,
    limit: number = 20
  ): Promise<any[]> {
    const styleText = styleTags.join(' ');
    const queryEmbedding = await this.generateEmbedding(styleText);

    const results = await this.findSimilar('products', queryEmbedding, limit);
    
    // Filter by category if specified
    if (category) {
      return results.filter(result => 
        result.metadata?.category === category
      );
    }

    return results;
  }
}