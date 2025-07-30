import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createLogger, requestLogger } from '../../shared/utils/logging';
import { RoomProcessor } from './services/room-processor';
import { FitChecker } from './services/fit-checker';
import { ShoppingListGenerator } from './services/shopping-list-generator';
import { RoomPlanGenerator } from './services/room-plan-generator';

dotenv.config();

const app = express();
const logger = createLogger('user-agent', process.env.LOG_LEVEL || 'info');
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger(logger));

// Services
const roomProcessor = new RoomProcessor(logger);
const fitChecker = new FitChecker(logger);
const shoppingListGenerator = new ShoppingListGenerator(logger);
const roomPlanGenerator = new RoomPlanGenerator(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    agent: 'user-agent',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Process room design request
app.post('/run', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.body.requestId || `req_${Date.now()}`;
  
  logger.setContext({ requestId, operation: 'process_room_design' });
  logger.logOperationStart('process_room_design', req.body);

  try {
    const { 
      roomGeometry, 
      styleSpec, 
      budgetUsd, 
      keepList, 
      roomType,
      preferences 
    } = req.body;

    // Process the room design request
    const result = await roomProcessor.processRoomDesign({
      roomGeometry,
      styleSpec,
      budgetUsd,
      keepList,
      roomType,
      preferences,
    });

    const duration = Date.now() - startTime;
    logger.logOperationComplete('process_room_design', result, duration);

    res.json({
      success: true,
      data: result,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logOperationError('process_room_design', error as Error, req.body);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: duration,
    });
  } finally {
    logger.clearContext();
  }
});

// Validate furniture placement
app.post('/fit-check', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.body.requestId || `fit_check_${Date.now()}`;
  
  logger.setContext({ requestId, operation: 'fit_check' });
  logger.logOperationStart('fit_check', req.body);

  try {
    const { roomGeometry, furnitureItems } = req.body;

    const fitResults = await fitChecker.validatePlacement(roomGeometry, furnitureItems);

    const duration = Date.now() - startTime;
    logger.logOperationComplete('fit_check', fitResults, duration);

    res.json({
      success: true,
      data: fitResults,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logOperationError('fit_check', error as Error, req.body);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: duration,
    });
  } finally {
    logger.clearContext();
  }
});

// Generate room plan
app.post('/room-plan', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.body.requestId || `room_plan_${Date.now()}`;
  
  logger.setContext({ requestId, operation: 'generate_room_plan' });
  logger.logOperationStart('generate_room_plan', req.body);

  try {
    const { roomGeometry, furnitureItems, styleSpec } = req.body;

    const roomPlan = await roomPlanGenerator.generateRoomPlan(roomGeometry, furnitureItems, styleSpec);

    const duration = Date.now() - startTime;
    logger.logOperationComplete('generate_room_plan', { planUrl: roomPlan.planUrl }, duration);

    res.json({
      success: true,
      data: roomPlan,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logOperationError('generate_room_plan', error as Error, req.body);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: duration,
    });
  } finally {
    logger.clearContext();
  }
});

// Generate shopping list
app.post('/shopping-list', async (req, res) => {
  const startTime = Date.now();
  const requestId = req.body.requestId || `shopping_list_${Date.now()}`;
  
  logger.setContext({ requestId, operation: 'generate_shopping_list' });
  logger.logOperationStart('generate_shopping_list', req.body);

  try {
    const { furnitureItems, budgetUsd, styleSpec } = req.body;

    const shoppingList = await shoppingListGenerator.generateShoppingList(
      furnitureItems,
      budgetUsd,
      styleSpec
    );

    const duration = Date.now() - startTime;
    logger.logOperationComplete('generate_shopping_list', { itemCount: shoppingList.items.length }, duration);

    res.json({
      success: true,
      data: shoppingList,
      processing_time_ms: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.logOperationError('generate_shopping_list', error as Error, req.body);

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processing_time_ms: duration,
    });
  } finally {
    logger.clearContext();
  }
});

// Get fit-checker rules
app.get('/fit-checker/rules', (req, res) => {
  const rules = fitChecker.getRules();
  
  res.json({
    success: true,
    data: rules,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`User Agent started on port ${PORT}`);
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