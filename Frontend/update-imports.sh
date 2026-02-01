#!/bin/bash

# Update imports from old structure to FSD structure

# Auth API
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/api/authApi['\"]|from '@/entities/user'|g" {} +
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*contexts/AuthContext['\"]|from '@/features/auth'|g" {} +

# Jobs API
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/api/jobsApi['\"]|from '@/entities/job'|g" {} +

# Users API
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/api/usersApi['\"]|from '@/entities/user'|g" {} +

# Students API
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/api/studentsApi['\"]|from '@/shared/api/studentsApi'|g" {} +

# Analytics API
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/api/analyticsApi['\"]|from '@/shared/api/analyticsApi'|g" {} +

# Resumes API
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/api/resumesApi['\"]|from '@/shared/api/resumesApi'|g" {} +

# Internships API
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/api/internshipsApi['\"]|from '@/shared/api/internshipsApi'|g" {} +

# Internship Requests API
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/api/internshipRequestsApi['\"]|from '@/shared/api/internshipRequestsApi'|g" {} +

# AI API
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/api/aiApi['\"]|from '@/shared/api/aiApi'|g" {} +

# Store
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/store['\"]|from '@/app/store'|g" {} +

# Auth slice
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i "s|from ['\"].*lib/slices/authSlice['\"]|from '@/app/store/slices/authSlice'|g" {} +

echo "Import paths updated successfully!"
