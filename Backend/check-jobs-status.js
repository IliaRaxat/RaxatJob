const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJobs() {
  try {
    console.log('Checking all jobs in database...\n');
    
    const allJobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        status: true,
        moderationStatus: true,
        createdAt: true,
        hr: {
          select: {
            company: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Total jobs in database: ${allJobs.length}\n`);
    
    if (allJobs.length > 0) {
      console.log('Jobs details:');
      allJobs.forEach((job, index) => {
        console.log(`\n${index + 1}. ${job.title}`);
        console.log(`   Company: ${job.hr?.company || 'N/A'}`);
        console.log(`   Status: ${job.status}`);
        console.log(`   Moderation: ${job.moderationStatus}`);
        console.log(`   Created: ${job.createdAt}`);
      });
      
      // Count by status
      const statusCounts = allJobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n\nJobs by status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
      // Count by moderation status
      const moderationCounts = allJobs.reduce((acc, job) => {
        acc[job.moderationStatus] = (acc[job.moderationStatus] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\nJobs by moderation status:');
      Object.entries(moderationCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
      // Check what the API would return
      const activeApprovedJobs = allJobs.filter(job => 
        job.status === 'ACTIVE' && job.moderationStatus === 'APPROVED'
      );
      
      console.log(`\n\nJobs that would be shown on /jobs page (ACTIVE + APPROVED): ${activeApprovedJobs.length}`);
      
      if (activeApprovedJobs.length > 0) {
        console.log('\nThese jobs should be visible:');
        activeApprovedJobs.forEach((job, index) => {
          console.log(`  ${index + 1}. ${job.title} (${job.hr?.company || 'N/A'})`);
        });
      }
    } else {
      console.log('No jobs found in database!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJobs();
