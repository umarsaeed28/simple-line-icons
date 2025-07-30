import rules from './rules.json';

export interface Dimensions {
  width: number;
  length: number;
  height: number;
}

export interface Item {
  id: string;
  dims: Dimensions;
}

export interface Room extends Dimensions {
  items?: Item[];
}

export function canPlace(item: Item, room: Room): boolean {
  // Very naive placeholder: just checks bounding box fits inside room
  return (
    item.dims.width <= room.width &&
    item.dims.length <= room.length &&
    item.dims.height <= room.height
  );
}

export function verifyPlan(room: Room): boolean {
  if (!room.items) return true;
  return room.items.every((item) => canPlace(item, room));
}