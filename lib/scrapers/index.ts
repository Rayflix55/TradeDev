import { scrapeTechJobsByRole, scrapeTradingJobs } from './jsearchscraper';

export async function scrapeJobs(categories: string[] = ['tech']) {
  const allJobs = [];
  
  if (categories.includes('tech')) {
    const techJobs = await scrapeTechJobsByRole(); // Changed this!
    allJobs.push(...techJobs);
  }
  
  if (categories.includes('trading')) {
    const tradingJobs = await scrapeTradingJobs();
    allJobs.push(...tradingJobs);
  }
  
  return allJobs;
}