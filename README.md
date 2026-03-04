# 🚀 TradeDev - Developer Jobs Platform

A modern, AI-powered job search platform specifically designed for developers seeking positions at top tech and trading companies. Built with Next.js, TypeScript, and powered by real-time job data from multiple sources.

![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

## 🌟 Live Demo

**[https://tradedevpro.vercel.app](https://tradedevpro.vercel.app)**

---

## ✨ Features

### 🔍 Smart Job Search
- **Multi-source aggregation**: Jobs from LinkedIn, Indeed, Glassdoor, and more
- **Real-time updates**: Fresh job listings updated automatically
- **Advanced filtering**: By industry, location, experience level, remote status
- **Tech stack matching**: Filter by programming languages and technologies

### 💼 Job Categories
- **Tech Companies**: Google, Microsoft, Amazon, Meta, Apple, Netflix, Uber, Airbnb, and 30+ more
- **Trading Firms**: Jane Street, Citadel, HRT, Jump Trading, Optiver, Two Sigma, and more
- **Role Types**: Frontend, Backend, Full Stack, DevOps, ML Engineer

### 🎯 Developer-Focused Features
- Save jobs for later review
- Track your applications
- One-click apply to company career pages
- Resume upload and management (coming soon)
- AI-powered auto-apply (coming soon)

### 🎨 Modern UI/UX
- Dark mode interface optimized for developers
- Responsive design (mobile, tablet, desktop)
- Fast loading with optimized performance
- Intuitive search and filtering

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (ready)
- **APIs**: JSearch API (RapidAPI), Lever API
- **Caching**: Server-side caching

### Job Scraping
- **Sources**: 
  - JSearch API (LinkedIn, Indeed, Glassdoor, ZipRecruiter, etc.)
  - Lever API (direct company postings)
- **Scheduling**: Manual trigger (auto-cron coming soon)
- **Rate Limiting**: Built-in to respect API limits

---

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account (free tier works)
- RapidAPI account for JSearch API

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Rayflix55/TradeDev.git
cd TradeDev
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Job Scraping
RAPIDAPI_KEY=your-rapidapi-key
SCRAPER_SECRET=your-secret-key-for-scraper-endpoint
```

### 4. Set Up Database

Run this SQL in your Supabase SQL Editor:
```sql
-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  remote TEXT,
  salary TEXT,
  experience_level TEXT,
  job_type TEXT,
  description TEXT,
  requirements JSONB,
  tech JSONB,
  benefits JSONB,
  about TEXT,
  industry TEXT DEFAULT 'tech',
  source TEXT,
  apply_url TEXT NOT NULL,
  posted_at TIMESTAMP DEFAULT NOW(),
  scraped_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT unique_job UNIQUE(id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_industry ON jobs(industry);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);

-- User profiles (for saved jobs and applications)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  resume_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Saved jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
  user_id UUID NOT NULL,
  job_id TEXT NOT NULL,
  saved_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, job_id)
);

-- Applications tracking
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id TEXT NOT NULL,
  status TEXT DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_application UNIQUE(user_id, job_id)
);
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
```bash
npm run build
npm start
```

---

## 🔧 Configuration

### Scraping Jobs Manually

Trigger the job scraper via API:
```bash
curl -H "Authorization: Bearer YOUR_SCRAPER_SECRET" \
  "https://tradedevpro.vercel.app/api/scrape?categories=tech"
```

### Available Categories
- `tech` - Tech companies (Google, Microsoft, etc.)
- `trading` - Trading firms (Jane Street, Citadel, etc.)
- Multiple: `?categories=tech,trading`

---

## 📁 Project Structure
```
TradeDev/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main homepage
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles
│   └── api/                 # API routes
│       ├── jobs/            # Get jobs endpoint
│       ├── scrape/          # Trigger scraper
│       ├── applications/    # Track applications
│       └── saved-jobs/      # Save jobs
├── lib/                     # Utilities and helpers
│   └── scrapers/            # Job scraping logic
│       ├── index.ts         # Main scraper export
│       ├── jsearchscraper.ts # JSearch API scraper
│       └── leverScraper.ts  # Lever API scraper
├── public/                  # Static assets
├── .env.local              # Environment variables (not committed)
├── vercel.json             # Vercel configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript config
```

