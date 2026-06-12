export function notifyLisa(title: string, body: string): void {
  const topic = import.meta.env.VITE_NTFY_TOPIC as string | undefined;
  if (!topic) return;

  fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: 'POST',
    headers: {
      Title: title,
      Priority: 'default',
      Click: `${window.location.origin}/admin`,
      'Content-Type': 'text/plain',
    },
    body,
  }).catch(() => {
    // Fire-and-forget — never block the form on a failed notification
  });
}
