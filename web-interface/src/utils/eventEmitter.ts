/**
 * Event Emitter - Inspired by OpenAI Apps SDK events
 * Provides custom event system for app-wide communication
 */

type EventCallback<T = unknown> = (data: T) => void;

class EventEmitter {
  private events: Map<string, EventCallback[]> = new Map();

  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    this.events.get(event)!.push(callback as EventCallback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback as EventCallback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit<T = unknown>(event: string, data: T): void {
    const callbacks = this.events.get(event);
    if (!callbacks) return;

    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    const wrappedCallback: EventCallback<T> = (data) => {
      callback(data);
      this.off(event, wrappedCallback);
    };

    return this.on(event, wrappedCallback);
  }
}

// Global event emitter instance
export const appEvents = new EventEmitter();

// Event types (similar to OpenAI's openai:tool_response, openai:set_globals)
export const APP_EVENTS = {
  TOOL_RESPONSE: 'app:tool_response',
  GLOBALS_CHANGED: 'app:globals_changed',
  ANALYSIS_COMPLETE: 'app:analysis_complete',
  FILE_UPLOADED: 'app:file_uploaded',
  MESSAGE_SENT: 'app:message_sent',
  CONVERSATION_CREATED: 'app:conversation_created',
  THEME_CHANGED: 'app:theme_changed',
} as const;

