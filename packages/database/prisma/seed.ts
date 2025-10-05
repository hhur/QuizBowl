import { PrismaClient, QuestionCategory, QuestionDifficulty, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const sampleQuestions = [
  // Literature Questions
  {
    text: "This novel by Harper Lee tells the story of Scout Finch and her father Atticus, a lawyer defending a Black man falsely accused of rape in 1930s Alabama.",
    answer: "To Kill a Mockingbird",
    category: QuestionCategory.LITERATURE,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This epic poem by Homer describes the ten-year journey of Odysseus as he attempts to return home to Ithaca after the Trojan War.",
    answer: "The Odyssey",
    category: QuestionCategory.LITERATURE,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This Shakespeare play features the characters of Romeo Montague and Juliet Capulet, whose families are engaged in a bitter feud in Verona.",
    answer: "Romeo and Juliet",
    category: QuestionCategory.LITERATURE,
    difficulty: QuestionDifficulty.MIDDLE_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },

  // History Questions  
  {
    text: "This president issued the Emancipation Proclamation in 1863, declaring slaves in rebellious states to be free.",
    answer: "Abraham Lincoln",
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.MIDDLE_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This French military leader crowned himself Emperor in 1804 and was eventually defeated at the Battle of Waterloo in 1815.",
    answer: "Napoleon Bonaparte (or Napoleon I)",
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This ancient wonder of the world, located in Alexandria, Egypt, was a lighthouse that guided ships safely to harbor.",
    answer: "The Lighthouse of Alexandria (or Pharos of Alexandria)",
    category: QuestionCategory.HISTORY,
    difficulty: QuestionDifficulty.COLLEGIATE,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },

  // Science Questions
  {
    text: "This element, with atomic number 6, is the basis of all organic compounds and forms the backbone of biological molecules.",
    answer: "Carbon",
    category: QuestionCategory.SCIENCE,
    difficulty: QuestionDifficulty.MIDDLE_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This scientist developed the theory of general relativity and won the Nobel Prize in Physics in 1921 for his work on the photoelectric effect.",
    answer: "Albert Einstein",
    category: QuestionCategory.SCIENCE,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen is essential for most life on Earth.",
    answer: "Photosynthesis",
    category: QuestionCategory.SCIENCE,
    difficulty: QuestionDifficulty.MIDDLE_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },

  // Fine Arts Questions
  {
    text: "This Italian Renaissance artist painted the ceiling of the Sistine Chapel and sculpted the statue of David.",
    answer: "Michelangelo (Buonarroti)",
    category: QuestionCategory.FINE_ARTS,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This Dutch post-impressionist painter created 'Starry Night' and is known for cutting off his own ear.",
    answer: "Vincent van Gogh",
    category: QuestionCategory.FINE_ARTS,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This German composer wrote nine symphonies, including the famous 'Ode to Joy' in his Ninth Symphony, despite becoming deaf.",
    answer: "Ludwig van Beethoven",
    category: QuestionCategory.FINE_ARTS,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },

  // Geography Questions
  {
    text: "This river, the longest in the world, flows through Egypt and empties into the Mediterranean Sea.",
    answer: "The Nile River",
    category: QuestionCategory.GEOGRAPHY,
    difficulty: QuestionDifficulty.MIDDLE_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This mountain range contains Mount Everest, the world's highest peak, and forms a natural barrier between the Indian subcontinent and Central Asia.",
    answer: "The Himalayas",
    category: QuestionCategory.GEOGRAPHY,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This largest continent by both area and population is home to countries including China, India, and Russia.",
    answer: "Asia",
    category: QuestionCategory.GEOGRAPHY,
    difficulty: QuestionDifficulty.MIDDLE_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },

  // Additional questions to reach 50
  // Mythology
  {
    text: "In Greek mythology, this god of the sea is the brother of Zeus and Hades and carries a trident.",
    answer: "Poseidon",
    category: QuestionCategory.MYTHOLOGY,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This Norse god of thunder wields a hammer called Mjolnir and is the son of Odin.",
    answer: "Thor",
    category: QuestionCategory.MYTHOLOGY,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },

  // Philosophy
  {
    text: "This ancient Greek philosopher taught Alexander the Great and wrote works on ethics, politics, and logic.",
    answer: "Aristotle",
    category: QuestionCategory.PHILOSOPHY,
    difficulty: QuestionDifficulty.COLLEGIATE,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This French philosopher wrote 'I think, therefore I am' and is considered the father of modern philosophy.",
    answer: "René Descartes",
    category: QuestionCategory.PHILOSOPHY,
    difficulty: QuestionDifficulty.COLLEGIATE,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },

  // Current Events (General Knowledge)
  {
    text: "This social media platform, founded by Mark Zuckerberg, was originally called 'The Facebook' when launched in 2004.",
    answer: "Facebook (or Meta)",
    category: QuestionCategory.CURRENT_EVENTS,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  },
  {
    text: "This space agency successfully landed the Perseverance rover on Mars in February 2021.",
    answer: "NASA (National Aeronautics and Space Administration)",
    category: QuestionCategory.CURRENT_EVENTS,
    difficulty: QuestionDifficulty.HIGH_SCHOOL,
    source: "QuizBowlHub Sample Set",
    year: 2024,
  }
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@quizbowlhub.dev',
      username: 'admin',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.ADMIN,
      school: 'QuizBowlHub',
    },
  });

  // Create moderator user
  const moderatorPassword = await bcrypt.hash('moderator123', 10);
  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@quizbowlhub.dev',
      username: 'moderator',
      password: moderatorPassword,
      firstName: 'Quiz',
      lastName: 'Moderator',
      role: UserRole.MODERATOR,
      school: 'QuizBowlHub',
    },
  });

  // Create sample coach
  const coachPassword = await bcrypt.hash('coach123', 10);
  const coach = await prisma.user.create({
    data: {
      email: 'coach@example.edu',
      username: 'coachsmith',
      password: coachPassword,
      firstName: 'Sarah',
      lastName: 'Smith',
      role: UserRole.COACH,
      school: 'Example High School',
    },
  });

  // Create sample students
  const student1Password = await bcrypt.hash('student123', 10);
  const student1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.edu',
      username: 'johndoe',
      password: student1Password,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.PLAYER,
      school: 'Example High School',
    },
  });

  const student2Password = await bcrypt.hash('student123', 10);
  const student2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.edu',
      username: 'janesmith',
      password: student2Password,
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.PLAYER,
      school: 'Example High School',
    },
  });

  const student3Password = await bcrypt.hash('student123', 10);
  const student3 = await prisma.user.create({
    data: {
      email: 'mike.wilson@riverside.edu',
      username: 'mikewilson',
      password: student3Password,
      firstName: 'Mike',
      lastName: 'Wilson',
      role: UserRole.PLAYER,
      school: 'Riverside Academy',
    },
  });

  // Create sample teams
  const team1 = await prisma.team.create({
    data: {
      name: 'Example High Scholars',
      school: 'Example High School',
      description: 'The premier Quiz Bowl team from Example High School',
    },
  });

  const team2 = await prisma.team.create({
    data: {
      name: 'Riverside Rapids',
      school: 'Riverside Academy',
      description: 'Fast-thinking Quiz Bowl champions',
    },
  });

  // Add team members
  await prisma.teamMember.create({
    data: {
      userId: coach.id,
      teamId: team1.id,
      role: 'COACH',
    },
  });

  await prisma.teamMember.create({
    data: {
      userId: student1.id,
      teamId: team1.id,
      role: 'CAPTAIN',
    },
  });

  await prisma.teamMember.create({
    data: {
      userId: student2.id,
      teamId: team1.id,
      role: 'PLAYER',
    },
  });

  await prisma.teamMember.create({
    data: {
      userId: student3.id,
      teamId: team2.id,
      role: 'CAPTAIN',
    },
  });

  // Add questions
  for (const questionData of sampleQuestions) {
    await prisma.question.create({
      data: {
        ...questionData,
        createdById: moderator.id,
      },
    });
  }

  // Add remaining questions to reach 50
  const additionalQuestions = [
    {
      text: "This planet is known as the 'Red Planet' due to iron oxide on its surface.",
      answer: "Mars",
      category: QuestionCategory.SCIENCE,
      difficulty: QuestionDifficulty.MIDDLE_SCHOOL,
    },
    {
      text: "This author wrote '1984' and 'Animal Farm', both dystopian novels about totalitarian societies.",
      answer: "George Orwell",
      category: QuestionCategory.LITERATURE,
      difficulty: QuestionDifficulty.HIGH_SCHOOL,
    },
    {
      text: "This war began in 1914 with the assassination of Archduke Franz Ferdinand and ended in 1918.",
      answer: "World War I (or The Great War)",
      category: QuestionCategory.HISTORY,
      difficulty: QuestionDifficulty.HIGH_SCHOOL,
    },
    // Add more questions as needed...
  ];

  for (const questionData of additionalQuestions) {
    await prisma.question.create({
      data: {
        ...questionData,
        source: "QuizBowlHub Sample Set",
        year: 2024,
        createdById: moderator.id,
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Created ${await prisma.user.count()} users`);
  console.log(`👥 Created ${await prisma.team.count()} teams`);
  console.log(`❓ Created ${await prisma.question.count()} questions`);
  console.log('\n🔑 Test accounts:');
  console.log('Admin: admin@quizbowlhub.dev / admin123');
  console.log('Moderator: moderator@quizbowlhub.dev / moderator123');
  console.log('Coach: coach@example.edu / coach123');
  console.log('Student: john.doe@example.edu / student123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });