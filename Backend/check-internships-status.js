const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkInternships() {
  try {
    console.log('Checking all internships in database...\n');
    
    const allInternships = await prisma.internship.findMany({
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
    
    console.log(`Total internships in database: ${allInternships.length}\n`);
    
    if (allInternships.length > 0) {
      console.log('Internships details:');
      allInternships.forEach((internship, index) => {
        console.log(`\n${index + 1}. ${internship.title}`);
        console.log(`   Company: ${internship.hr?.company || 'N/A'}`);
        console.log(`   Status: ${internship.status}`);
        console.log(`   Moderation: ${internship.moderationStatus}`);
        console.log(`   Created: ${internship.createdAt}`);
      });
      
      // Count by status
      const statusCounts = allInternships.reduce((acc, internship) => {
        acc[internship.status] = (acc[internship.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n\nInternships by status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
      // Count by moderation status
      const moderationCounts = allInternships.reduce((acc, internship) => {
        acc[internship.moderationStatus] = (acc[internship.moderationStatus] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\nInternships by moderation status:');
      Object.entries(moderationCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
      
      // Check what the API would return
      const activeInternships = allInternships.filter(internship => 
        internship.status === 'ACTIVE'
      );
      
      console.log(`\n\nInternships that would be shown (ACTIVE): ${activeInternships.length}`);
      
      if (activeInternships.length > 0) {
        console.log('\nThese internships should be visible:');
        activeInternships.forEach((internship, index) => {
          console.log(`  ${index + 1}. ${internship.title} (${internship.hr?.company || 'N/A'})`);
        });
      }
    } else {
      console.log('No internships found in database!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInternships();
