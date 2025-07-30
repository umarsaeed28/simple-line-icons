import * as fs from 'fs';
import * as path from 'path';

interface Dimensions {
  width_cm: number;
  length_cm: number;
  height_cm: number;
}

interface Position {
  x_cm: number;
  y_cm: number;
  rotation_degrees: number;
}

interface FurnitureItem {
  product_id: string;
  category: string;
  dimensions: Dimensions;
  position: Position;
}

interface RoomGeometry {
  width_cm: number;
  length_cm: number;
  height_cm: number;
  openings?: Array<{
    type: 'door' | 'window' | 'archway';
    position: {
      wall: 'north' | 'south' | 'east' | 'west';
      distance_from_corner_cm: number;
    };
    dimensions: {
      width_cm: number;
      height_cm: number;
    };
  }>;
}

interface FitCheckResult {
  passed: boolean;
  issues: Array<{
    type: 'clearance' | 'overlap' | 'relationship' | 'accessibility' | 'safety';
    severity: 'error' | 'warning';
    message: string;
    furniture_ids: string[];
  }>;
  score: number; // 0-100
  suggestions?: string[];
}

interface FitCheckOptions {
  accessibility?: 'wheelchair_accessible' | 'mobility_aid';
  child_safe?: boolean;
  pet_friendly?: boolean;
  room_type?: string;
}

class FitChecker {
  private rules: any;

  constructor() {
    const rulesPath = path.join(__dirname, 'rules.json');
    this.rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  }

  /**
   * Main function to check if furniture arrangement fits in the room
   */
  checkFit(
    room: RoomGeometry,
    furniture: FurnitureItem[],
    options: FitCheckOptions = {}
  ): FitCheckResult {
    const issues: FitCheckResult['issues'] = [];
    
    // 1. Check room boundaries
    issues.push(...this.checkRoomBoundaries(room, furniture));
    
    // 2. Check furniture overlaps
    issues.push(...this.checkOverlaps(furniture));
    
    // 3. Check clearance requirements
    issues.push(...this.checkClearances(room, furniture, options));
    
    // 4. Check furniture relationships
    issues.push(...this.checkRelationships(furniture, options.room_type));
    
    // 5. Check accessibility requirements
    if (options.accessibility) {
      issues.push(...this.checkAccessibility(room, furniture, options.accessibility));
    }
    
    // 6. Check safety requirements
    if (options.child_safe || options.pet_friendly) {
      issues.push(...this.checkSafety(furniture, options));
    }
    
    // Calculate score based on issues
    const score = this.calculateScore(issues);
    
    // Generate suggestions
    const suggestions = this.generateSuggestions(issues);
    
    return {
      passed: issues.filter(i => i.severity === 'error').length === 0,
      issues,
      score,
      suggestions
    };
  }

  private checkRoomBoundaries(room: RoomGeometry, furniture: FurnitureItem[]) {
    const issues: FitCheckResult['issues'] = [];
    
    for (const item of furniture) {
      const bounds = this.getFurnitureBounds(item);
      
      if (bounds.minX < 0 || bounds.maxX > room.width_cm || 
          bounds.minY < 0 || bounds.maxY > room.length_cm) {
        issues.push({
          type: 'clearance',
          severity: 'error',
          message: `${item.category} extends beyond room boundaries`,
          furniture_ids: [item.product_id]
        });
      }
    }
    
    return issues;
  }

  private checkOverlaps(furniture: FurnitureItem[]) {
    const issues: FitCheckResult['issues'] = [];
    
    for (let i = 0; i < furniture.length; i++) {
      for (let j = i + 1; j < furniture.length; j++) {
        const item1 = furniture[i];
        const item2 = furniture[j];
        
        if (this.checkItemsOverlap(item1, item2)) {
          issues.push({
            type: 'overlap',
            severity: 'error',
            message: `${item1.category} overlaps with ${item2.category}`,
            furniture_ids: [item1.product_id, item2.product_id]
          });
        }
      }
    }
    
    return issues;
  }

