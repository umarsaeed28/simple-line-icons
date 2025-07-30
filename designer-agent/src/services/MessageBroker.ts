import amqp, { Connection, Channel, Message } from 'amqplib';
import { Logger } from '../utils/Logger';

interface MessageHandler {
  (message: any): Promise<void>;
}

export class MessageBroker {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance();
  }

  async connect(): Promise<void> {
    try {
      const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.logger.info('Connecting to RabbitMQ', { url: rabbitUrl });

      this.connection = await amqp.connect(rabbitUrl);
      this.channel = await this.connection.createChannel();

      // Declare exchanges and queues
      await this.setupExchangesAndQueues();

      this.logger.info('Connected to RabbitMQ successfully');

    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      this.logger.info('Disconnected from RabbitMQ');

    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', error);
    }
  }

  private async setupExchangesAndQueues(): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    // Declare exchanges
    await this.channel.assertExchange('designer.requests', 'topic', { durable: true });
    await this.channel.assertExchange('designer.responses', 'topic', { durable: true });
    await this.channel.assertExchange('designer.events', 'topic', { durable: true });

    // Declare queues
    await this.channel.assertQueue('designer.inspiration.requests', { durable: true });
    await this.channel.assertQueue('designer.trend.requests', { durable: true });
    await this.channel.assertQueue('designer.responses', { durable: true });

    // Bind queues to exchanges
    await this.channel.bindQueue('designer.inspiration.requests', 'designer.requests', 'inspiration.*');
    await this.channel.bindQueue('designer.trend.requests', 'designer.requests', 'trend.*');
    await this.channel.bindQueue('designer.responses', 'designer.responses', 'response.*');
  }

  async subscribeToRequests(handler: MessageHandler): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    this.logger.info('Subscribing to inspiration requests');

    await this.channel.consume('designer.inspiration.requests', async (message: Message | null) => {
      if (!message) return;

      try {
        const content = JSON.parse(message.content.toString());
        this.logger.info('Received inspiration request', { 
          requestId: content.request_id,
          messageId: message.properties.messageId 
        });

        await handler(content);
        this.channel!.ack(message);

      } catch (error) {
        this.logger.error('Failed to process inspiration request', error);
        this.channel!.nack(message, false, false); // Don't requeue
      }
    });

    await this.channel.consume('designer.trend.requests', async (message: Message | null) => {
      if (!message) return;

      try {
        const content = JSON.parse(message.content.toString());
        this.logger.info('Received trend request', { 
          requestId: content.request_id,
          messageId: message.properties.messageId 
        });

        await handler(content);
        this.channel!.ack(message);

      } catch (error) {
        this.logger.error('Failed to process trend request', error);
        this.channel!.nack(message, false, false);
      }
    });
  }

  async publishResponse(requestId: string, data: any): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    const message = {
      request_id: requestId,
      status: 'success',
      data,
      timestamp: new Date().toISOString(),
      service: 'designer-agent'
    };

    await this.channel.publish(
      'designer.responses',
      'response.success',
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        messageId: `designer-${requestId}-${Date.now()}`
      }
    );

    this.logger.info('Published response', { requestId });
  }

  async publishError(requestId: string, error: string): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    const message = {
      request_id: requestId,
      status: 'error',
      error,
      timestamp: new Date().toISOString(),
      service: 'designer-agent'
    };

    await this.channel.publish(
      'designer.responses',
      'response.error',
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        messageId: `designer-error-${requestId}-${Date.now()}`
      }
    );

    this.logger.error('Published error response', { requestId, error });
  }

  async publishEvent(eventType: string, data: any): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    const message = {
      event_type: eventType,
      data,
      timestamp: new Date().toISOString(),
      service: 'designer-agent'
    };

    await this.channel.publish(
      'designer.events',
      `event.${eventType}`,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        messageId: `designer-event-${Date.now()}`
      }
    );

    this.logger.info('Published event', { eventType });
  }

  async requestInspiration(payload: any): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');

    const message = {
      request_id: `inspiration-${Date.now()}`,
      request_type: 'generate_inspiration',
      payload,
      timestamp: new Date().toISOString(),
      source: 'designer-agent'
    };

    await this.channel.publish(
      'designer.requests',
      'inspiration.generate',
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        messageId: message.request_id
      }
    );

    this.logger.info('Sent inspiration request', { requestId: message.request_id });
  }
}