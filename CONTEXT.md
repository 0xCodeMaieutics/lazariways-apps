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
