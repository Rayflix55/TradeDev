// lib/scrapers/leverScraper.ts
import axios from 'axios';

interface LeverJob {
  id: string;
  text: string;
  categories: {
    team?: string;
    location?: string;
    commitment?: string;
  };
  description: string;
  hostedUrl: string;
  applyUrl: string;
}

// Separate lists by industry
const COMPANY_LISTS = {
  trading: [
    // These DON'T work with Lever - we'll keep them for now but they'll fail
    'janestreet',
    'hudsonrivertrading',
    'jumptrading',
    'optiver',
    'imc',
    'sig',
    'akuna-capital',
    'tower-research-capital',
    'wolverine',
    'five-rings'
  ],
  
  tech: [
    // These DO work with Lever - confirmed working
    'spotify',
    'slack',
    'dropbox',
    'pinterest',
    'reddit',
    'shopify',
    'gitlab',
    'asana',
    'intercom',
    'segment',
    'framer',
    'notion',
    'brex',
    'chime',
    'robinhood',
    'coinbase',
    'kraken',
    'bitso',
    'mercadobitcoin'
  ]
};

export async function scrapeLeverJobs(industries: string[] = ['trading']) {
  const allJobs = [];
  
  // Build list of companies based on selected industries
  const companiesToScrape: string[] = [];
  for (const industry of industries) {
    if (COMPANY_LISTS[industry as keyof typeof COMPANY_LISTS]) {
      companiesToScrape.push(...COMPANY_LISTS[industry as keyof typeof COMPANY_LISTS]);
    }
  }
  
  const uniqueCompanies = [...new Set(companiesToScrape)];
  
  console.log(`🔍 Starting Lever job scraping for ${uniqueCompanies.length} companies...`);
  console.log(`Industries: ${industries.join(', ')}`);
  
  for (const company of uniqueCompanies) {
    try {
      console.log(`  Fetching ${company}...`);
      
      const response = await axios.get(
        `https://api.lever.co/v0/postings/${company}?mode=json`,
        {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        }
      );
      
      const jobs = response.data as LeverJob[];
      
      // Filter for engineering/tech roles
      const engineeringJobs = jobs.filter(job => {
        const team = job.categories.team?.toLowerCase() || '';
        const title = job.text.toLowerCase();
        
        return (
          team.includes('engineer') ||
          team.includes('technology') ||
          team.includes('software') ||
          team.includes('tech') ||
          team.includes('developer') ||
          title.includes('engineer') ||
          title.includes('developer') ||
          title.includes('software') ||
          title.includes('sde') ||
          title.includes('backend') ||
          title.includes('frontend') ||
          title.includes('fullstack')
        );
      });
      
      // Determine industry for this company
      let industry = 'other';
      if (COMPANY_LISTS.trading.includes(company)) industry = 'trading';
      if (COMPANY_LISTS.tech.includes(company)) industry = 'tech';
      
      // Transform to our job format
      const transformedJobs = engineeringJobs.map(job => ({
        id: `lever-${company}-${job.id}`,
        title: job.text,
        company: formatCompanyName(company),
        location: job.categories.location || 'Not specified',
        remote: determineRemoteStatus(job.categories.location || ''),
        salary: 'Competitive',
        experience_level: determineExperienceLevel(job.text),
        job_type: job.categories.commitment || 'Full-time',
        description: stripHtml(job.description).substring(0, 500),
        requirements: extractRequirements(job.description),
        tech: extractTechStack(job.description),
        benefits: ['Competitive salary', 'Health insurance', 'Professional development'],
        about: `${formatCompanyName(company)} is a leading ${industry} company.`,
        industry: industry,
        source: 'lever',
        apply_url: job.applyUrl || job.hostedUrl,
        posted_at: new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        is_active: true
      }));
      
      allJobs.push(...transformedJobs);
      console.log(`  ✅ Found ${transformedJobs.length} jobs at ${company}`);
      
      // Rate limiting - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`  ❌ Failed to fetch ${company}: ${error}`);
    }
  }
  
  console.log(`\n✅ Total jobs scraped: ${allJobs.length}`);
  return allJobs;
}

function formatCompanyName(slug: string): string {
  const names: Record<string, string> = {
    // Trading
    'janestreet': 'Jane Street',
    'hudsonrivertrading': 'Hudson River Trading',
    'jumptrading': 'Jump Trading',
    'optiver': 'Optiver',
    'imc': 'IMC Trading',
    'sig': 'Susquehanna International Group',
    'akuna-capital': 'Akuna Capital',
    'tower-research-capital': 'Tower Research Capital',
    'wolverine': 'Wolverine Trading',
    'five-rings': 'Five Rings',
    
    // Tech
    'spotify': 'Spotify',
    'slack': 'Slack',
    'dropbox': 'Dropbox',
    'pinterest': 'Pinterest',
    'reddit': 'Reddit',
    'shopify': 'Shopify',
    'gitlab': 'GitLab',
    'asana': 'Asana',
    'intercom': 'Intercom',
    'segment': 'Segment',
    'framer': 'Framer',
    'notion': 'Notion',
    'brex': 'Brex',
    'chime': 'Chime',
    'robinhood': 'Robinhood',
    'coinbase': 'Coinbase',
    'kraken': 'Kraken',
    'bitso': 'Bitso',
    'mercadobitcoin': 'Mercado Bitcoin'
  };
  
  return names[slug] || slug.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

function determineRemoteStatus(location: string): string {
  const loc = location.toLowerCase();
  if (loc.includes('remote')) return 'Full Remote';
  if (loc.includes('hybrid')) return 'Hybrid';
  return 'On-site';
}

function determineExperienceLevel(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('senior') || t.includes('lead') || t.includes('staff')) return 'Senior';
  if (t.includes('junior') || t.includes('entry') || t.includes('graduate')) return 'Entry-level';
  if (t.includes('intern')) return 'Internship';
  return 'Mid-level';
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractRequirements(description: string): string[] {
  const text = stripHtml(description).toLowerCase();
  const requirements: string[] = [];
  
  if (text.includes('bachelor') || text.includes('degree')) {
    requirements.push('Bachelor\'s degree in Computer Science or related field');
  }
  if (text.includes('year') && text.includes('experience')) {
    const match = text.match(/(\d+)\+?\s*years?/);
    if (match) {
      requirements.push(`${match[1]}+ years of experience`);
    }
  }
  if (text.includes('python')) requirements.push('Python programming');
  if (text.includes('c++')) requirements.push('C++ programming');
  if (text.includes('java')) requirements.push('Java programming');
  if (text.includes('algorithm')) requirements.push('Algorithm design');
  
  return requirements.length > 0 ? requirements : ['Strong programming skills', 'Problem solving', 'Team collaboration'];
}

function extractTechStack(description: string): string[] {
  const text = stripHtml(description).toLowerCase();
  const tech: string[] = [];
  
  const technologies = [
    'Python', 'C++', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js',
    'Kubernetes', 'Docker', 'AWS', 'Linux', 'PostgreSQL', 'Redis', 'Kafka',
    'Go', 'Rust', 'Scala', 'OCaml', 'Haskell', 'C#', '.NET', 'Ruby', 'PHP',
    'MongoDB', 'MySQL', 'GraphQL'
  ];
  
  technologies.forEach(t => {
    if (text.includes(t.toLowerCase())) {
      tech.push(t);
    }
  });
  
  return tech.length > 0 ? tech.slice(0, 5) : ['Python', 'Linux'];
}