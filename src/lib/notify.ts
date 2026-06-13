import { supabase } from './supabase';

export function notifyLisa(title: string, body: string): void {
  supabase.functions
    .invoke('notify-email', { body: { title, body } })
    .catch(() => {
      // Fire-and-forget — never block the form on a failed notification
    });
}
