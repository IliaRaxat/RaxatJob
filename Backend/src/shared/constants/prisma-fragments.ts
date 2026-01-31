/**
 * Common Prisma query fragments to reduce duplication
 */

export const USER_SELECT_BASIC = {
  id: true,
  email: true,
  role: true,
} as const;

export const USER_SELECT_FULL = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  lastLogin: true,
  createdAt: true,
} as const;

export const HR_PROFILE_INCLUDE = {
  user: {
    select: USER_SELECT_BASIC,
  },
  jobs: {
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
    },
  },
} as const;

export const CANDIDATE_PROFILE_INCLUDE = {
  user: {
    select: USER_SELECT_BASIC,
  },
  skills: {
    include: {
      skill: true,
    },
  },
  experiences: {
    orderBy: { startDate: 'desc' as const },
  },
  educations: {
    orderBy: { startDate: 'desc' as const },
  },
  applications: {
    include: {
      job: {
        select: {
          id: true,
          title: true,
          status: true,
          hr: {
            select: {
              company: true,
            },
          },
        },
      },
    },
    orderBy: { appliedAt: 'desc' as const },
  },
} as const;

export const UNIVERSITY_PROFILE_INCLUDE = {
  user: {
    select: USER_SELECT_BASIC,
  },
  students: {
    include: {
      skills: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: { lastName: 'asc' as const },
  },
  educations: {
    orderBy: { startDate: 'desc' as const },
  },
} as const;

export const JOB_INCLUDE_BASIC = {
  hr: {
    select: {
      company: true,
      firstName: true,
      lastName: true,
    },
  },
  skills: {
    include: {
      skill: true,
    },
  },
} as const;

export const APPLICATION_INCLUDE_FULL = {
  job: {
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      type: true,
      hr: {
        select: {
          company: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
  candidate: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      bio: true,
      resumes: {
        where: { isDefault: true },
        select: {
          id: true,
          title: true,
          summary: true,
          objective: true,
          skills: true,
          experiences: true,
          educations: true,
          projects: true,
          achievements: true,
          languages: true,
          certifications: true,
          isDefault: true,
          isPublic: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      linkedinUrl: true,
      githubUrl: true,
      portfolioUrl: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  },
  hr: {
    select: {
      firstName: true,
      lastName: true,
      company: true,
    },
  },
} as const;
