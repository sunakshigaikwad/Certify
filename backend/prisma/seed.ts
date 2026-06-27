import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: "Rutuja's Software pvt ltd",
    },
  });

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('admin123', salt);
  const evalPassword = await bcrypt.hash('eval123', salt);
  const empPassword = await bcrypt.hash('emp123', salt);

  // Create Admin (Rutuja Annasaheb Ingale)
  const admin = await prisma.user.create({
    data: {
      name: 'Rutuja Annasaheb Ingale',
      email: 'rutujaingale059@gmail.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      designation: 'Administrator',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  // Create Evaluator (Sunakshi Nitin Gaikwad)
  const evaluator = await prisma.user.create({
    data: {
      name: 'Sunakshi Nitin Gaikwad',
      email: 'sunakshigaikwad2@gmail.com',
      passwordHash: evalPassword,
      role: 'EVALUATOR',
      designation: 'Team Manager [for evaluators]',
      status: 'ACTIVE',
      organizationId: org.id,
      teamManagerId: admin.id,
    },
  });

  // Create Employee (aksha dhiwar)
  const employee = await prisma.user.create({
    data: {
      name: 'aksha dhiwar',
      email: 'akshadhiwar@gmail.com',
      passwordHash: empPassword,
      role: 'EMPLOYEE',
      designation: 'Software Engineer',
      status: 'ACTIVE',
      organizationId: org.id,
    },
  });

  // Create standard certificate request
  await prisma.certificateRequest.create({
    data: {
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      skillsRequested: 'react,python,node.js,management',
      duration: 'jan 2023 - dec 2025',
      attendance: 83,
      status: 'SUBMITTED',
      resumePath: '/uploads/sample-resume.pdf',
      experienceLetterPath: '/uploads/sample-exp.pdf',
      aadhaarPath: '/uploads/sample-aadhaar.pdf',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