  private checkClearances(room: RoomGeometry, furniture: FurnitureItem[], options: FitCheckOptions) {
    const issues: FitCheckResult['issues'] = [];
    
    for (const item of furniture) {
      const categoryRules = this.rules.furniture_specific_rules[item.category];
      if (!categoryRules) continue;
      
      // Check minimum clearances
      const clearanceIssues = this.validateClearances(room, item, furniture, categoryRules);
      issues.push(...clearanceIssues);
      
      // Check door/window clearances
      if (room.openings) {
        const openingIssues = this.checkOpeningClearances(room, item);
        issues.push(...openingIssues);
      }
    }
    
    return issues;
  }

  private checkRelationships(furniture: FurnitureItem[], roomType?: string) {
    const issues: FitCheckResult['issues'] = [];
    
    if (!roomType) return issues;
    
    const roomRules = this.rules.room_specific_rules[roomType];
    if (!roomRules?.furniture_relationships) return issues;
    
    // Check specific furniture relationships
    for (const [relationship, rule] of Object.entries(roomRules.furniture_relationships)) {
      const [cat1, cat2] = relationship.split('_to_');
      const item1 = furniture.find(f => f.category === cat1);
      const item2 = furniture.find(f => f.category === cat2);
      
      if (item1 && item2) {
        const distance = this.calculateDistance(item1, item2);
        const relationshipRule = rule as any;
        
        if (relationshipRule.min_distance_cm && distance < relationshipRule.min_distance_cm) {
          issues.push({
            type: 'relationship',
            severity: 'warning',
            message: `${cat1} too close to ${cat2} (${distance}cm < ${relationshipRule.min_distance_cm}cm)`,
            furniture_ids: [item1.product_id, item2.product_id]
          });
        }
        
        if (relationshipRule.max_distance_cm && distance > relationshipRule.max_distance_cm) {
          issues.push({
            type: 'relationship',
            severity: 'warning',
            message: `${cat1} too far from ${cat2} (${distance}cm > ${relationshipRule.max_distance_cm}cm)`,
            furniture_ids: [item1.product_id, item2.product_id]
          });
        }
      }
    }
    
    return issues;
  }

  private checkAccessibility(room: RoomGeometry, furniture: FurnitureItem[], level: string) {
    const issues: FitCheckResult['issues'] = [];
    const accessRules = this.rules.accessibility_rules[level];
    
    if (!accessRules) return issues;
    
    // Check walkway widths
    const walkways = this.calculateWalkways(room, furniture);
    for (const walkway of walkways) {
      if (walkway.width < accessRules.min_walkway_cm) {
        issues.push({
          type: 'accessibility',
          severity: 'error',
          message: `Walkway too narrow for accessibility (${walkway.width}cm < ${accessRules.min_walkway_cm}cm)`,
          furniture_ids: walkway.blocking_furniture
        });
      }
    }
    
    return issues;
  }

  private checkSafety(furniture: FurnitureItem[], options: FitCheckOptions) {
    const issues: FitCheckResult['issues'] = [];
    
    if (options.child_safe) {
      const childRules = this.rules.safety_rules.child_safe;
      
      for (const item of furniture) {
        // Check for tip-over risks
        if (item.dimensions.height_cm > 150 && 
            item.dimensions.width_cm / item.dimensions.height_cm < 0.5) {
          issues.push({
            type: 'safety',
            severity: 'warning',
            message: `${item.category} may have tip-over risk - consider securing to wall`,
            furniture_ids: [item.product_id]
          });
        }
      }
    }
    
    return issues;
  }

  private getFurnitureBounds(item: FurnitureItem) {
    const halfWidth = item.dimensions.width_cm / 2;
    const halfLength = item.dimensions.length_cm / 2;
    
    return {
      minX: item.position.x_cm - halfWidth,
      maxX: item.position.x_cm + halfWidth,
      minY: item.position.y_cm - halfLength,
      maxY: item.position.y_cm + halfLength
    };
  }

  private checkItemsOverlap(item1: FurnitureItem, item2: FurnitureItem): boolean {
    const bounds1 = this.getFurnitureBounds(item1);
    const bounds2 = this.getFurnitureBounds(item2);
    
    return !(bounds1.maxX <= bounds2.minX || bounds2.maxX <= bounds1.minX ||
             bounds1.maxY <= bounds2.minY || bounds2.maxY <= bounds1.minY);
  }

