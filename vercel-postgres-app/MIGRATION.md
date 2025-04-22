# Vercel PostgreSQL Migration Guide

This document provides detailed information about the changes made to adapt the Interview Question Allocation application for Vercel PostgreSQL deployment.

## Key Changes

1. **Database Implementation**
   - Replaced SQLite/Cloudflare D1 with Vercel PostgreSQL
   - Created new database access layer in `src/lib/db-postgres.js`
   - Modified all API routes to use PostgreSQL queries

2. **Environment Variables**
   - Application requires Vercel PostgreSQL environment variables:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

3. **Database Initialization**
   - Added `/api/import-sample` endpoint to initialize database and import sample data
   - Created database schema with tables for competencies, questions, sessions, teams, allocations, and configurations

4. **Dependencies**
   - Added `@vercel/postgres` and `pg` packages
   - Configured Next.js to work with PostgreSQL

## SQL Schema Changes

The PostgreSQL schema uses `SERIAL` for auto-incrementing IDs instead of SQLite's `INTEGER PRIMARY KEY AUTOINCREMENT`.

```sql
CREATE TABLE IF NOT EXISTS competencies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  competency_id INTEGER REFERENCES competencies(id),
  question_text TEXT NOT NULL,
  follow_up TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS interview_sessions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS interview_teams (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES interview_sessions(id),
  name TEXT NOT NULL,
  members TEXT
);

CREATE TABLE IF NOT EXISTS question_allocations (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES interview_sessions(id),
  team_id INTEGER REFERENCES interview_teams(id),
  question_id INTEGER REFERENCES questions(id),
  competency_id INTEGER REFERENCES competencies(id)
);

CREATE TABLE IF NOT EXISTS saved_configurations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  configuration_data TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Query Changes

- Changed from SQLite parameter style (`?`) to PostgreSQL style (`$1`, `$2`, etc.)
- Updated all SQL queries to use PostgreSQL syntax
- Used the `sql` template literal from `@vercel/postgres` for database initialization

## Deployment Verification

After deploying to Vercel, verify the setup by:

1. Checking the `/api/deploy-status` endpoint to confirm database connectivity
2. Visiting `/api/import-sample` to initialize the database
3. Confirming data was imported by checking `/api/competencies` and `/api/questions`
