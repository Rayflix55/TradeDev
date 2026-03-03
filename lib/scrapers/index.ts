import { scrapeTechJobs, scrapeTradingJobs } from './jsearchscraper';
import { scrapeLeverJobs } from './leverScraper';

export async function scrapeJobs(categories: string[] = ['trading']) {
  const allJobs = [];
  
  console.log(`🚀 Scraping categories: ${categories.join(', ')}`);
  
  if (categories.includes('tech')) {
    console.log('📱 Scraping tech jobs from JSearch...');
    const techJobs = await scrapeTechJobs();
    allJobs.push(...techJobs);
  }
  
  if (categories.includes('trading')) {
    console.log('📊 Scraping trading jobs from JSearch...');
    const tradingJobs = await scrapeTradingJobs();
    allJobs.push(...tradingJobs);
  }
  
  // Optional: still use Lever as a backup
  if (categories.includes('lever')) {
    console.log('🔧 Scraping Lever jobs as backup...');
    const leverJobs = await scrapeLeverJobs(['tech']);
    allJobs.push(...leverJobs);
  }
  
  // Remove duplicates by apply_url
  const uniqueJobs = Array.from(
    new Map(allJobs.map(job => [job.apply_url, job])).values()
  );
  
  console.log(`✅ Total unique jobs: ${uniqueJobs.length}`);
  return uniqueJobs;
}