---

## 🔑 API Endpoints

### Public Endpoints

#### GET `/api/jobs`
Fetch jobs with optional filters.

**Query Parameters:**
- `industry` - Filter by industry (`tech`, `trading`, `all`)
- `location` - Filter by location
- `experience` - Filter by experience level
- `remote` - Filter remote jobs (`true`/`false`)
- `search` - Search query

**Example:**
```bash
GET /api/jobs?industry=tech&remote=true&experience=Mid-level
```

### Protected Endpoints

#### GET `/api/scrape`
Trigger job scraping (requires authorization).

**Headers:**
```
Authorization: Bearer YOUR_SCRAPER_SECRET
```

**Query Parameters:**
- `categories` - Comma-separated categories (`tech`, `trading`)

**Example:**
```bash
curl -H "Authorization: Bearer secret123" \
  "https://tradedevpro.vercel.app/api/scrape?categories=tech,trading"
```

---

## 🎨 Customization

### Adding More Companies

Edit `lib/scrapers/jsearchscraper.ts`:
```typescript
const TECH_COMPANIES = [
  'Google',
  'Microsoft',
  'YourCompany', // Add here
  // ...
];
```

### Adding More Job Roles
```typescript
const JOB_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Your Custom Role', // Add here
  // ...
];
```

### Changing Scraping Frequency

Currently manual. To add auto-scraping:
1. Set up Vercel Cron Jobs
2. Or use GitHub Actions
3. Or use external services like Zapier/n8n

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Import Project"
- Select your GitHub repo
- Add environment variables
- Deploy!

3. **Add Environment Variables in Vercel**
- Go to Project Settings → Environment Variables
- Add all variables from `.env.local`
- Redeploy

### Alternative Deployment Options
- **Netlify**: Similar to Vercel
- **Railway**: Full-stack hosting
- **Self-hosted**: Use PM2 or Docker

---

## 📊 Performance

- **Page Load**: < 1s (optimized static generation)
- **Job Search**: < 500ms (server-side filtering)
- **Database Queries**: Indexed for fast lookups
- **API Calls**: Cached to reduce load

---

## 🛣️ Roadmap

### Phase 1: Core Features ✅
- [x] Job aggregation from multiple sources
- [x] Search and filtering
- [x] Save jobs functionality
- [x] Application tracking
- [x] Responsive UI

### Phase 2: Enhanced Features 🚧
- [ ] User authentication (Supabase Auth)
- [ ] Email job alerts
- [ ] Advanced search (salary range, benefits)
- [ ] Company reviews and ratings
- [ ] Automated job scraping (cron jobs)

### Phase 3: Premium Features 🔮
- [ ] AI-powered resume optimization
- [ ] Auto-apply to jobs with AI cover letters
- [ ] Interview preparation resources
- [ ] Salary negotiation tips
- [ ] Job matching algorithm
- [ ] Premium tier for unlimited applications

### Phase 4: Business Features 💼
- [ ] Company job posting dashboard
- [ ] Recruiter accounts
- [ ] Analytics for employers
- [ ] Sponsored job listings
- [ ] API for third-party integrations

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **JSearch API** (RapidAPI) for job data aggregation
- **Supabase** for backend infrastructure
- **Vercel** for hosting and deployment
- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for beautiful icons

---

## 📧 Contact

**Developer**: Rayflix  
**GitHub**: [@Rayflix55](https://github.com/Rayflix55)  
**Website**: [tradedevpro.vercel.app](https://tradedevpro.vercel.app)

---

## 💡 Support

If you find this project helpful, please give it a ⭐ on GitHub!

For issues and feature requests, please use the [GitHub Issues](https://github.com/Rayflix55/TradeDev/issues) page.

---

**Built with ❤️ for developers by developers**