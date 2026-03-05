import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scrapeJobs } from '@/lib/scrapers';  // 👈 Changed this

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export async function GET(request: NextRequest) {
  // Allow Vercel Cron OR Bearer token
  const authHeader = request.headers.get('authorization');
  const cronSecret = request.headers.get('x-vercel-cron-secret');
  const secret = process.env.SCRAPER_SECRET || 'dev-secret-123';
  
  const isAuthorized = 
    authHeader === `Bearer ${secret}` || 
    cronSecret === process.env.CRON_SECRET;
  
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🚀 Starting job scraping...');
    
    // Get categories from query params
    const { searchParams } = new URL(request.url);
    const categoriesParam = searchParams.get('categories') || 'tech';
    const categories = categoriesParam.split(',');
    
    // Scrape jobs
    const jobs = await scrapeJobs(categories);
    
    if (jobs.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No jobs found',
        jobsScraped: 0
      });
    }
    
    // Save to database
    console.log('💾 Saving jobs to database...');
    
    const { error } = await supabase
      .from('jobs')
      .upsert(jobs, {
        onConflict: 'id',
        ignoreDuplicates: true
      });
    
    if (error) {
  // Don't fail the whole scrape for duplicates
  if (error.code === '23505') {
    console.log('⚠️ Some duplicate jobs skipped');
  } else {
    console.error('Database error:', error);
    throw error;
  }
}
    
    console.log('✅ Jobs saved successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Jobs scraped and saved',
      jobsScraped: jobs.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (err) {
    console.error('Scraping error:', err);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Scraping failed',
        message: err instanceof Error ? err.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}