#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// ─── Colour helpers (no external deps) ────────────────────────────────────────
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};
const log = (color, msg) => console.log(`${color}${msg}${c.reset}`);

// ─── Banner ────────────────────────────────────────────────────────────────────
console.log(`
${c.cyan}${c.bold}╔══════════════════════════════════════════════════════╗
║      PVG Auth & Enterprise Management System         ║
║           create-pvg-auth  •  v1.0.0                 ║
╚══════════════════════════════════════════════════════╝${c.reset}
`);

// ─── Validate arguments ────────────────────────────────────────────────────────
const projectName = process.argv[2];

if (!projectName) {
  log(c.red, "✖  ERROR: Please provide a project name.\n");
  log(c.yellow, "   Usage:  npx create-pvg-auth <project-name>\n");
  log(c.yellow, "   Example: npx create-pvg-auth my-erp-system\n");
  process.exit(1);
}

// Validate name – no spaces, no special chars (except - and _)
if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
  log(c.red, `✖  ERROR: Invalid project name "${projectName}".`);
  log(c.yellow, "   Use only letters, numbers, hyphens, or underscores.");
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), projectName);

if (fs.existsSync(targetDir)) {
  log(c.red, `✖  ERROR: Directory "${projectName}" already exists.`);
  log(c.yellow, "   Choose a different project name or delete the folder.");
  process.exit(1);
}

// ─── Repository ───────────────────────────────────────────────────────────────
const REPO_URL =
  "https://github.com/PhapaleSai/ERP_Authentication_and_Authorization_MODULE.git";

// ─── Clone ────────────────────────────────────────────────────────────────────
log(c.cyan, `\n⏳  Creating project "${projectName}" …`);
log(c.blue,  `    Cloning from GitHub …`);

try {
  execSync(`git clone --depth 1 ${REPO_URL} "${targetDir}" --progress`, {
    stdio: "pipe",
  });
} catch (err) {
  log(c.red, "\n✖  Clone failed. Details below:\n");
  console.error(err.message);
  log(c.yellow, "\n   Make sure you have Git installed and internet access.");
  process.exit(1);
}

// ─── Remove .git so friends start with a clean history ─────────────────────
log(c.blue, "    Cleaning up .git history (fresh start for you) …");

const gitDir = path.join(targetDir, ".git");
try {
  fs.rmSync(gitDir, { recursive: true, force: true });
} catch {
  // Non-fatal – some OS may need manual deletion
  log(c.yellow, "    ⚠  Could not remove .git folder. Please delete it manually.");
}

// ─── Remove venv + __pycache__ (large, user should create their own) ────────
log(c.blue, "    Removing auto-generated Python folders …");
const toRemove = [
  path.join(targetDir, "backend", "venv"),
  path.join(targetDir, "backend", "__pycache__"),
  path.join(targetDir, "backend", "pvg_local.db"),
];
toRemove.forEach((p) => {
  try {
    fs.rmSync(p, { recursive: true, force: true });
  } catch {
    /* skip */
  }
});

// ─── Success banner + Next Steps ─────────────────────────────────────────────
console.log(`
${c.green}${c.bold}✔  Project "${projectName}" created successfully!${c.reset}

${c.magenta}${c.bold}━━━━━━━━━━━━━━  NEXT STEPS  ━━━━━━━━━━━━━━${c.reset}

${c.bold}Step 1 — Enter your project folder${c.reset}
  ${c.cyan}cd ${projectName}${c.reset}

${c.bold}Step 2 — Set up the database (PostgreSQL required)${c.reset}
  ${c.yellow}• Create a database called  pvg_auth  in PostgreSQL${c.reset}
  ${c.yellow}• Run the schema file:${c.reset}
    ${c.cyan}psql -U postgres -d pvg_auth -f setup_auth_tables.sql${c.reset}

${c.bold}Step 3 — Configure the backend environment${c.reset}
  Create  ${c.cyan}backend/.env${c.reset}  with:

    DATABASE_URL=postgresql+psycopg2://postgres:YOUR_PASSWORD@localhost:5432/pvg_auth
    SECRET_KEY=your_super_secret_key
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=60

${c.bold}Step 4 — Set up the Python backend${c.reset}
  ${c.cyan}cd backend${c.reset}
  ${c.cyan}python -m venv venv${c.reset}
  ${c.cyan}venv\\Scripts\\activate    ${c.reset}${c.yellow}# Windows${c.reset}
  ${c.cyan}pip install -r requirements.txt${c.reset}
  ${c.cyan}cd ..${c.reset}

${c.bold}Step 5 — Install Node dependencies & start all services${c.reset}
  ${c.cyan}npm install${c.reset}
  ${c.cyan}npm run dev${c.reset}

${c.magenta}${c.bold}━━━━━━━━━━━━━━  ACCESS POINTS  ━━━━━━━━━━━━━━${c.reset}

  🌐  User Portal   →  http://localhost:5173
  🛡️   Admin Panel   →  http://localhost:5174  (admin / admin)
  📄  API Docs      →  http://localhost:8000/docs

${c.green}${c.bold}Happy coding! Build something amazing on top of PVG Auth 🚀${c.reset}
`);
