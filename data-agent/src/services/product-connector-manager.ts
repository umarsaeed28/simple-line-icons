import { Logger } from '../../../shared/utils/logging';
import { AmazonConnector } from '../connectors/amazon-connector';
import { WayfairConnector } from '../connectors/wayfair-connector';
import { HomeDepotConnector } from '../connectors/homedepot-connector';
import { TargetConnector } from '../connectors/target-connector';

export interface ConnectorConfig {
  name: string;
  type: 'amazon' | 'wayfair' | 'homedepot' | 'target' | 'custom';
  config: Record<string, any>;
  enabled: boolean;
}

export interface Connector {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  lastSync?: string;
  productCount?: number;
}

export interface RawProduct {
  id: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  originalPrice?: number;
  dimensions?: {
    width?: number;
    length?: number;
    height?: number;
    weight?: number;
  };
  materials?: string[];
  colors?: string[];
  styleTags?: string[];
  category?: string;
  subcategory?: string;
  imageUrl?: string;
  imageUrls?: string[];
  affiliateLink?: string;
  availability?: string;
  stockQuantity?: number;
  rating?: number;
  reviewCount?: number;
  brand?: string;
  sku?: string;
  partnerId: string;
  partnerProductId: string;
  rawData?: any;
}

export class ProductConnectorManager {
  private logger: Logger;
  private connectors: Map<string, any> = new Map();
  private connectorConfigs: Map<string, ConnectorConfig> = new Map();

  constructor(logger: Logger) {
    this.logger = logger;
    this.initializeDefaultConnectors();
  }

  private initializeDefaultConnectors(): void {
    // Initialize with default connectors if environment variables are set
    if (process.env.AMAZON_ACCESS_KEY && process.env.AMAZON_SECRET_KEY) {
      this.addConnector({
        name: 'Amazon PA-API',
        type: 'amazon',
        config: {
          accessKey: process.env.AMAZON_ACCESS_KEY,
          secretKey: process.env.AMAZON_SECRET_KEY,
          partnerTag: process.env.AMAZON_PARTNER_TAG,
          marketplace: process.env.AMAZON_MARKETPLACE || 'US',
        },
        enabled: true,
      });
    }
  }

  async addConnector(config: ConnectorConfig): Promise<Connector> {
    this.logger.logOperationStart('add_connector', { name: config.name, type: config.type });

    try {
      const connectorId = `connector_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      let connector: any;

      switch (config.type) {
        case 'amazon':
          connector = new AmazonConnector(config.config, this.logger);
          break;
        case 'wayfair':
          connector = new WayfairConnector(config.config, this.logger);
          break;
        case 'homedepot':
          connector = new HomeDepotConnector(config.config, this.logger);
          break;
        case 'target':
          connector = new TargetConnector(config.config, this.logger);
          break;
        default:
          throw new Error(`Unsupported connector type: ${config.type}`);
      }

      this.connectors.set(connectorId, connector);
      this.connectorConfigs.set(connectorId, { ...config, id: connectorId });

      const connectorInfo: Connector = {
        id: connectorId,
        name: config.name,
        type: config.type,
        enabled: config.enabled,
      };

      this.logger.logOperationComplete('add_connector', connectorInfo);
      return connectorInfo;

    } catch (error) {
      this.logger.logOperationError('add_connector', error as Error, config);
      throw error;
    }
  }

  async fetchProducts(
    connectorId: string,
    searchTerms: string[],
    limit: number = 100
  ): Promise<RawProduct[]> {
    this.logger.logOperationStart('fetch_products', { connectorId, searchTerms, limit });

    try {
      const connector = this.connectors.get(connectorId);
      if (!connector) {
        throw new Error(`Connector not found: ${connectorId}`);
      }

      const config = this.connectorConfigs.get(connectorId);
      if (!config?.enabled) {
        throw new Error(`Connector is disabled: ${connectorId}`);
      }

      const products = await connector.searchProducts(searchTerms, limit);
      
      this.logger.logOperationComplete('fetch_products', { 
        connectorId, 
        productCount: products.length 
      });

      return products;

    } catch (error) {
      this.logger.logOperationError('fetch_products', error as Error, { 
        connectorId, 
        searchTerms, 
        limit 
      });
      throw error;
    }
  }

  async testConnector(connectorId: string): Promise<{
    success: boolean;
    message: string;
    productCount?: number;
    sampleProducts?: RawProduct[];
  }> {
    this.logger.logOperationStart('test_connector', { connectorId });

    try {
      const connector = this.connectors.get(connectorId);
      if (!connector) {
        throw new Error(`Connector not found: ${connectorId}`);
      }

      // Test with a simple search
      const testTerms = ['sofa', 'chair'];
      const products = await connector.searchProducts(testTerms, 5);

      const result = {
        success: true,
        message: `Connector test successful. Found ${products.length} products.`,
        productCount: products.length,
        sampleProducts: products.slice(0, 3),
      };

      this.logger.logOperationComplete('test_connector', result);
      return result;

    } catch (error) {
      const result = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };

      this.logger.logOperationError('test_connector', error as Error, { connectorId });
      return result;
    }
  }

  getActiveConnectors(): Connector[] {
    const connectors: Connector[] = [];

    for (const [id, config] of this.connectorConfigs) {
      if (config.enabled) {
        connectors.push({
          id,
          name: config.name,
          type: config.type,
          enabled: config.enabled,
        });
      }
    }

    return connectors;
  }

  async removeConnector(connectorId: string): Promise<void> {
    this.logger.logOperationStart('remove_connector', { connectorId });

    try {
      this.connectors.delete(connectorId);
      this.connectorConfigs.delete(connectorId);

      this.logger.logOperationComplete('remove_connector', { connectorId });

    } catch (error) {
      this.logger.logOperationError('remove_connector', error as Error, { connectorId });
      throw error;
    }
  }

  async updateConnector(
    connectorId: string,
    updates: Partial<ConnectorConfig>
  ): Promise<Connector> {
    this.logger.logOperationStart('update_connector', { connectorId, updates });

    try {
      const config = this.connectorConfigs.get(connectorId);
      if (!config) {
        throw new Error(`Connector not found: ${connectorId}`);
      }

      const updatedConfig = { ...config, ...updates };
      this.connectorConfigs.set(connectorId, updatedConfig);

      // Recreate connector if config changed
      if (updates.config) {
        const connector = this.connectors.get(connectorId);
        if (connector && connector.updateConfig) {
          connector.updateConfig(updates.config);
        }
      }

      const connectorInfo: Connector = {
        id: connectorId,
        name: updatedConfig.name,
        type: updatedConfig.type,
        enabled: updatedConfig.enabled,
      };

      this.logger.logOperationComplete('update_connector', connectorInfo);
      return connectorInfo;

    } catch (error) {
      this.logger.logOperationError('update_connector', error as Error, { connectorId, updates });
      throw error;
    }
  }
}