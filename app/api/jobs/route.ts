import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const industry = searchParams.get('industry') || 'trading';
  const location = searchParams.get('location') || '';
  const experience = searchParams.get('experience') || '';
  const type = searchParams.get('type') || '';
  const remote = searchParams.get('remote') === 'true';
  const search = searchParams.get('search') || '';
  
  try {
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('posted_at', { ascending: false })
      // .limit(500); // Optional: limit results for performance
    
    if (industry !== 'all') {
      query = query.eq('industry', industry);
    }
    
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    
    if (experience) {
      query = query.eq('experience_level', experience);
    }
    
    if (type) {
      query = query.eq('job_type', type);
    }
    
    if (remote) {
      query = query.or('remote.ilike.%remote%,remote.ilike.%hybrid%');
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,company.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json([], { status: 200 });
    }
    
    return NextResponse.json(data || [], { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}