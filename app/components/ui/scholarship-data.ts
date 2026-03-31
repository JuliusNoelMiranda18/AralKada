export type AssessmentType = 'Exam' | 'Interview' | 'Grade Evaluation' | 'Exam & Interview' | 'Grades & Interview';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  description: string;
  tier: string; // e.g. 'GOVERNMENT', 'PRIVATE', 'CORPORATE'
  iconIcon: string; // e.g. 'Flask', 'Book', etc.
  
  // Filtering & matching
  supportedDegrees: string[]; // e.g. 'STEM', 'Engineering', 'IT', 'Business', 'All'
  
  // Badges
  assessmentType: AssessmentType;
  financialAid: string; // e.g. 'Full Tuition + Stipend', 'Partial Tuition'
  
  // Action properties
  eligibilityRequirements: { item: string; checked?: boolean }[];
  termsAndConditions: string[];
}

// Full PH Scholarship Data
export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'dost-sei-merit',
    name: 'DOST-SEI Merit Scholarship',
    provider: 'DEPARTMENT OF SCIENCE AND TECHNOLOGY',
    description: 'Premier scholarship for students with high aptitude in science and mathematics pursuing careers in STEM.',
    tier: 'GOVERNMENT',
    iconIcon: 'microscope',
    supportedDegrees: ['Engineering', 'IT', 'Sciences', 'Mathematics', 'STEM'],
    assessmentType: 'Exam', // Usually an exam, sometimes suspended replaced by grades, but historically exam
    financialAid: 'Tuition + ₱7k/mo Stipend',
    eligibilityRequirements: [
      { item: 'Natural-born Filipino citizen' },
      { item: 'Belongs to the STEM strand in Senior High School (or top 5% of non-STEM)' },
      { item: 'No pending scholarship applications from other government agencies' },
      { item: 'Must pass the DOST-SEI Scholarship Examination' },
      { item: 'Good moral character' }
    ],
    termsAndConditions: [
      'Must maintain a passing grade in all subjects.',
      'Must enroll in a DOST-SEI approved priority S&T course.',
      'Must serve the country on a full-time basis along the field of training for a minimum period equivalent to the length of time the scholarship was enjoyed.',
      'Cannot leave the country without DOST-SEI clearance.'
    ]
  },
  {
    id: 'dost-ra7687',
    name: 'DOST RA 7687 Scholarship',
    provider: 'DEPARTMENT OF SCIENCE AND TECHNOLOGY',
    description: 'Science and technology scholarship for talented students from families whose socio-economic status do not exceed certain indicators.',
    tier: 'GOVERNMENT',
    iconIcon: 'flask-conical',
    supportedDegrees: ['Engineering', 'IT', 'Sciences', 'Mathematics', 'STEM'],
    assessmentType: 'Exam',
    financialAid: 'Tuition + ₱7k/mo Stipend',
    eligibilityRequirements: [
      { item: 'Natural-born Filipino citizen' },
      { item: 'Resident of the municipality/district for at least 4 years' },
      { item: 'Family socio-economic status must not exceed set indicators' },
      { item: 'Belongs to STEM strand or top 5% of non-STEM graduating class' },
      { item: 'Must pass the DOST-SEI Scholarship Examination' }
    ],
    termsAndConditions: [
      'Maintain required academic standards.',
      'Enroll in DOST-SEI approved S&T programs.',
      'Return Service Agreement: Work in the Philippines for a period equivalent to the length of scholarship.'
    ]
  },
  {
    id: 'sm-foundation',
    name: 'SM Foundation College Scholarship',
    provider: 'SM FOUNDATION INC.',
    description: 'Providing access to higher education for deserving public high school graduates across the Philippines.',
    tier: 'CORPORATE',
    iconIcon: 'building',
    supportedDegrees: ['Computer Science', 'IT', 'Engineering', 'Education', 'Business', 'Accounting'],
    assessmentType: 'Exam & Interview',
    financialAid: 'Full Tuition + Mo. Allowance',
    eligibilityRequirements: [
      { item: 'Public high school graduate with at least 92% average grade' },
      { item: 'Total household income not exceeding ₱250,000/year' },
      { item: 'Must pass the SM Foundation written examination' },
      { item: 'Must pass the panel interview' }
    ],
    termsAndConditions: [
      'Maintain a GPA according to SM Foundation standards.',
      'No failing grades, incomplete marks, or dropped subjects.',
      'Participate in SM Foundation scholar activities and assemblies.',
      'You are highly encouraged (but not strictly bonded) to work for the SM Group.'
    ]
  },
  {
    id: 'aboitiz',
    name: 'Aboitiz College Scholarship',
    provider: 'ABOITIZ FOUNDATION',
    description: 'Empowering students to reach their full potential, creating the future leaders of the nation.',
    tier: 'CORPORATE',
    iconIcon: 'briefcase',
    supportedDegrees: ['Engineering', 'Business', 'Accounting', 'IT', 'Data Science'],
    assessmentType: 'Exam & Interview',
    financialAid: 'Tuition + Allowance + Board',
    eligibilityRequirements: [
      { item: 'Filipino citizen' },
      { item: 'GWA of 88% or higher, without failing grades' },
      { item: 'Financially incapacitated (provide ITR/Cert of Indigency)' },
      { item: 'Not enjoying any other scholarship' }
    ],
    termsAndConditions: [
      'Must maintain an 85% general weighted average every semester.',
      'Must undergo summer internship at applicable Aboitiz business units.',
      'Subject to a return service agreement with Aboitiz Group upon graduation.'
    ]
  },
  {
    id: 'security-bank',
    name: 'Security Bank Scholarship',
    provider: 'SECURITY BANK FOUNDATION',
    description: 'Paving the way for brighter futures by financing the education of deserving college students.',
    tier: 'PRIVATE',
    iconIcon: 'landmark',
    supportedDegrees: ['Business', 'Accounting', 'Finance', 'Economics', 'IT', 'Computer Science'],
    assessmentType: 'Interview',
    financialAid: 'Max ₱100,000/yr (Tuition & Stipend)',
    eligibilityRequirements: [
      { item: 'Enrolled in an SBFI partner university (e.g., ADMU, DLSU, UP, UST)' },
      { item: 'GWA of at least 85% or equivalent' },
      { item: 'No failing grades or dropped subjects' },
      { item: 'Total household income below ₱300,000 per annum' }
    ],
    termsAndConditions: [
      'Submit grades and enrollment forms promptly every semester.',
      'Attend the annual SBFI scholars\' assembly.',
      'Must not hold any other major scholarship.'
    ]
  },
  {
    id: 'ched-cssr',
    name: 'CHED Scholarship Program (CSP)',
    provider: 'COMMISSION ON HIGHER EDUCATION',
    description: 'Financial assistance for qualified and deserving students pursuing priority programs in HEIs.',
    tier: 'GOVERNMENT',
    iconIcon: 'graduation-cap',
    supportedDegrees: ['All', 'Agriculture', 'Engineering', 'Math', 'IT', 'Teacher Education'],
    assessmentType: 'Grade Evaluation',
    financialAid: 'Full or Half Scholarship (Max ₱120k/yr)',
    eligibilityRequirements: [
      { item: 'Filipino citizen' },
      { item: 'High school graduate or graduating student with GWA of at least 96% for Full, 93% for Half' },
      { item: 'Combined annual gross income of parents not exceeding ₱400,000' },
      { item: 'Available only for CHED priority degree programs' }
    ],
    termsAndConditions: [
      'Must enroll in recognized priority programs.',
      'Must maintain a GWA of at least 85% every semester.',
      'Carry a normal academic load and finish within the prescribed duration.'
    ]
  },
  {
    id: 'owwa-edsp',
    name: 'OWWA EDSP Scholarship',
    provider: 'OVERSEAS WORKERS WELFARE ADMIN',
    description: 'Education for Development Scholarship Program for dependents of active OFW OWWA members.',
    tier: 'GOVERNMENT',
    iconIcon: 'globe',
    supportedDegrees: ['All', 'Engineering', 'Nursing', 'IT', 'Business'],
    assessmentType: 'Exam', // DOST exam
    financialAid: 'Max ₱60,000/year',
    eligibilityRequirements: [
      { item: 'Dependent of an active OWWA member' },
      { item: 'Grade 12 student with a GWA of at least 80%' },
      { item: 'Must pass the DOST-SEI national competitive exam' },
      { item: 'Must not have taken college credits previously' }
    ],
    termsAndConditions: [
      'Maintain an average grade of 85% or equivalent.',
      'No failing grades in any subject.',
      'Must submit reports and grades to the regional OWWA office every semester.'
    ]
  },
  {
    id: 'megaworld',
    name: 'Megaworld Foundation Scholarship',
    provider: 'MEGAWORLD FOUNDATION',
    description: 'Making higher education accessible and producing world-class Filipino graduates.',
    tier: 'CORPORATE',
    iconIcon: 'building-2',
    supportedDegrees: ['Architecture', 'Engineering', 'IT', 'Business', 'Tourism', 'Interior Design'],
    assessmentType: 'Grades & Interview',
    financialAid: 'Full Tuition + Allowance',
    eligibilityRequirements: [
      { item: 'GWA of at least 85% or equivalent' },
      { item: 'Income tax return of parents not exceeding ₱300,000 combined' },
      { item: 'Pass the Megaworld Foundation interview panel' },
      { item: 'Enrolled in partner universities' }
    ],
    termsAndConditions: [
      'Maintain an 85% average grade.',
      'Be an active member of the Megaworld Scholars organization.',
      'Priority consideration for employment within the Megaworld group post-graduation.'
    ]
  },
  {
    id: 'gsis-educational-subsidy',
    name: 'GSIS Educational Subsidy Program',
    provider: 'GSIS',
    description: 'Financial assistance for children of GSIS members who are in college.',
    tier: 'GOVERNMENT',
    iconIcon: 'landmark',
    supportedDegrees: ['All'],
    assessmentType: 'Grade Evaluation',
    financialAid: '₱10,000 per academic year',
    eligibilityRequirements: [
      { item: 'Child of an active GSIS member' },
      { item: 'Enrolled in any 4 or 5-year course' },
      { item: 'Member has a salary grade of 24 or below' }
    ],
    termsAndConditions: [
      'Maintain passing grades in all subjects.',
      'Renewal is subject to member status and student performance.'
    ]
  },
  {
    id: 'petron-scholarship',
    name: 'Petron Tulong Alalay Scholarship',
    provider: 'PETRON FOUNDATION',
    description: 'Supporting students in communities where Petron operates.',
    tier: 'CORPORATE',
    iconIcon: 'flask-conical',
    supportedDegrees: ['Engineering', 'IT', 'Chemistry', 'Business'],
    assessmentType: 'Grades & Interview',
    financialAid: 'Full Tuition + Monthly Stipend',
    eligibilityRequirements: [
      { item: 'Resident of a Petron host community' },
      { item: 'Belongs to the top 10% of graduating class' },
      { item: 'Parents combined income must be below ₱250k' }
    ],
    termsAndConditions: [
      'Maintain a GWA of 2.0 or 85%.',
      'No grades lower than 2.5 in any subject.'
    ]
  },
  {
    id: 'manila-city-scholarship',
    name: 'Manila City Government Scholarship',
    provider: 'CITY OF MANILA',
    description: 'Available for bonafide residents of Manila studying in PLM or UDM.',
    tier: 'GOVERNMENT',
    iconIcon: 'building',
    supportedDegrees: ['All'],
    assessmentType: 'Exam',
    financialAid: 'Free Tuition + Monthly Stipend',
    eligibilityRequirements: [
      { item: 'Certified resident of Manila' },
      { item: 'Voter of Manila (parent or student)' },
      { item: 'Passed the PLMAT or UDMAT entrance exam' }
    ],
    termsAndConditions: [
      'Must maintain residency in Manila.',
      'Must maintain required passing marks for city universities.'
    ]
  }
];

// Combine unique categories for filtering
export const SCHOLARSHIP_CATEGORIES = Array.from(
  new Set(SCHOLARSHIPS.flatMap(s => s.supportedDegrees))
).sort();
