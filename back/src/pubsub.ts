// pubsub.ts (Singleton — shared across requests)
import { EventEmitter } from 'events';
export const messageBus = new EventEmitter(); // In-memory only (dev)