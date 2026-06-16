# AI Usage

This project was developed through pair-programming between the User and the AI Assistant (Antigravity). The AI acted as both a Product Manager (synthesizing requirements and proposing feature flows) and a Full-Stack Developer (writing SQL, Node.js endpoints, and React components).

## Collaboration Highlights

1. **Schema Design & Database Setup**: 
   - The AI generated the entire PostgreSQL schema, utilizing specialized tools (`run_command`) to execute `node` scripts that ran SQL queries directly against the cloud database.
   - We collaborated on the addition of the `import_logs` table. The AI proposed the schema and explained *why* it was needed (to log anomalies rather than crashing on bad CSV rows), which the User approved.

2. **CSV Anomaly Handling (The Importer)**:
   - The AI parsed the messy `expenses_export.csv` file directly using shell commands to inspect the raw data structure.
   - Based on the 4 flatmates' constraints, the AI autonomously authored a 15-step data cleaning pipeline in `importController.js` using `csv-parser` and `string-similarity`.
   - When Priya's requirement for USD conversion was highlighted, the AI planned and executed a targeted update to the importer to convert USD to INR at a static rate.

3. **Algorithm Implementation (Debt Simplification)**:
   - The AI implemented a Max-Flow / Min-Cash-Flow algorithm to simplify debts across the group.
   - When Rohan requested the ability to see exact transaction breakdowns, the AI proposed and built a `/between/:user1/:user2` endpoint and integrated a modal into the React frontend, allowing users to drill down into the simplified debts.

4. **Debugging and Troubleshooting**:
   - The AI proactively investigated a bug where the Dashboard showed zero values. By reading the frontend `Dashboard.jsx`, the API routes, and testing queries against the database, the AI identified a missing `authMiddleware` on the `/api/reports/dashboard` route. The AI applied the 1-line fix and instructed the user to refresh.
   - The AI used `grep_search` and `view_file` to navigate the file tree efficiently without relying on generic bash commands.

5. **Iterative Refinement**:
   - After the core features were built, the AI performed a repository sweep, deleting unused boilerplate files (`dashboardRoutes.js`, `balanceRoutes.js`, etc.) and updating `app.js` to keep the codebase clean and maintainable.
   - The AI verified all JSDoc comments to ensure the Swagger documentation at `/api-docs` was accurate and up-to-date.

## Challenges & Corrections
- **Query Misinterpretation**: At one point, the AI queried the database for user counts but misinterpreted the return format (`[ { count: '2' } ]`). The AI quickly self-corrected, realizing the count was returned as a string and handled it in the Node controller.
- **Missing Req.User**: The AI correctly identified that adding `authMiddleware` to routes relying on `req.user` (like the Dashboard) was essential, as Express would crash otherwise.

Overall, the AI handled the heavy lifting of backend algorithms and CSV parsing, while the User provided the product direction, constraint checks, and final approval for structural changes.
