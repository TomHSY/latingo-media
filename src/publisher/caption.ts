/**
 * GPT-4o-mini caption generator for Instagram posts.
 */
import OpenAI from 'openai';
import type { MediaEvent } from '../types';
import type { ThursdaySelection } from '../utils/thursday-selector';
import { formatDateFrench } from '../utils/dates';
import { parseEventStartDatetime } from '../utils/paris-time';
import 'dotenv/config';

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required for carousel caption generation');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export async function generateCarouselCaption(
  events: MediaEvent[],
  startDate: Date,
  endDate: Date
): Promise<string> {
  const startStr = startDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  });
  const endStr = endDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  });

  const eventList = events
    .map((e) => {
      const date = formatDateFrench(parseEventStartDatetime(e.start_datetime));
      const danceTypes = e.dance_types.map((d) => d.label_fr).join(', ') || 'Danse latine';
      const rsvp = e.rsvp_count ? ` · ${e.rsvp_count} inscrits` : '';
      return `- ${e.title} · ${e.city} · ${date} · ${danceTypes}${rsvp}`;
    })
    .join('\n');

  const response = await getOpenAIClient().chat.completions.create({
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

/** Deterministic Instagram caption for Thursday lens posts. */
export function buildThursdayCaption(selection: ThursdaySelection): string {
  const { meta, events, variant } = selection;
  const lines: string[] = [meta.headline];

  if (meta.subheadline) {
    lines.push(meta.subheadline);
  }

  if (variant === 'dance-duel' && meta.salsaCount != null && meta.bachataCount != null) {
    lines.push(`${meta.salsaCount} soirées Salsa · ${meta.bachataCount} soirées Bachata`);
  }

  if (variant === 'cross-border' && meta.frenchCount != null && meta.euskadiCount != null) {
    lines.push(`${meta.frenchCount} côté français · ${meta.euskadiCount} en Euskadi`);
  }

  if (variant === 'weekly-stats' && meta.stats) {
    lines.push(
      `${meta.stats.totalEvents} soirées · ${meta.stats.activeAreas} zones · ${meta.stats.danceStyles} styles`
    );
  }

  if (events.length > 0) {
    lines.push('');
    for (const event of events) {
      const dances = event.dance_types.map((d) => d.label_fr).join(', ');
      lines.push(`• ${event.title} · ${event.city ?? ''} · ${dances}`);
    }
    if (meta.remaining > 0) {
      lines.push(`…et ${meta.remaining} autre${meta.remaining > 1 ? 's' : ''} sur l'app`);
    }
  }

  lines.push('');
  lines.push('👉 Découvre toutes les soirées sur LatinGo');
  lines.push('🔗 Lien en bio');
  lines.push('');
  lines.push('#latingo #danselatine #sbk #paysbasque #salsa #bachata #kizomba');

  return lines.join('\n');
}
