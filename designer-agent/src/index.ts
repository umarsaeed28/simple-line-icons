import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { TrendAnalyzer } from './services/TrendAnalyzer';
import { MoodboardGenerator } from './services/MoodboardGenerator';
import { MessageBroker } from './services/MessageBroker';
import { Logger } from './utils/Logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const logger = Logger.getInstance();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Services
const trendAnalyzer = new TrendAnalyzer();
const moodboardGenerator = new MoodboardGenerator();
const messageBroker = new MessageBroker();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'designer-agent',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Generate inspiration spec from trends
app.post('/api/inspiration/generate', async (req, res) => {
  try {
    const { description, style_hints = [], sources = [] } = req.body;
    
    logger.info('Generating inspiration spec', { description, style_hints, sources });
    
    // Analyze current trends
    const trendData = await trendAnalyzer.analyzeTrends(sources);
    
    // Generate inspiration spec
    const inspirationSpec = await trendAnalyzer.generateInspirationSpec({
      description,
      style_hints,
      trend_data: trendData
    });
    
    // Generate moodboard
    const moodboardUrl = await moodboardGenerator.generateMoodboard(inspirationSpec);
    inspirationSpec.moodboard_url = moodboardUrl;
    
    logger.info('Inspiration spec generated', { id: inspirationSpec.id });
    
    res.json({
      success: true,
      data: inspirationSpec
    });
    
  } catch (error) {
    logger.error('Failed to generate inspiration spec', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate inspiration spec'
    });
  }
});

// Get inspiration spec by ID
app.get('/api/inspiration/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would query a database
    res.json({
      success: true,
      data: null,
      message: 'Database integration pending'
    });
    
  } catch (error) {
    logger.error('Failed to get inspiration spec', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inspiration spec'
    });
  }
});

// Run trend analysis (called via cron or webhook)
app.post('/api/trends/analyze', async (req, res) => {
  try {
    const { force_refresh = false } = req.body;
    
    logger.info('Running trend analysis', { force_refresh });
    
    const trends = await trendAnalyzer.runFullAnalysis(force_refresh);
    
    res.json({
      success: true,
      data: {
        trends_analyzed: trends.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Failed to analyze trends', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze trends'
    });
  }
});

// Message broker handlers
app.post('/api/run', async (req, res) => {
  try {
    const { request_type, payload } = req.body;
    
    logger.info('Processing request', { request_type });
    
    let result;
    
    switch (request_type) {
      case 'generate_inspiration':
        result = await handleGenerateInspiration(payload);
        break;
      case 'analyze_trends':
        result = await handleAnalyzeTrends(payload);
        break;
      default:
        throw new Error(`Unknown request type: ${request_type}`);
    }
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Failed to process request', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

async function handleGenerateInspiration(payload: any) {
  const trendData = await trendAnalyzer.analyzeTrends(payload.sources || []);
  const inspirationSpec = await trendAnalyzer.generateInspirationSpec({
    description: payload.description,
    style_hints: payload.style_hints || [],
    trend_data: trendData
  });
  
  const moodboardUrl = await moodboardGenerator.generateMoodboard(inspirationSpec);
  inspirationSpec.moodboard_url = moodboardUrl;
  
  return inspirationSpec;
}

async function handleAnalyzeTrends(payload: any) {
  return await trendAnalyzer.runFullAnalysis(payload.force_refresh || false);
}

// Start server
async function startServer() {
  try {
    // Initialize message broker
    await messageBroker.connect();
    
    // Start listening for messages
    await messageBroker.subscribeToRequests(async (message) => {
      try {
        const result = await handleGenerateInspiration(message);
        await messageBroker.publishResponse(message.request_id, result);
      } catch (error) {
        logger.error('Failed to process message', error);
        await messageBroker.publishError(message.request_id, error.message);
      }
    });
    
    app.listen(port, () => {
      logger.info(`Designer Agent running on port ${port}`);
    });
    
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down Designer Agent...');
  await messageBroker.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down Designer Agent...');
  await messageBroker.disconnect();
  process.exit(0);
});

startServer();