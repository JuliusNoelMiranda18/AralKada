import { spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const JOBS = [
  // USTET 2014
  { id: 'ustet-math-2014', pdf: 'public/Exams/USTET/[USTET 2014] Mathematics Proficiency.pdf', key: 'public/Exams/USTET/[USTET 2014] Simulated Exam Answer Key.pdf', subject: 'Mathematics' },
  { id: 'ustet-english-2014', pdf: 'public/Exams/USTET/[USTET 2014] English Proficiency.pdf', key: 'public/Exams/USTET/[USTET 2014] Simulated Exam Answer Key.pdf', subject: 'English' },
  { id: 'ustet-science-2014', pdf: 'public/Exams/USTET/[USTET 2014] Science Proficiency.pdf', key: 'public/Exams/USTET/[USTET 2014] Simulated Exam Answer Key.pdf', subject: 'Science' },
  { id: 'ustet-mental-2014', pdf: 'public/Exams/USTET/[USTET 2014] Mental Ability.pdf', key: 'public/Exams/USTET/[USTET 2014] Simulated Exam Answer Key.pdf', subject: 'Mental Ability' },
  
  // USTET 2015
  { id: 'ustet-english-2015', pdf: 'public/Exams/USTET/[USTET 2015] English Proficiency.pdf', key: 'public/Exams/USTET/[USTET 2015] Answer Key.pdf', subject: 'English' },
  { id: 'ustet-mental-2015', pdf: 'public/Exams/USTET/[USTET 2015] Mental Ability.pdf', key: 'public/Exams/USTET/[USTET 2015] Answer Key.pdf', subject: 'Mental Ability' },
  { id: 'ustet-science-2015', pdf: 'public/Exams/USTET/[USTET 2015] Science Proficiency.pdf', key: 'public/Exams/USTET/[USTET 2015] Answer Key.pdf', subject: 'Science' },

  // UPCAT
  { id: 'upcat-language', pdf: 'public/Exams/UPCAT/01 Language Proficiency.pdf', key: 'public/Exams/UPCAT/01 Language Proficiency Answer Key.pdf', subject: 'Language' },
  { id: 'upcat-science', pdf: 'public/Exams/UPCAT/02 Science Proficiency.pdf', key: 'public/Exams/UPCAT/02 Science Proficiency Answer Key.pdf', subject: 'Science' },
  { id: 'upcat-math', pdf: 'public/Exams/UPCAT/03 Mathematics Proficiency.pdf', key: 'public/Exams/UPCAT/03 Mathematics Proficiency Answer Key.pdf', subject: 'Mathematics' },
  { id: 'upcat-reading', pdf: 'public/Exams/UPCAT/04 Reading Proficiency.pdf', key: 'public/Exams/UPCAT/04 Reading Proficiency Answer Key.pdf', subject: 'Reading' },

  // ACET 2014
  { id: 'acet-english-2014', pdf: 'public/Exams/ACET/[ACET 2014 Set B] English Proficiency.pdf', subject: 'English' },
  { id: 'acet-math-2014', pdf: 'public/Exams/ACET/[ACET 2014 Set B] Math Proficiency.pdf', subject: 'Mathematics' },
  { id: 'acet-reading-2014', pdf: 'public/Exams/ACET/[ACET 2014 Set B] Reading Comprehension.pdf', subject: 'Reading' },
  { id: 'acet-verbal-2014', pdf: 'public/Exams/ACET/[ACET 2014 Set B] Verbal Analogy.pdf', subject: 'Verbal' },
  { id: 'acet-vocab-2014', pdf: 'public/Exams/ACET/[ACET 2014 Set B] Vocabulary Proficiency.pdf', subject: 'Vocabulary' },
  { id: 'acet-abstract-2014', pdf: 'public/Exams/ACET/[ACET 2014 Set B] Abstract Reasoning.pdf', subject: 'Abstract Reasoning' },
  { id: 'acet-logical-2014', pdf: 'public/Exams/ACET/[ACET 2014 Set B] Logical Reasoning.pdf', subject: 'Logical Reasoning' },
  { id: 'acet-numerical-2014', pdf: 'public/Exams/ACET/[ACET 2014 Set B] Numerical Ability.pdf', subject: 'Numerical Ability' },

  // DCAT 2014
  { id: 'dcat-aptitude-2014', pdf: 'public/Exams/DCAT/[DCAT 2014] 01 General Aptitude Test.pdf', subject: 'General Aptitude' },
  { id: 'dcat-math-2014', pdf: 'public/Exams/DCAT/[DCAT 2014] 02 Mathematics Proficiency.pdf', subject: 'Mathematics' },
  { id: 'dcat-reading-2014', pdf: 'public/Exams/DCAT/[DCAT 2014] 03 Reading Comprehension.pdf', subject: 'Reading' },
  { id: 'dcat-english-2014', pdf: 'public/Exams/DCAT/[DCAT 2014] 04 English Proficiency.pdf', subject: 'English' },
  { id: 'dcat-science-2014', pdf: 'public/Exams/DCAT/[DCAT 2014] 05 Science Proficiency.pdf', subject: 'Science' },

  // PUPCET
  { id: 'pupcet-reviewer', pdf: 'public/Exams/PUPCET/[PUPCET] PUPCET Reviewer.pdf', subject: 'Full Review' },
];

async function run() {
  console.log(`🚀 Starting Batch Parsing of ${JOBS.length} Exams...\n`);

  for (const job of JOBS) {
    const outputPath = path.resolve(`data/exams/processed/${job.id}.json`);
    
    if (fs.existsSync(outputPath)) {
      console.log(`⏩ Skipping ${job.id} (Already exists)`);
      continue;
    }

    console.log(`\n📦 Processing: ${job.id}...`);
    
    const args = [
      'scripts/parse-exam.mjs',
      job.id,
      job.pdf,
      '--subject', job.subject || 'General'
    ];

    if (job.key) {
      args.push('--answer-key', job.key);
    }

    const result = spawnSync('node', args, { stdio: 'inherit' });

    if (result.status !== 0) {
      console.error(`❌ Failed processing ${job.id}`);
    } else {
      console.log(`✅ Finished ${job.id}`);
    }
  }

  console.log('\n✨ Batch Processing Complete!');
}

run();
