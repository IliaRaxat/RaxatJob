const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        hrProfile: true,
        candidateProfile: true
      }
    });
    
    console.log(`Total users: ${users.length}\n`);
    
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
      if (user.hrProfile) {
        console.log(`  HR Profile: ${user.hrProfile.firstName} ${user.hrProfile.lastName} - ${user.hrProfile.company}`);
      }
      if (user.candidateProfile) {
        console.log(`  Candidate Profile: ${user.candidateProfile.firstName} ${user.candidateProfile.lastName}`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
