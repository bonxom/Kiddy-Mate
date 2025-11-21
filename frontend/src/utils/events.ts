/**
 * Event utility for cross-component communication
 * Used to sync data between different tabs/components
 */

export const TaskEvents = {
  LIBRARY_UPDATED: 'task:library:updated',
  TASK_ASSIGNED: 'task:assigned',
  TASK_DELETED: 'task:deleted',
  
  /**
   * Emit a custom event
   * @param event - Event name
   * @param data - Optional data to pass with the event
   */
  emit: (event: string, data?: any) => {
    window.dispatchEvent(new CustomEvent(event, { detail: data }));
  },
  
  /**
   * Listen to a custom event
   * @param event - Event name to listen for
   * @param handler - Handler function to call when event is triggered
   * @returns Cleanup function to remove the listener
   */
  listen: (event: string, handler: (e: CustomEvent) => void) => {
    const listener = (e: Event) => handler(e as CustomEvent);
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }
};
