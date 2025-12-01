// @/lib/firebase/error-emitter.ts

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

class EventEmitter<T extends EventMap> implements Emitter<T> {
  private listeners: {
    [K in keyof T]?: Array<EventReceiver<T[K]>>;
  } = {};

  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
    this.listeners[eventName] = (this.listeners[eventName] || []).concat(fn);
  }

  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void {
    (this.listeners[eventName] || []).forEach(fn => {
      fn(params);
    });
  }
}

// Define the events and their payloads
interface ErrorEvents {
  'permission-error': Error;
}

// Export a singleton instance of the event emitter
export const errorEmitter = new EventEmitter<ErrorEvents>();
