export async function notifyN8nToggle(idLogement: string, actif: boolean) {
  await fetch(process.env.N8N_TOGGLE_WEBHOOK_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Webhook-Secret": process.env.N8N_WEBHOOK_SECRET!,
    },
    body: JSON.stringify({ id_logement: idLogement, actif }),
  });
}
