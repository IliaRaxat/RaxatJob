-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('HR', 'CANDIDATE', 'UNIVERSITY', 'ADMIN', 'ANALYST');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('ACTIVE', 'PAUSED', 'CLOSED', 'DRAFT', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED', 'INTERVIEW_SCHEDULED', 'HIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'JUNIOR', 'MIDDLE', 'SENIOR', 'LEAD', 'EXPERT');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('USER_LOGIN', 'USER_REGISTER', 'JOB_CREATED', 'JOB_UPDATED', 'JOB_VIEWED', 'APPLICATION_CREATED', 'APPLICATION_UPDATED', 'PROFILE_UPDATED', 'SKILL_ADDED', 'SKILL_UPDATED', 'SEARCH_PERFORMED', 'MATCH_FOUND', 'INTERVIEW_SCHEDULED', 'HIRE_COMPLETED');

-- CreateEnum
CREATE TYPE "AIProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRY');

-- CreateEnum
CREATE TYPE "AIModelType" AS ENUM ('RESUME_PARSING', 'SKILL_EXTRACTION', 'JOB_MATCHING', 'CANDIDATE_RANKING', 'SALARY_PREDICTION', 'SKILL_GAP_ANALYSIS', 'TEXT_ANALYSIS', 'SENTIMENT_ANALYSIS');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EMAIL', 'SMS', 'PUSH', 'IN_APP', 'SYSTEM');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DRAFT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "loginCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hr_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "location" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "resumeUrl" TEXT,
    "linkedinUrl" TEXT,
    "githubUrl" TEXT,
    "portfolioUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "expectedSalary" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "university_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "yearOfStudy" INTEGER NOT NULL,
    "major" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_skills" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "student_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiences" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "educations" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT,
    "universityId" TEXT,
    "degree" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "gpa" DOUBLE PRECISION,
    "description" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "hrId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "responsibilities" TEXT,
    "benefits" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "location" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'ACTIVE',
    "experienceLevel" "ExperienceLevel" NOT NULL,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "applicationsCount" INTEGER NOT NULL DEFAULT 0,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedAt" TIMESTAMP(3),
    "moderatorId" TEXT,
    "moderationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_skills" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "level" INTEGER,

    CONSTRAINT "job_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "hrId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "coverLetter" TEXT,
    "resumeUrl" TEXT,
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" "EventType" NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_processing" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "modelType" "AIModelType" NOT NULL,
    "status" "AIProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "inputData" JSONB,
    "outputData" JSONB,
    "confidence" DOUBLE PRECISION,
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "processingTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ai_processing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_matches" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,
    "skillMatch" DOUBLE PRECISION NOT NULL,
    "experienceMatch" DOUBLE PRECISION NOT NULL,
    "locationMatch" DOUBLE PRECISION NOT NULL,
    "salaryMatch" DOUBLE PRECISION NOT NULL,
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_analytics" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "totalCandidates" INTEGER NOT NULL DEFAULT 0,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "averageLevel" DOUBLE PRECISION,
    "demandScore" DOUBLE PRECISION,
    "salaryImpact" DOUBLE PRECISION,
    "trendDirection" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_analytics" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "activeJobs" INTEGER NOT NULL DEFAULT 0,
    "totalApplications" INTEGER NOT NULL DEFAULT 0,
    "hireRate" DOUBLE PRECISION,
    "averageTimeToHire" INTEGER,
    "averageSalary" DOUBLE PRECISION,
    "topSkills" JSONB,
    "employeeRetention" DOUBLE PRECISION,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_analytics" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "studentsWithSkills" INTEGER NOT NULL DEFAULT 0,
    "placementRate" DOUBLE PRECISION,
    "averageSalary" DOUBLE PRECISION,
    "topEmployers" JSONB,
    "skillDistribution" JSONB,
    "employmentTrends" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "university_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelType" "AIModelType" NOT NULL,
    "template" TEXT NOT NULL,
    "parameters" JSONB,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_logs" (
    "id" TEXT NOT NULL,
    "modelType" "AIModelType" NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "cost" DOUBLE PRECISION,
    "responseTime" INTEGER,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "requestData" JSONB,
    "responseData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_lastLogin_idx" ON "users"("lastLogin");

