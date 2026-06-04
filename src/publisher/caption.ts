/**
 * GPT-4o-mini caption generator for Instagram posts.
 */
import OpenAI from 'openai';
import type { MediaEvent } from '../types';
import 'dotenv/config';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateCarouselCaption(
  events: MediaEvent[],
  startDate: Date,
  endDate: Date
): Promise<string> {
  const startStr = startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  const endStr = endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  const eventList = events
    .map((e) => {
      const date = new Date(e.start_datetime).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      const danceTypes = e.dance_types.map((d) => d.label_fr).join(', ') || 'Danse latine';
      const rsvp = e.rsvp_count ? ` · ${e.rsvp_count} inscrits` : '';
      return `- ${e.title} · ${e.city} · ${date} · ${danceTypes}${rsvp}`;
    })
    .join('\n');

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Tu es le community manager de LatinGo, la plateforme française des événements de danse latine. ' +
          'Tu écris des captions Instagram en français, enthousiastes et authentiques. ' +
          'Style: accessible, festif, communautaire. Pas de superlatifs excessifs. ' +
          'Termine toujours par "👉 Tous les événements sur latingo.fr" suivi de hashtags pertinents ' +
          'choisis parmi: #salsa #bachata #kizomba #zouk #danselatine #latingo #soireedanse #dansesociale',
      },
      {
        role: 'user',
        content:
          `Écris une caption Instagram pour notre carousel hebdomadaire couvrant du ${startStr} au ${endStr}.\n\n` +
          `Événements:\n${eventList}\n\n` +
          `Contraintes:\n` +
          `- Accroche originale (varie le style chaque semaine)\n` +
          `- Mentionne les villes et styles de danse\n` +
          `- Entre 150 et 250 mots\n` +
          `- Emojis avec modération\n` +
          `- Termine par les hashtags sur une ligne séparée`,
      },
    ],
    max_tokens: 450,
    temperature: 0.85,
  });

  return response.choices[0].message.content?.trim() ?? '';
}
