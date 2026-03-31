@echo off
REM ============================================================
REM  parse-all-exams.bat
REM  Runs parse-exam.mjs for every PDF in public/Exams/
REM  Skip any that already have a processed JSON output.
REM  Run from the project root: scripts\parse-all-exams.bat
REM ============================================================

echo.
echo ============================================================
echo  Overtake — Batch Exam Parser
echo ============================================================
echo.

REM ── USTET 2014 ──────────────────────────────────────────────
echo [1/14] USTET 2014 - English Proficiency
node scripts/parse-exam.mjs ustet-english-2014 "public/Exams/USTET/[USTET 2014] English Proficiency.pdf" --answer-key "public/Exams/USTET/[USTET 2014] Simulated Exam Answer Key.pdf" --name "USTET 2014" --subject "English Proficiency" --duration 60 --max-q 100
timeout /t 3 /nobreak > nul

echo [2/14] USTET 2014 - Science Proficiency
node scripts/parse-exam.mjs ustet-science-2014 "public/Exams/USTET/[USTET 2014] Science Proficiency.pdf" --answer-key "public/Exams/USTET/[USTET 2014] Simulated Exam Answer Key.pdf" --name "USTET 2014" --subject "Science Proficiency" --duration 50 --max-q 60
timeout /t 3 /nobreak > nul

echo [3/14] USTET 2014 - Mental Ability
node scripts/parse-exam.mjs ustet-mental-2014 "public/Exams/USTET/[USTET 2014] Mental Ability.pdf" --answer-key "public/Exams/USTET/[USTET 2014] Simulated Exam Answer Key.pdf" --name "USTET 2014" --subject "Mental Ability" --duration 40 --max-q 60
timeout /t 3 /nobreak > nul

REM ── USTET 2015 ──────────────────────────────────────────────
echo [4/14] USTET 2015 - English Proficiency
node scripts/parse-exam.mjs ustet-english-2015 "public/Exams/USTET/[USTET 2015] English Proficiency.pdf" --answer-key "public/Exams/USTET/[USTET 2015] Answer Key.pdf" --name "USTET 2015" --subject "English Proficiency" --duration 60 --max-q 100
timeout /t 3 /nobreak > nul

echo [5/14] USTET 2015 - Mental Ability
node scripts/parse-exam.mjs ustet-mental-2015 "public/Exams/USTET/[USTET 2015] Mental Ability.pdf" --answer-key "public/Exams/USTET/[USTET 2015] Answer Key.pdf" --name "USTET 2015" --subject "Mental Ability" --duration 40 --max-q 60
timeout /t 3 /nobreak > nul

echo [6/14] USTET 2015 - Science Proficiency
node scripts/parse-exam.mjs ustet-science-2015 "public/Exams/USTET/[USTET 2015] Science Proficiency.pdf" --answer-key "public/Exams/USTET/[USTET 2015] Answer Key.pdf" --name "USTET 2015" --subject "Science Proficiency" --duration 50 --max-q 60
timeout /t 3 /nobreak > nul

REM ── UPCAT ───────────────────────────────────────────────────
echo [7/14] UPCAT - Language Proficiency
node scripts/parse-exam.mjs upcat-language "public/Exams/UPCAT/01 Language Proficiency.pdf" --answer-key "public/Exams/UPCAT/01 Language Proficiency Answer Key.pdf" --name "UPCAT" --subject "Language Proficiency" --duration 45 --max-q 80
timeout /t 3 /nobreak > nul

echo [8/14] UPCAT - Science Proficiency
node scripts/parse-exam.mjs upcat-science "public/Exams/UPCAT/02 Science Proficiency.pdf" --answer-key "public/Exams/UPCAT/02 Science Proficiency Answer Key.pdf" --name "UPCAT" --subject "Science Proficiency" --duration 60 --max-q 80
timeout /t 3 /nobreak > nul

echo [9/14] UPCAT - Mathematics Proficiency
node scripts/parse-exam.mjs upcat-math "public/Exams/UPCAT/03 Mathematics Proficiency.pdf" --answer-key "public/Exams/UPCAT/03 Mathematics Proficiency Answer Key.pdf" --name "UPCAT" --subject "Mathematics Proficiency" --duration 45 --max-q 60
timeout /t 3 /nobreak > nul

