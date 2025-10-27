import { Teacher, Learner, School, Class, User } from '@/types';

// South African Schools
export const schools: School[] = [
  {
    id: 'school-001',
    name: 'Soweto Primary School',
    province: 'Gauteng',
    district: 'Johannesburg South',
    type: 'primary',
  },
  {
    id: 'school-002',
    name: 'Cape Town Secondary',
    province: 'Western Cape',
    district: 'Cape Town',
    type: 'secondary',
  },
  {
    id: 'school-003',
    name: 'Durban Combined School',
    province: 'KwaZulu-Natal',
    district: 'eThekwini',
    type: 'combined',
  },
];

// Teachers
export const teachers: Teacher[] = [
  {
    id: 'teacher-001',
    firstName: 'Thabo',
    lastName: 'Molefe',
    email: 'thabo.molefe@school.co.za',
    role: 'teacher',
    subjects: ['Mathematics'],
    classes: ['class-g4a', 'class-g4b', 'class-g5a', 'class-g6a'],
    schoolId: 'school-001',
    avatar: '/avatars/teacher-1.jpg',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: 'teacher-002',
    firstName: 'Nomsa',
    lastName: 'Dlamini',
    email: 'nomsa.dlamini@school.co.za',
    role: 'teacher',
    subjects: ['Mathematics'],
    classes: ['class-g5a', 'class-g6a'],
    schoolId: 'school-001',
    avatar: '/avatars/teacher-2.jpg',
    createdAt: new Date('2022-08-10'),
  },
  {
    id: 'teacher-003',
    firstName: 'Pieter',
    lastName: 'van der Merwe',
    email: 'pieter.vdm@school.co.za',
    role: 'teacher',
    subjects: ['Mathematics'],
    classes: ['class-g7a', 'class-g8a'],
    schoolId: 'school-002',
    avatar: '/avatars/teacher-3.jpg',
    createdAt: new Date('2021-03-20'),
  },
];

// Classes
export const classes: Class[] = [
  {
    id: 'class-g4a',
    name: 'Grade 4A',
    grade: 4,
    teacherId: 'teacher-001',
    learnerIds: [],
    schoolId: 'school-001',
    subject: 'mathematics',
  },
  {
    id: 'class-g4b',
    name: 'Grade 4B',
    grade: 4,
    teacherId: 'teacher-001',
    learnerIds: [],
    schoolId: 'school-001',
    subject: 'mathematics',
  },
  {
    id: 'class-g5a',
    name: 'Grade 5A',
    grade: 5,
    teacherId: 'teacher-001',
    learnerIds: [],
    schoolId: 'school-001',
    subject: 'mathematics',
  },
  {
    id: 'class-g6a',
    name: 'Grade 6A',
    grade: 6,
    teacherId: 'teacher-001',
    learnerIds: [],
    schoolId: 'school-001',
    subject: 'mathematics',
  },
  {
    id: 'class-g7a',
    name: 'Grade 7A',
    grade: 7,
    teacherId: 'teacher-002',
    learnerIds: [],
    schoolId: 'school-001',
    subject: 'mathematics',
  },
  {
    id: 'class-g7b',
    name: 'Grade 7B',
    grade: 7,
    teacherId: 'teacher-002',
    learnerIds: [],
    schoolId: 'school-001',
    subject: 'mathematics',
  },
  {
    id: 'class-g8a',
    name: 'Grade 8A',
    grade: 8,
    teacherId: 'teacher-003',
    learnerIds: [],
    schoolId: 'school-001',
    subject: 'mathematics',
  },
];

