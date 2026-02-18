import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = 'demo-user';
    
    const { error } = await supabase
      .from('saved_jobs')
      .insert({
        user_id: userId,
        job_id: body.jobId
      });
    
    if (error) console.error('Save error:', error);
    
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}