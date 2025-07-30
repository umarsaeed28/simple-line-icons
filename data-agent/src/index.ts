import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createLogger, requestLogger } from '../../shared/utils/logging';
import { ProductConnectorManager } from './services/product-connector-manager';
import { ProductNormalizer } from './services/product-normalizer';
import { ProductSearchService } from './services/product-search-service';

dotenv.config();

const app = express();
const logger = createLogger('data-agent', process.env.LOG_LEVEL || 'info');
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger(logger));

// Services
const connectorManager = new ProductConnectorManager(logger);
const normalizer = new ProductNormalizer(logger);
const searchService = new ProductSearchService(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    agent: 'data-agent',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    connectors: connectorManager.getActiveConnectors(),
  });
});

// Process product data from connectors
app.post('/run', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.body.requestId || `req_${Date.now()}`;
  
  logger.setContext({ requestId, operation: 'process_products' });
  logger.logOperationStart('process_products', req.body);

  try {
    const { connectorId, searchTerms, limit = 100 } = req.body;

    // Fetch products from connector
    const rawProducts = await connectorManager.fetchProducts(connectorId, searchTerms, limit);
    
    // Normalize products
    const normalizedProducts = await normalizer.normalizeProducts(rawProducts);
    
    // Store in database with embeddings
    const storedProducts = await searchService.storeProducts(normalizedProducts);

    const result = {
      processed_count: storedProducts.length,
      connector_id: connectorId,
      products: storedProducts.slice(0, 10), // Return first 10 for preview
    };

    const duration = Date.now() - startTime;
    logger.logOperationComplete('process_products', result, duration);

    res.json({
      success: true,
      data: result,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logOperationError('process_products', error as Error, req.body);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: duration,
    });
  } finally {
    logger.clearContext();
  }
});

// Search products
app.get('/products', async (req, res) => {
  const startTime = Date.now();
  const requestId = `search_${Date.now()}`;
  
  logger.setContext({ requestId, operation: 'search_products' });
  logger.logOperationStart('search_products', req.query);

  try {
    const { 
      query, 
      category, 
      minPrice, 
      maxPrice, 
      style, 
      limit = 20,
      offset = 0 
    } = req.query;

    const searchParams = {
      query: query as string,
      category: category as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      style: style as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    };

    const products = await searchService.searchProducts(searchParams);
    const duration = Date.now() - startTime;
    
    logger.logOperationComplete('search_products', { resultCount: products.length }, duration);

    res.json({
      success: true,
      data: products,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logOperationError('search_products', error as Error);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: duration,
    });
  } finally {
    logger.clearContext();
  }
});

// Add partner connector
app.post('/connectors', async (req, res) => {
  const startTime = Date.now();
  const requestId = `connector_${Date.now()}`;
  
  logger.setContext({ requestId, operation: 'add_connector' });
  logger.logOperationStart('add_connector', req.body);

  try {
    const { 
      name, 
      type, 
      config, 
      enabled = true 
    } = req.body;

    const connector = await connectorManager.addConnector({
      name,
      type,
      config,
      enabled,
    });

    const duration = Date.now() - startTime;
    logger.logOperationComplete('add_connector', connector, duration);

    res.json({
      success: true,
      data: connector,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logOperationError('add_connector', error as Error, req.body);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: duration,
    });
  } finally {
    logger.clearContext();
  }
});

// Get available connectors
app.get('/connectors', (req, res) => {
  const connectors = connectorManager.getActiveConnectors();
  
  res.json({
    success: true,
    data: connectors,
  });
});

// Test connector
app.post('/connectors/:id/test', async (req, res) => {
  const startTime = Date.now();
  const connectorId = req.params.id;
  const requestId = `test_connector_${connectorId}_${Date.now()}`;
  
  logger.setContext({ requestId, operation: 'test_connector', connectorId });
  logger.logOperationStart('test_connector', { connectorId });

  try {
    const testResult = await connectorManager.testConnector(connectorId);
    const duration = Date.now() - startTime;
    
    logger.logOperationComplete('test_connector', testResult, duration);

    res.json({
      success: true,
      data: testResult,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logOperationError('test_connector', error as Error, { connectorId });

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
  logger.info(`Data Agent started on port ${PORT}`);
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