  private validateClearances(
    room: RoomGeometry,
    item: FurnitureItem,
    allFurniture: FurnitureItem[],
    rules: any
  ) {
    const issues: FitCheckResult['issues'] = [];
    
    // Check clearances around the item
    const bounds = this.getFurnitureBounds(item);
    const nearbyFurniture = allFurniture.filter(f => 
      f.product_id !== item.product_id &&
      this.calculateDistance(item, f) < 200 // within 2m
    );
    
    for (const nearby of nearbyFurniture) {
      const distance = this.calculateDistance(item, nearby);
      const minDistance = this.rules.clearance_rules.between_furniture_cm;
      
      if (distance < minDistance) {
        issues.push({
          type: 'clearance',
          severity: 'warning',
          message: `Insufficient clearance between ${item.category} and ${nearby.category} (${distance}cm < ${minDistance}cm)`,
          furniture_ids: [item.product_id, nearby.product_id]
        });
      }
    }
    
    return issues;
  }

  private checkOpeningClearances(room: RoomGeometry, item: FurnitureItem) {
    const issues: FitCheckResult['issues'] = [];
    
    if (!room.openings) return issues;
    
    for (const opening of room.openings) {
      const openingPos = this.getOpeningPosition(room, opening);
      const distance = this.calculateDistanceToPoint(item, openingPos);
      
      const requiredClearance = opening.type === 'door' 
        ? this.rules.clearance_rules.door_clearance_cm
        : this.rules.clearance_rules.window_clearance_cm;
      
      if (distance < requiredClearance) {
        issues.push({
          type: 'clearance',
          severity: 'warning',
          message: `${item.category} too close to ${opening.type} (${distance}cm < ${requiredClearance}cm)`,
          furniture_ids: [item.product_id]
        });
      }
    }
    
    return issues;
  }

  private calculateDistance(item1: FurnitureItem, item2: FurnitureItem): number {
    const dx = item1.position.x_cm - item2.position.x_cm;
    const dy = item1.position.y_cm - item2.position.y_cm;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculateDistanceToPoint(item: FurnitureItem, point: {x: number, y: number}): number {
    const dx = item.position.x_cm - point.x;
    const dy = item.position.y_cm - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getOpeningPosition(room: RoomGeometry, opening: any) {
    const wall = opening.position.wall;
    const distance = opening.position.distance_from_corner_cm;
    
    switch (wall) {
      case 'north':
        return { x: distance, y: room.length_cm };
      case 'south':
        return { x: distance, y: 0 };
      case 'east':
        return { x: room.width_cm, y: distance };
      case 'west':
        return { x: 0, y: distance };
      default:
        return { x: 0, y: 0 };
    }
  }

  private calculateWalkways(room: RoomGeometry, furniture: FurnitureItem[]) {
    // Simplified walkway calculation
    // In a real implementation, this would use pathfinding algorithms
    return [
      {
        width: 120, // placeholder
        blocking_furniture: [] as string[]
      }
    ];
  }

  private calculateScore(issues: FitCheckResult['issues']): number {
    let score = 100;
    
    for (const issue of issues) {
      if (issue.severity === 'error') {
        score -= 20;
      } else if (issue.severity === 'warning') {
        score -= 10;
      }
    }
    
    return Math.max(0, score);
  }

  private generateSuggestions(issues: FitCheckResult['issues']): string[] {
    const suggestions: string[] = [];
    
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    if (errorCount > 0) {
      suggestions.push(`Fix ${errorCount} critical issue(s) before proceeding`);
    }
    
    if (warningCount > 0) {
      suggestions.push(`Consider addressing ${warningCount} layout optimization(s)`);
    }
    
    // Add specific suggestions based on issue types
    const overlapIssues = issues.filter(i => i.type === 'overlap');
    if (overlapIssues.length > 0) {
      suggestions.push('Move overlapping furniture to create proper separation');
    }
    
    const clearanceIssues = issues.filter(i => i.type === 'clearance');
    if (clearanceIssues.length > 0) {
      suggestions.push('Increase spacing between furniture for better circulation');
    }
    
    return suggestions;
  }
}

export { FitChecker, FitCheckResult, FitCheckOptions };
export default FitChecker;