// South African names for realistic learner data
const southAfricanFirstNames = {
  male: [
    'Thabo',
    'Sipho',
    'Mandla',
    'Bongani',
    'Tshepo',
    'Kagiso',
    'Lerato',
    'Mpho',
    'Tebogo',
    'Jabu',
    'Sello',
    'Katlego',
    'Lebogang',
    'Phenyo',
    'Thapelo',
    'Connor',
    'Liam',
    'Joshua',
    'Ryan',
    'Kyle',
  ],
  female: [
    'Nomsa',
    'Zanele',
    'Thandiwe',
    'Precious',
    'Lerato',
    'Palesa',
    'Kgomotso',
    'Refilwe',
    'Naledi',
    'Boitumelo',
    'Kagiso',
    'Thuli',
    'Nokuthula',
    'Zinhle',
    'Emma',
    'Olivia',
    'Mia',
    'Sophie',
    'Chloe',
  ],
};

const southAfricanLastNames = [
  'Ndlovu',
  'Molefe',
  'Khumalo',
  'Dlamini',
  'Nkosi',
  'Mokoena',
  'Mthembu',
  'Mabaso',
  'Zulu',
  'Sithole',
  'Mahlangu',
  'Radebe',
  'Vilakazi',
  'van der Merwe',
  'Botha',
  'Nel',
  'Smith',
  'Jacobs',
  'Abrahams',
  'Johnson',
];

// Generate learners
function generateLearners(count: number, classId: string, grade: number): Learner[] {
  const learners: Learner[] = [];
  const genderOptions = ['male', 'female'] as const;

  for (let i = 0; i < count; i++) {
    const gender = genderOptions[Math.floor(Math.random() * 2)];
    const firstName =
      southAfricanFirstNames[gender][
        Math.floor(Math.random() * southAfricanFirstNames[gender].length)
      ];
    const lastName =
      southAfricanLastNames[Math.floor(Math.random() * southAfricanLastNames.length)];
    const id = `learner-${classId}-${String(i + 1).padStart(3, '0')}`;

    learners.push({
      id,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@learner.co.za`,
      role: 'learner',
      grade,
      classId,
      enrollmentDate: new Date('2024-01-15'),
      avatar: `/avatars/learner-${(i % 20) + 1}.jpg`,
      createdAt: new Date('2024-01-15'),
    });
  }

  return learners;
}

// Generate learners for each class - Realistic SA class sizes (35-45 learners)
export const learners: Learner[] = [
  ...generateLearners(38, 'class-g4a', 4), // Grade 4A - 38 learners
  ...generateLearners(42, 'class-g4b', 4), // Grade 4B - 42 learners
  ...generateLearners(40, 'class-g5a', 5), // Grade 5A - 40 learners
  ...generateLearners(36, 'class-g6a', 6), // Grade 6A - 36 learners
  ...generateLearners(35, 'class-g7a', 7), // Grade 7A - 35 learners
  ...generateLearners(33, 'class-g7b', 7), // Grade 7B - 33 learners
  ...generateLearners(31, 'class-g8a', 8), // Grade 8A - 31 learners
];
// Total for teacher's 4 classes (G4A, G4B, G5A, G6A): 156 learners

// Update class learner IDs
classes.forEach((cls) => {
  cls.learnerIds = learners.filter((l) => l.classId === cls.id).map((l) => l.id);
});

// Helper functions
export function getTeacherById(id: string): Teacher | undefined {
  return teachers.find((t) => t.id === id);
}

export function getLearnerById(id: string): Learner | undefined {
  return learners.find((l) => l.id === id);
}

export function getClassById(id: string): Class | undefined {
  return classes.find((c) => c.id === id);
}

export function getLearnersByClass(classId: string): Learner[] {
  return learners.filter((l) => l.classId === classId);
}

export function getClassesByTeacher(teacherId: string): Class[] {
  return classes.filter((c) => c.teacherId === teacherId);
}

export function getLearnersByTeacher(teacherId: string): Learner[] {
  const teacherClasses = getClassesByTeacher(teacherId);
  const classIds = teacherClasses.map((c) => c.id);
  return learners.filter((l) => classIds.includes(l.classId));
}

// Current user (for demo)
export const currentUser: Teacher = teachers[0];









