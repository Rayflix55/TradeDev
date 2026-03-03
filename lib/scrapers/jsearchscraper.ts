import axios from 'axios';

const RAPIDAPI_HOST = 'jsearch.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

export interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city: string;
  job_country: string;
  job_is_remote: boolean;
  job_employment_type: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_description: string;
  job_apply_link: string;
  job_posted_at_datetime_utc: string;
  job_required_experience: {
    no_experience_required: boolean;
    required_experience_in_months: number;
  };
  job_highlights?: {
    Qualifications?: string[];
    Responsibilities?: string[];
    Benefits?: string[];
  };
}

// Tech companies to search for
const TECH_COMPANIES = [
  'Google',
  'Microsoft',
  'Amazon',
  'Meta',
  'Apple',
  'Netflix',
  'Uber',
  'Airbnb',
  'Spotify',
  'Slack',
  'Dropbox',
  'Pinterest',
  'Reddit',
  'Shopify',
  'GitLab',
  'Asana',
  'Salesforce',
  'Adobe',
  'Oracle',
  'IBM',
  'Intel',
  'Cisco',
  'VMware',
  'Twitter',
  'LinkedIn',
  'Snapchat',
  'TikTok',
  'Stripe',
  'Square',
  'PayPal'
];

// Trading companies (for later)
const TRADING_COMPANIES = [
  'Jane Street',
  'Hudson River Trading',
  'Jump Trading',
  'Optiver',
  'IMC Trading',
  'SIG',
  'Akuna Capital',
  'Tower Research',
  'Citadel',
  'Two Sigma'
];

export async function searchJobs(query: string, numPages: number = 1) {
  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      },
      params: {
        query: query,
        page: 1,
        num_pages: numPages,
        date_posted: 'week', // Last 7 days
        remote_jobs_only: false,
        employment_types: 'FULLTIME,INTERN,CONTRACTOR'
      }
    });
    
    return response.data.data || [];
  } catch (error) {
    console.error(`❌ JSearch API error for "${query}":`, error);
    return [];
  }
}

export async function scrapeTechJobs() {
  const allJobs = [];
  
  console.log('🔍 Searching for tech jobs across LinkedIn, Indeed, Glassdoor...');
  
  for (const company of TECH_COMPANIES) {
    try {
      console.log(`  Searching: ${company}...`);
      const jobs = await searchJobs(company);
      
      // Filter to ensure jobs are actually from this company
      const companyJobs = jobs.filter((job: JSearchJob) => 
        job.employer_name?.toLowerCase().includes(company.toLowerCase())
      );
      
      const transformedJobs = companyJobs.map((job: JSearchJob) => ({
        id: `jsearch-${job.job_id}`,
        title: job.job_title,
        company: job.employer_name,
        location: [job.job_city, job.job_country].filter(Boolean).join(', ') || 'Remote',
        remote: job.job_is_remote ? 'Remote' : 'On-site',
        salary: job.job_min_salary && job.job_max_salary 
          ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
          : 'Competitive',
        experience_level: determineExperienceLevel(job),
        job_type: job.job_employment_type || 'Full-time',
        description: job.job_description?.substring(0, 500) || '',
        requirements: extractRequirements(job),
        tech: extractTechStack(job.job_description || ''),
        benefits: job.job_highlights?.Benefits || [],
        about: `${job.employer_name} is a leading tech company.`,
        industry: 'tech',
        source: 'jsearch',
        apply_url: job.job_apply_link,
        posted_at: job.job_posted_at_datetime_utc || new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        is_active: true
      }));
      
      allJobs.push(...transformedJobs);
      console.log(`  ✅ Found ${transformedJobs.length} jobs at ${company}`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`  ❌ Failed to search ${company}: ${error}`);
    }
  }
  
  console.log(`\n✅ Total tech jobs found: ${allJobs.length}`);
  return allJobs;
}

export async function scrapeTradingJobs() {
  const allJobs = [];
  
  console.log('🔍 Searching for trading jobs across LinkedIn, Indeed, etc...');
  
  for (const company of TRADING_COMPANIES) {
    try {
      console.log(`  Searching: ${company}...`);
      const jobs = await searchJobs(company);
      
      const companyJobs = jobs.filter((job: JSearchJob) => 
        job.employer_name?.toLowerCase().includes(company.toLowerCase())
      );
      
      const transformedJobs = companyJobs.map((job: JSearchJob) => ({
        id: `jsearch-${job.job_id}`,
        title: job.job_title,
        company: job.employer_name,
        location: [job.job_city, job.job_country].filter(Boolean).join(', ') || 'Remote',
        remote: job.job_is_remote ? 'Remote' : 'On-site',
        salary: job.job_min_salary && job.job_max_salary 
          ? `$${job.job_min_salary.toLocaleString()} - $${job.job_max_salary.toLocaleString()}`
          : 'Competitive',
        experience_level: determineExperienceLevel(job),
        job_type: job.job_employment_type || 'Full-time',
        description: job.job_description?.substring(0, 500) || '',
        requirements: extractRequirements(job),
        tech: extractTechStack(job.job_description || ''),
        benefits: job.job_highlights?.Benefits || [],
        about: `${job.employer_name} is a leading trading firm.`,
        industry: 'trading',
        source: 'jsearch',
        apply_url: job.job_apply_link,
        posted_at: job.job_posted_at_datetime_utc || new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        is_active: true
      }));
      
      allJobs.push(...transformedJobs);
      console.log(`  ✅ Found ${transformedJobs.length} jobs at ${company}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`  ❌ Failed to search ${company}: ${error}`);
    }
  }
  
  console.log(`\n✅ Total trading jobs found: ${allJobs.length}`);
  return allJobs;
}

function determineExperienceLevel(job: JSearchJob): string {
  if (job.job_required_experience?.no_experience_required) return 'Entry-level';
  const months = job.job_required_experience?.required_experience_in_months || 0;
  if (months < 12) return 'Entry-level';
  if (months < 36) return 'Mid-level';
  if (months < 60) return 'Senior';
  return 'Senior';
}

function extractRequirements(job: JSearchJob): string[] {
  const requirements: string[] = [];
  
  if (job.job_highlights?.Qualifications) {
    requirements.push(...job.job_highlights.Qualifications.slice(0, 3));
  }
  
  if (job.job_required_experience?.required_experience_in_months) {
    const years = job.job_required_experience.required_experience_in_months / 12;
    requirements.push(`${years.toFixed(0)}+ years experience`);
  }
  
  return requirements.length > 0 ? requirements : ['See job description'];
}

function extractTechStack(description: string): string[] {
  const text = description.toLowerCase();
  const tech: string[] = [];
  
  const technologies = [
    'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'Java',
    'C++', 'Go', 'Rust', 'AWS', 'Docker', 'Kubernetes', 'SQL',
    'MongoDB', 'PostgreSQL', 'GraphQL', 'REST', 'Git', 'Linux'
  ];
  
  technologies.forEach(t => {
    if (text.includes(t.toLowerCase())) {
      tech.push(t);
    }
  });
  
  return tech.length > 0 ? tech.slice(0, 5) : [];
}