-- CreateIndex
CREATE UNIQUE INDEX "hr_profiles_userId_key" ON "hr_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_profiles_userId_key" ON "candidate_profiles"("userId");

-- CreateIndex
CREATE INDEX "candidate_profiles_isAvailable_idx" ON "candidate_profiles"("isAvailable");

-- CreateIndex
CREATE UNIQUE INDEX "university_profiles_userId_key" ON "university_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_skills_candidateId_skillId_key" ON "candidate_skills"("candidateId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "student_skills_studentId_skillId_key" ON "student_skills"("studentId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE INDEX "skills_category_idx" ON "skills"("category");

-- CreateIndex
CREATE INDEX "skills_isActive_idx" ON "skills"("isActive");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_type_idx" ON "jobs"("type");

-- CreateIndex
CREATE INDEX "jobs_experienceLevel_idx" ON "jobs"("experienceLevel");

-- CreateIndex
CREATE INDEX "jobs_location_idx" ON "jobs"("location");

-- CreateIndex
CREATE INDEX "jobs_remote_idx" ON "jobs"("remote");

-- CreateIndex
CREATE INDEX "jobs_publishedAt_idx" ON "jobs"("publishedAt");

-- CreateIndex
CREATE INDEX "jobs_views_idx" ON "jobs"("views");

-- CreateIndex
CREATE UNIQUE INDEX "job_skills_jobId_skillId_key" ON "job_skills"("jobId", "skillId");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE INDEX "applications_appliedAt_idx" ON "applications"("appliedAt");

-- CreateIndex
CREATE UNIQUE INDEX "applications_jobId_candidateId_key" ON "applications"("jobId", "candidateId");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- CreateIndex
CREATE INDEX "analytics_events_entityId_idx" ON "analytics_events"("entityId");

-- CreateIndex
CREATE INDEX "ai_processing_entityId_idx" ON "ai_processing"("entityId");

-- CreateIndex
CREATE INDEX "ai_processing_modelType_idx" ON "ai_processing"("modelType");

-- CreateIndex
CREATE INDEX "ai_processing_status_idx" ON "ai_processing"("status");

-- CreateIndex
CREATE INDEX "ai_processing_createdAt_idx" ON "ai_processing"("createdAt");

-- CreateIndex
CREATE INDEX "job_matches_matchScore_idx" ON "job_matches"("matchScore");

-- CreateIndex
CREATE INDEX "job_matches_isRecommended_idx" ON "job_matches"("isRecommended");

-- CreateIndex
CREATE UNIQUE INDEX "job_matches_jobId_candidateId_key" ON "job_matches"("jobId", "candidateId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_scheduledAt_idx" ON "notifications"("scheduledAt");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_idx" ON "audit_logs"("entityType");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "skill_analytics_demandScore_idx" ON "skill_analytics"("demandScore");

-- CreateIndex
CREATE UNIQUE INDEX "skill_analytics_skillId_key" ON "skill_analytics"("skillId");

-- CreateIndex
CREATE INDEX "company_analytics_hireRate_idx" ON "company_analytics"("hireRate");

-- CreateIndex
CREATE UNIQUE INDEX "company_analytics_companyName_key" ON "company_analytics"("companyName");

-- CreateIndex
CREATE UNIQUE INDEX "university_analytics_universityId_key" ON "university_analytics"("universityId");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE INDEX "ai_templates_modelType_idx" ON "ai_templates"("modelType");

-- CreateIndex
CREATE INDEX "ai_templates_isActive_idx" ON "ai_templates"("isActive");

-- CreateIndex
CREATE INDEX "ai_logs_modelType_idx" ON "ai_logs"("modelType");

-- CreateIndex
CREATE INDEX "ai_logs_success_idx" ON "ai_logs"("success");

-- CreateIndex
CREATE INDEX "ai_logs_createdAt_idx" ON "ai_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "hr_profiles" ADD CONSTRAINT "hr_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_profiles" ADD CONSTRAINT "university_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "university_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_skills" ADD CONSTRAINT "student_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiences" ADD CONSTRAINT "experiences_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educations" ADD CONSTRAINT "educations_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "educations" ADD CONSTRAINT "educations_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "university_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "hr_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_skills" ADD CONSTRAINT "job_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "hr_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_analytics" ADD CONSTRAINT "skill_analytics_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_analytics" ADD CONSTRAINT "university_analytics_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "university_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
