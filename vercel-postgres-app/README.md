# Interview Question Allocation Application - Vercel PostgreSQL Version

This is a modified version of the Interview Question Allocation application specifically optimized for deployment on Vercel with PostgreSQL database integration.

## Key Features

1. **Question Bank Management**: Add, edit, delete, and import interview questions organized by competency
2. **Interview Team Setup**: Define interviewers and create interview teams (individual or paired)
3. **Competency Selection**: Select which competencies to assess in the interview
4. **Question Allocation**: Allocate questions to interview teams with validation (5-20 questions per team)
5. **Export Functionality**: Generate Excel interview guides with instructions and space for responses
6. **Configuration Saving**: Save interview configurations for future use

## Vercel Deployment Instructions

### Prerequisites
- A GitHub account
- A Vercel account (you can sign up with your GitHub account)

### Step 1: Set Up GitHub Repository
1. Create a new repository on GitHub
2. Upload these files to your repository (or use GitHub Desktop as described in previous instructions)

### Step 2: Deploy on Vercel
1. Go to [Vercel](https://vercel.com/) and sign in with your GitHub account
2. Click "Add New" > "Project"
3. Find and select your repository
4. In the configuration screen:
   - Framework Preset: Select "Next.js"
   - Root Directory: Leave as default (/)
   - Build Command: Leave as default (npm run build)
   - Output Directory: Leave as default (.next)
5. Click "Deploy"

### Step 3: Set Up PostgreSQL Database
1. After deployment, go to your Vercel dashboard
2. Click on "Storage" in the left sidebar
3. Click "Create Database"
4. Select "PostgreSQL" as the database type
5. Choose a name for your database (e.g., "interview-allocation-db")
6. Select the region closest to your users
7. Click "Create"

### Step 4: Set Environment Variables
1. In your Vercel project settings, go to the "Environment Variables" tab
2. Add the environment variables provided by Vercel for your PostgreSQL database:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

### Step 5: Initialize the Database
1. After deployment and setting up environment variables, visit:
   `https://your-app-url/api/import-sample`
2. This will create the database tables and import sample data

## Using the Application

1. **Home Page**: Dashboard with options to create new interviews, manage questions, and load saved configurations
2. **Question Bank**: Interface to add, edit, delete, and import questions
3. **Interview Creation Wizard**:
   - Step 1: Set up interviewers and teams
   - Step 2: Select competencies to assess
   - Step 3: Allocate questions to teams
   - Step 4: Preview and export interview guides

## Technical Details

- Built with Next.js, React, and Tailwind CSS
- Uses Vercel PostgreSQL for database storage
- RESTful API endpoints for all operations
- Excel export functionality using ExcelJS
