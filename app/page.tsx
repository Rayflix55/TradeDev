'use client';

import React, { useState, useEffect } from 'react';
import { Search, Building2, MapPin, DollarSign, Briefcase, ExternalLink, BookmarkPlus, Clock, Filter, TrendingUp, Zap, RefreshCw, FileText, Upload, X, Loader2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  remote: string;
  type: string;
  salary: string;
  experience_level: string;
  posted_at: string;
  industry: string;
  apply_url: string;
  description: string;
  requirements: string[];
  about: string;
  tech: string[];
  benefits: string[];
  job_type?: string;
}

export default function TradingJobsFinder() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resume, setResume] = useState<File | null>(null);
  const [filters, setFilters] = useState({
    location: 'all',
    experience: 'all',
    type: 'all',
    industry: 'trading',
    remote: false
  });

  const fetchJobs = () => {
    // Trigger re-fetch by updating a state
    setLastUpdated(null);
  };

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          industry: filters.industry,
          location: filters.location !== 'all' ? filters.location : '',
          experience: filters.experience !== 'all' ? filters.experience : '',
          type: filters.type !== 'all' ? filters.type : '',
          remote: filters.remote.toString(),
          search: searchQuery
        });

        const response = await fetch(`/api/jobs?${queryParams}`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setJobs(data);
        } else {
          setJobs([]);
        }
        setLastUpdated(new Date());
    } catch (err) {
  console.error('Failed to fetch jobs:', err);
        setJobs([]);
        setLastUpdated(new Date());
      }
      setLoading(false);
    };

    loadJobs();
  }, [filters, searchQuery]);

  const filterJobs = (jobsList: Job[]) => {
    return jobsList.filter(job => {
      const matchesSearch = searchQuery === '' || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tech?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesLocation = filters.location === 'all' || 
        job.location.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesExperience = filters.experience === 'all' || 
        job.experience_level === filters.experience;
      
      const matchesType = filters.type === 'all' || 
        job.type === filters.type || job.job_type === filters.type;
      
      const matchesIndustry = filters.industry === 'all' || 
        job.industry === filters.industry;
      
      const matchesRemote = !filters.remote || 
        job.remote?.toLowerCase().includes('remote') || 
        job.remote?.toLowerCase().includes('hybrid');
      
      return matchesSearch && matchesLocation && matchesExperience && 
             matchesType && matchesIndustry && matchesRemote;
    });
  };

  const handleApply = async (job: Job) => {
    if (!appliedJobs.find(j => j.id === job.id)) {
      try {
        await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job.id,
            company: job.company,
            title: job.title
          })
        });
        
        setAppliedJobs([...appliedJobs, job]);
        window.open(job.apply_url, '_blank');
    } catch {
        console.error('Application tracking failed');
      }
    }
  };

  const handleSave = async (job: Job) => {
    if (!savedJobs.find(j => j.id === job.id)) {
      try {
        await fetch('/api/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id })
        });
        
        setSavedJobs([...savedJobs, job]);
    } catch {
        console.error('Save failed');
      }
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResume(file);
      setShowResumeModal(false);
    }
  };

  const filteredJobs = filterJobs(jobs);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <TrendingUp className="text-emerald-400" size={32} />
                <Zap className="absolute -top-1 -right-1 text-yellow-400" size={16} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TradeDev Pro</h1>
                <p className="text-slate-400 text-sm">AI-Powered Job Search & Auto-Apply</p>
              </div>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              {resume && (
                <div className="px-3 py-2 bg-emerald-500/20 text-emerald-300 rounded-lg flex items-center gap-2 text-sm">
                  <FileText size={16} />
                  Resume uploaded
                </div>
              )}
              <button
                onClick={() => setShowResumeModal(true)}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
              >
                <Upload size={16} />
                {resume ? 'Update Resume' : 'Upload Resume'}
              </button>
              <button
                onClick={fetchJobs}
                disabled={loading}
                className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Updating...' : 'Refresh'}
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-lg transition ${activeTab === 'search' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Search
              </button>
              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-lg transition ${activeTab === 'saved' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Saved ({savedJobs.length})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-4 py-2 rounded-lg transition ${activeTab === 'applications' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                Applied ({appliedJobs.length})
              </button>
            </div>
          </div>
          {lastUpdated && (
            <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
              <Clock size={12} />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'search' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <Filter size={20} className="text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">Filters</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                      <input
                        type="text"
                        placeholder="Role, company, tech..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
                    <select
                      value={filters.industry}
                      onChange={(e) => setFilters({...filters, industry: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="trading">Trading Firms (Default)</option>
                      <option value="tech">Tech Companies</option>
                      <option value="all">All Industries</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.remote}
                        onChange={(e) => setFilters({...filters, remote: e.target.checked})}
                        className="w-4 h-4 rounded"
                      />
                      Remote Only
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                    <select
                      value={filters.location}
                      onChange={(e) => setFilters({...filters, location: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Locations</option>
                      <option value="New York">New York</option>
                      <option value="Chicago">Chicago</option>
                      <option value="San Francisco">San Francisco</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Experience</label>
                    <select
                      value={filters.experience}
                      onChange={(e) => setFilters({...filters, experience: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="Entry-level">Entry Level</option>
                      <option value="Mid-level">Mid Level</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="text-sm text-slate-400 space-y-2">
                    <p className="font-medium text-white mb-3">Quick Stats</p>
                    <div className="flex justify-between">
                      <span>Total Jobs:</span>
                      <span className="text-emerald-400 font-medium">{filteredJobs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Applications:</span>
                      <span className="text-blue-400 font-medium">{appliedJobs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saved:</span>
                      <span className="text-yellow-400 font-medium">{savedJobs.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="animate-spin text-emerald-400 mx-auto mb-4" size={48} />
                    <p className="text-slate-400">Loading jobs from database...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 hover:border-emerald-500 transition cursor-pointer"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-white">{job.title}</h3>
                            {job.remote && job.remote !== 'On-site' && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                {job.remote}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-emerald-400 font-medium">
                            <Building2 size={16} />
                            <span>{job.company}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm whitespace-nowrap">
                          {job.experience_level}
                        </span>
                      </div>

                      <p className="text-slate-300 mb-4">{job.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.tech?.map((tech: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-sm">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-400 flex-wrap gap-2">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            <span>{job.salary}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{job.posted_at}</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(job);
                          }}
                          className="text-emerald-400 hover:text-emerald-300 transition"
                        >
                          <BookmarkPlus size={18} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredJobs.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                      <Search size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No jobs found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Saved Jobs</h2>
            {savedJobs.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700">
                <BookmarkPlus size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No saved jobs yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedJobs.map((job) => (
                  <div key={job.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-2">{job.title}</h3>
                    <p className="text-emerald-400 mb-3">{job.company}</p>
                    <button
                      onClick={() => handleApply(job)}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Your Applications</h2>
            {appliedJobs.length === 0 ? (
              <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700">
                <Briefcase size={48} className="mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map((job) => (
                  <div key={job.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-1">{job.title}</h3>
                    <p className="text-emerald-400">{job.company}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showResumeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowResumeModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full p-8 border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Upload Your Resume</h2>
              <button onClick={() => setShowResumeModal(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <label className="block">
              <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-emerald-500 transition cursor-pointer">
                <Upload className="mx-auto mb-4 text-slate-400" size={48} />
                <p className="text-white mb-2">Click to upload</p>
                <p className="text-slate-400 text-sm">PDF, DOC, DOCX (Max 5MB)</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </div>
            </label>
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedJob(null)}>
          <div className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-3">{selectedJob.title}</h2>
                  <div className="flex items-center gap-2 text-emerald-400 text-xl font-medium">
                    <Building2 size={20} />
                    <span>{selectedJob.company}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white text-2xl">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-3">About the Role</h3>
                <p className="text-slate-300">{selectedJob.description}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleApply(selectedJob)}
                  className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium flex items-center justify-center gap-2"
                >
                  <ExternalLink size={18} />
                  Apply Now
                </button>
                <button
                  onClick={() => handleSave(selectedJob)}
                  className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
                >
                  <BookmarkPlus size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}