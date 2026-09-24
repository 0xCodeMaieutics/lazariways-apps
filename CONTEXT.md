# Lazari Ways

A monorepo for Lazari Ways recruitment workflows: workers apply, employers browse candidates, and consultants administer both.

## Language

- Lazari Ways: It's a recruitment company that imports workers from outside of Germany.
- Worker: Someone who wants to be employed in Germany and contacts Lazari Ways
- Employee: See worker's definition.
- Admin: A consultant that works in workers administration at Lazari Ways.
- Profile: A worker's created profile who is interested in be seeing by Employers.
- Arbeitskreafte: Refers to workers.
- Employer: Refers to employers that do hire workers from Lazari Ways.
- Bewerber: Applicant that filled up the application form.
- Personalgeorgien: Recruitment company that searches for employers or other recruitement firms that are in need for employees or workers from Georgia.

## Language

**Application Inquiry**:
An employer's expressed interest in a specific Application, submitted through the Bewerber app.
_Avoid_: Lead, contact (Personalgeorgien uses those for a different flow)

**Personalgeorgien Profile**:
A branded candidate PDF generated from a saved Application for personalgeorgien.
_Avoid_: Personalgeorgien PDF, candidate profile PDF

**Personalgeorgien Profession**:
The job-area template an Admin selects when generating a Personalgeorgien Profile. Not stored on the Application.
_Avoid_: Profession, role, job title

**Bewerber Checklist**:
The consultant-facing application PDF an Admin generates from a saved Application.
_Avoid_: Remote application PDF, application PDF, Guili CV

## Lazari Lingo

Language-learning app where learners complete **Exams** within **Topics**.

**Exam**:
A practice unit in a Topic, made up of Exercises. Learners must reach a pass threshold (minimum correct answers × minimum pass count) before progression unlocks.
_Avoid_: Test, quiz, lesson

**Unlocks exams**:
The exams that become available to a learner after they fully pass this exam. Each exam has at most one unlocker. Configured on the target exam as Unlocked by (e.g. "Exam B is unlocked by Exam A").
_Avoid_: unlockExams, prerequisites, dependencies

**Unlocked exam** (per learner):
A UserUnlockedExam record showing a specific learner may access an exam. Created when the learner fully passes the exam that unlocks it, when the exam is later attached as one of that unlocker’s Unlocks exams and the learner already fully passed the unlocker, when the exam later gains an unlocker and the learner already fully passed that exam, or via seed data. Once created, it is not removed.
_Avoid_: unlocked, available, open

**Always unlocked topic**:
A Topic with `isAlwaysUnlocked` set to true. Every learner can access it without a UserUnlockedTopic record. There can be more than one. It has no unlocker and is not represented by Unlocked topic grants. Clearing the flag does not create grants; learners without an Unlocked topic then cannot access it.
_Avoid_: free topic, open topic, starter-only

**Always unlocked exam**:
An Exam with `isAlwaysUnlocked` set to true. Every learner who can access the topic can take it without a UserUnlockedExam record. There can be more than one in a topic. It has no unlocker and is not represented by Unlocked exam grants. Clearing the flag does not create grants; learners without an Unlocked exam then cannot access it.
_Avoid_: free exam, open exam, starter exam

**Unlocked topic** (per learner):
A UserUnlockedTopic record showing a specific learner may access a topic when it is enabled. Created when progression criteria are met in the unlocker topic, when the topic is later attached as one of that unlocker’s Unlocks topics and the learner already meets those criteria, when those criteria become easier and the learner already meets them, when an exam in the unlocker becomes enabled and that newly counted completion meets the minimum, or via seed data for learners who already meet those criteria. Grants are still created if the topic is disabled. Once created, it is not removed: not when Unlocks topics or the unlocker change, and not when the unlocker’s progression criteria become stricter.
_Avoid_: unlocked, available, open

**Unlocks topics**:
The topics that become available after a learner completes enough exams in the unlocker topic. Each topic has at most one unlocker. The unlocker must have a minimum completed-exam count; that count may be higher than the number of enabled exams at the time. Only currently enabled exams that the learner has fully passed (passedCount at or above that exam’s minimumPassedCount) count toward that minimum. The chain cannot cycle (a topic cannot unlock itself, directly or through other topics). Configured via `unlockedId` on the target topic and `minimumCompletedExamsToUnlock` on the unlocker topic.
_Avoid_: unlockTopics, prerequisites, dependencies

## References

- For TypeScript conventions, see docs/TYPESCRIPT.md
- For Prisma conventions, see docs/PRISMA.md
- For UI conventions, see docs/UI.md
- For React conventions, see docs/REACT.md
- For Clean Code rules, see docs/CLEAN_CODE.md
- For CLI rules, see docs/CLI.md

_NOTE: See each package's and app's AGENTS.md for specific guidelines if you don't find enough information in the root AGENTS.md file._

## Package manager

This project uses Turborepo and pnpm.
