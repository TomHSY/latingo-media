/**
 * Fetch real events from API and analyze image dimensions.
 * Run with: npm run test:api
 */
import { fetchWeekendEvents, fetchEvents } from '../api/client';

async function main() {
  console.log('🔗 Fetching events from api.latingo.fr...\n');

  // Try weekend first, fallback to next 2 weeks if no weekend events
  let events = await fetchWeekendEvents();
  
  if (events.length === 0) {
    console.log('  No weekend events found, fetching next 14 days...');
    const now = new Date();
    const twoWeeks = new Date(now);
    twoWeeks.setDate(now.getDate() + 14);
    events = await fetchEvents({
      date_from: now.toISOString(),
      date_to: twoWeeks.toISOString(),
      sort_by: 'date_asc',
    });
  }

  console.log(`  Found ${events.length} events\n`);

  // Display event details
  for (const event of events.slice(0, 15)) {
    console.log(`  📌 ${event.title}`);
    console.log(`     City: ${event.city || '(none)'}`);
    console.log(`     Date: ${event.start_datetime}`);
    console.log(`     Dance: ${event.dance_types?.map(d => d.slug).join(', ') || '(none)'}`);
    console.log(`     Image: ${event.image_url || '(none)'}`);
    console.log(`     RSVP: ${event.rsvp_count ?? 0}`);
    console.log('');
  }

  // Analyze images
  console.log('\n📸 Image Analysis:\n');
  const withImages = events.filter(e => e.image_url);
  const withoutImages = events.filter(e => !e.image_url);
  
  console.log(`  With image: ${withImages.length}`);
  console.log(`  Without image: ${withoutImages.length}`);
  
  if (withImages.length > 0) {
    console.log('\n  Checking image dimensions (first 10)...\n');
    
    for (const event of withImages.slice(0, 10)) {
      try {
        const res = await fetch(event.image_url!, { method: 'HEAD' });
        const contentType = res.headers.get('content-type') || 'unknown';
        const contentLength = res.headers.get('content-length');
        const sizeKB = contentLength ? Math.round(parseInt(contentLength) / 1024) : '?';
        
        console.log(`  ${event.title.slice(0, 40)}`);
        console.log(`    URL: ${event.image_url!.slice(0, 80)}...`);
        console.log(`    Type: ${contentType} | Size: ${sizeKB}KB`);
        console.log(`    Status: ${res.status}`);
        console.log('');
      } catch (err: any) {
        console.log(`  ${event.title.slice(0, 40)}`);
        console.log(`    ❌ Error: ${err.message}`);
        console.log('');
      }
    }
  }
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
