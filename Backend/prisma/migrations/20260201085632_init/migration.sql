/*
  Warnings:

  - You are about to drop the column `resumeUrl` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `candidate_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `resumeUrl` on the `candidate_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `hr_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `university_profiles` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InternshipRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InternshipStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('AVATAR', 'LOGO', 'RESUME', 'PORTFOLIO', 'DOCUMENT', 'IMAGE', 'VIDEO', 'AUDIO');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'DELETED');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MODERATOR';

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "resumeUrl",
ADD COLUMN     "resumeId" TEXT;

-- AlterTable
ALTER TABLE "candidate_profiles" DROP COLUMN "avatarUrl",
DROP COLUMN "resumeUrl",
ADD COLUMN     "avatarId" TEXT;

-- AlterTable
ALTER TABLE "hr_profiles" DROP COLUMN "avatarUrl",
ADD COLUMN     "avatarId" TEXT;

-- AlterTable
ALTER TABLE "university_profiles" DROP COLUMN "logoUrl",
ADD COLUMN     "logoId" TEXT;

-- CreateTable
CREATE TABLE "media_files" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "objectName" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'UPLOADING',
    "metadata" JSONB,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "objective" TEXT,
    "skills" JSONB,
    "experiences" JSONB,
    "educations" JSONB,
    "projects" JSONB,
    "achievements" JSONB,
    "languages" JSONB,
    "certifications" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_views" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "phone" TEXT,
    "avatarId" TEXT,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderator_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "phone" TEXT,
    "avatarId" TEXT,
    "permissions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "moderator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_internship_requests" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "studentCount" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "requirements" TEXT,
    "skills" JSONB,
    "location" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "status" "InternshipRequestStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "university_internship_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_notifications" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "hrId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internship_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internships" (
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
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "status" "InternshipStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "applicationsCount" INTEGER NOT NULL DEFAULT 0,
    "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "moderatedAt" TIMESTAMP(3),
    "moderatorId" TEXT,
    "moderationNotes" TEXT,
    "skills" JSONB,
    "tags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_applications" (
    "id" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "hrId" TEXT NOT NULL,
    "resumeId" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "coverLetter" TEXT,
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "internship_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_participants" (
    "id" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "hrId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "feedback" TEXT,
    "rating" INTEGER,

    CONSTRAINT "internship_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "internship_skills" (
    "id" TEXT NOT NULL,
    "internshipId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "level" INTEGER,

    CONSTRAINT "internship_skills_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_files_type_idx" ON "media_files"("type");

-- CreateIndex
CREATE INDEX "media_files_status_idx" ON "media_files"("status");

-- CreateIndex
CREATE INDEX "media_files_uploadedBy_idx" ON "media_files"("uploadedBy");

-- CreateIndex
CREATE INDEX "media_files_createdAt_idx" ON "media_files"("createdAt");

-- CreateIndex
CREATE INDEX "resumes_candidateId_idx" ON "resumes"("candidateId");

-- CreateIndex
CREATE INDEX "resumes_isDefault_idx" ON "resumes"("isDefault");

-- CreateIndex
CREATE INDEX "resumes_isPublic_idx" ON "resumes"("isPublic");

-- CreateIndex
CREATE INDEX "job_views_jobId_idx" ON "job_views"("jobId");

-- CreateIndex
CREATE INDEX "job_views_userId_idx" ON "job_views"("userId");

-- CreateIndex
CREATE INDEX "job_views_viewedAt_idx" ON "job_views"("viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "job_views_jobId_userId_key" ON "job_views"("jobId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_userId_key" ON "admin_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "moderator_profiles_userId_key" ON "moderator_profiles"("userId");

-- CreateIndex
CREATE INDEX "university_internship_requests_universityId_idx" ON "university_internship_requests"("universityId");

-- CreateIndex
CREATE INDEX "university_internship_requests_status_idx" ON "university_internship_requests"("status");

-- CreateIndex
CREATE INDEX "university_internship_requests_specialty_idx" ON "university_internship_requests"("specialty");

-- CreateIndex
CREATE INDEX "university_internship_requests_startDate_idx" ON "university_internship_requests"("startDate");

-- CreateIndex
CREATE INDEX "internship_notifications_requestId_idx" ON "internship_notifications"("requestId");

-- CreateIndex
CREATE INDEX "internship_notifications_hrId_idx" ON "internship_notifications"("hrId");

-- CreateIndex
CREATE INDEX "internship_notifications_status_idx" ON "internship_notifications"("status");

-- CreateIndex
CREATE INDEX "internships_status_idx" ON "internships"("status");

-- CreateIndex
CREATE INDEX "internships_location_idx" ON "internships"("location");

-- CreateIndex
CREATE INDEX "internships_isRemote_idx" ON "internships"("isRemote");

-- CreateIndex
CREATE INDEX "internships_publishedAt_idx" ON "internships"("publishedAt");

-- CreateIndex
CREATE INDEX "internships_startDate_idx" ON "internships"("startDate");

-- CreateIndex
CREATE INDEX "internships_endDate_idx" ON "internships"("endDate");

-- CreateIndex
CREATE INDEX "internships_views_idx" ON "internships"("views");

-- CreateIndex
CREATE INDEX "internship_applications_status_idx" ON "internship_applications"("status");

-- CreateIndex
CREATE INDEX "internship_applications_appliedAt_idx" ON "internship_applications"("appliedAt");

-- CreateIndex
CREATE UNIQUE INDEX "internship_applications_internshipId_candidateId_key" ON "internship_applications"("internshipId", "candidateId");

-- CreateIndex
CREATE INDEX "internship_participants_status_idx" ON "internship_participants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "internship_participants_internshipId_candidateId_key" ON "internship_participants"("internshipId", "candidateId");

-- CreateIndex
CREATE UNIQUE INDEX "internship_skills_internshipId_skillId_key" ON "internship_skills"("internshipId", "skillId");

-- AddForeignKey
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr_profiles" ADD CONSTRAINT "hr_profiles_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_profiles" ADD CONSTRAINT "university_profiles_logoId_fkey" FOREIGN KEY ("logoId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_views" ADD CONSTRAINT "job_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderator_profiles" ADD CONSTRAINT "moderator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderator_profiles" ADD CONSTRAINT "moderator_profiles_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "media_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_internship_requests" ADD CONSTRAINT "university_internship_requests_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "university_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_internship_requests" ADD CONSTRAINT "university_internship_requests_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "hr_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_notifications" ADD CONSTRAINT "internship_notifications_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "university_internship_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_notifications" ADD CONSTRAINT "internship_notifications_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "hr_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "hr_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internships" ADD CONSTRAINT "internships_moderatorId_fkey" FOREIGN KEY ("moderatorId") REFERENCES "moderator_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "hr_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_applications" ADD CONSTRAINT "internship_applications_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_participants" ADD CONSTRAINT "internship_participants_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_participants" ADD CONSTRAINT "internship_participants_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidate_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_participants" ADD CONSTRAINT "internship_participants_hrId_fkey" FOREIGN KEY ("hrId") REFERENCES "hr_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_skills" ADD CONSTRAINT "internship_skills_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "internships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "internship_skills" ADD CONSTRAINT "internship_skills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