echo [10/14] UPCAT - Reading Proficiency
node scripts/parse-exam.mjs upcat-reading "public/Exams/UPCAT/04 Reading Proficiency.pdf" --answer-key "public/Exams/UPCAT/04 Reading Proficiency Answer Key.pdf" --name "UPCAT" --subject "Reading Proficiency" --duration 45 --max-q 60
timeout /t 3 /nobreak > nul

REM ── ACET 2014 ───────────────────────────────────────────────
echo [11/14] ACET 2014 - Multiple Sections
node scripts/parse-exam.mjs acet-english-2014 "public/Exams/ACET/[ACET 2014 Set B] English Proficiency.pdf" --name "ACET 2014" --subject "English Proficiency" --duration 30 --max-q 60
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs acet-math-2014 "public/Exams/ACET/[ACET 2014 Set B] Math Proficiency.pdf" --name "ACET 2014" --subject "Math Proficiency" --duration 30 --max-q 40
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs acet-reading-2014 "public/Exams/ACET/[ACET 2014 Set B] Reading Comprehension.pdf" --name "ACET 2014" --subject "Reading Comprehension" --duration 25 --max-q 40
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs acet-verbal-2014 "public/Exams/ACET/[ACET 2014 Set B] Verbal Analogy.pdf" --name "ACET 2014" --subject "Verbal Analogy" --duration 15 --max-q 30
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs acet-vocab-2014 "public/Exams/ACET/[ACET 2014 Set B] Vocabulary Proficiency.pdf" --name "ACET 2014" --subject "Vocabulary Proficiency" --duration 15 --max-q 30
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs acet-abstract-2014 "public/Exams/ACET/[ACET 2014 Set B] Abstract Reasoning.pdf" --name "ACET 2014" --subject "Abstract Reasoning" --duration 20 --max-q 40
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs acet-logical-2014 "public/Exams/ACET/[ACET 2014 Set B] Logical Reasoning.pdf" --name "ACET 2014" --subject "Logical Reasoning" --duration 20 --max-q 30
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs acet-numerical-2014 "public/Exams/ACET/[ACET 2014 Set B] Numerical Ability.pdf" --name "ACET 2014" --subject "Numerical Ability" --duration 20 --max-q 30
timeout /t 3 /nobreak > nul

REM ── PUPCET ──────────────────────────────────────────────────
echo [12/14] PUPCET Reviewer
node scripts/parse-exam.mjs pupcet-reviewer "public/Exams/PUPCET/[PUPCET] PUPCET Reviewer.pdf" --name "PUPCET" --subject "Full Reviewer" --duration 120 --max-q 100
timeout /t 3 /nobreak > nul

REM ── DCAT 2014 ───────────────────────────────────────────────
echo [13/14] DCAT 2014 - Multiple Sections
node scripts/parse-exam.mjs dcat-aptitude-2014 "public/Exams/DCAT/[DCAT 2014] 01 General Aptitude Test.pdf" --name "DCAT 2014" --subject "General Aptitude" --duration 40 --max-q 60
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs dcat-math-2014 "public/Exams/DCAT/[DCAT 2014] 02 Mathematics Proficiency.pdf" --name "DCAT 2014" --subject "Mathematics Proficiency" --duration 40 --max-q 50
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs dcat-reading-2014 "public/Exams/DCAT/[DCAT 2014] 03 Reading Comprehension.pdf" --name "DCAT 2014" --subject "Reading Comprehension" --duration 30 --max-q 40
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs dcat-english-2014 "public/Exams/DCAT/[DCAT 2014] 04 English Proficiency.pdf" --name "DCAT 2014" --subject "English Proficiency" --duration 30 --max-q 40
timeout /t 3 /nobreak > nul

node scripts/parse-exam.mjs dcat-science-2014 "public/Exams/DCAT/[DCAT 2014] 05 Science Proficiency.pdf" --name "DCAT 2014" --subject "Science Proficiency" --duration 30 --max-q 40
timeout /t 3 /nobreak > nul

echo.
echo ============================================================
echo  All done! Check data/exams/processed/ for JSON files.
echo ============================================================
echo.
pause
