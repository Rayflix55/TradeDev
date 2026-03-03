import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scrapeJobs } from '@/lib/scrapers';  // 👈 Changed this

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const secret = process.env.SCRAPER_SECRET || 'dev-secret-123';
  
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

 try {
  const url = new URL(request.url);
  const categoryParam = url.searchParams.get('categories');
  const categories = categoryParam ? categoryParam.split(',').map(c => c.trim()) : ['trading'];
  
  console.log('🚀 Starting job scraping...');
  console.log('📋 Categories:', categories);
  
  // Scrape jobs
  const jobs = await scrapeJobs(categories);
  console.log(`📊 Scraped ${jobs.length} jobs total`);
  
  if (jobs.length === 0) {
    return NextResponse.json({
      success: false,
      message: 'No jobs found',
      jobsScraped: 0,
      categories
    });
  }
  
  // Log first job as sample
  console.log('📄 Sample job:', {
    id: jobs[0]?.id,
    title: jobs[0]?.title,
    company: jobs[0]?.company
  });
  
  console.log('💾 Saving jobs to database...');
  
  // Try inserting one job at a time to isolate the error
  let successCount = 0;
  let errorCount = 0;
  
  for (const job of jobs) {
    const { error } = await supabase
      .from('jobs')
      .upsert(job, {
        onConflict: 'id',
        ignoreDuplicates: true
      });
    
    if (error) {
      errorCount++;
      console.error(`❌ Failed to save job ${job.id}:`, error.message);
    } else {
      successCount++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`✅ ${successCount} jobs saved, ${errorCount} errors`);
  
  return NextResponse.json({
    success: true,
    message: 'Jobs scraped and saved',
    jobsScraped: successCount,
    categories,
    timestamp: new Date().toISOString()
  });
  
} catch (error) {
  console.error('🔥 Scraping error:', error);
  return NextResponse.json(
    { 
      success: false, 
      error: 'Scraping failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    },
    { status: 500 }
  );
}
}