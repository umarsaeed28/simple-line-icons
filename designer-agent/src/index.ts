import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createLogger, requestLogger } from '../../shared/utils/logging';
import { TrendIngestionService } from './services/trend-ingestion';
import { MoodboardGenerator } from './services/moodboard-generator';
import { InspirationSpecGenerator } from './services/inspiration-spec-generator';

dotenv.config();

const app = express();
const logger = createLogger('designer-agent', process.env.LOG_LEVEL || 'info');
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger(logger));

// Services
const trendIngestion = new TrendIngestionService(logger);
const moodboardGenerator = new MoodboardGenerator(logger);
const inspirationGenerator = new InspirationSpecGenerator(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    agent: 'designer-agent',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Generate inspiration spec and moodboard
app.post('/run', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.body.requestId || `req_${Date.now()}`;
  
  logger.setContext({ requestId, operation: 'generate_inspiration' });
  logger.logOperationStart('generate_inspiration', req.body);

  try {
    const { referenceImageUrl, stylePreferences, roomType } = req.body;

    // Generate inspiration specification
    const inspirationSpec = await inspirationGenerator.generateInspirationSpec({
      referenceImageUrl,
      stylePreferences,
      roomType,
    });

    // Generate moodboard image
    const moodboardUrl = await moodboardGenerator.generateMoodboard(inspirationSpec);

    const result = {
      ...inspirationSpec,
      moodboard_url: moodboardUrl,
    };

    const duration = Date.now() - startTime;
    logger.logOperationComplete('generate_inspiration', result, duration);

    res.json({
      success: true,
      data: result,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logOperationError('generate_inspiration', error as Error, req.body);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: duration,
    });
  } finally {
    logger.clearContext();
  }
});

// Fetch current design trends
app.get('/trends', async (req, res) => {
  const startTime = Date.now();
  const requestId = `trends_${Date.now()}`;
  
  logger.setContext({ requestId, operation: 'fetch_trends' });
  logger.logOperationStart('fetch_trends');

  try {
    const trends = await trendIngestion.fetchCurrentTrends();
    const duration = Date.now() - startTime;
    
    logger.logOperationComplete('fetch_trends', { trendCount: trends.length }, duration);

    res.json({
      success: true,
      data: trends,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logOperationError('fetch_trends', error as Error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: duration,
    });
  } finally {
    logger.clearContext();
  }
});

// Start server
app.listen(PORT, () => {
  logger.info(`Designer Agent started on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;