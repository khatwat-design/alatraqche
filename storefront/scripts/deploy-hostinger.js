const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const deployRoot = path.join(projectRoot, "deploy");
const standaloneRoot = path.join(projectRoot, ".next", "standalone");
const staticRoot = path.join(projectRoot, ".next", "static");
const publicRoot = path.join(projectRoot, "public");

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

if (!fs.existsSync(standaloneRoot)) {
  console.error(
    "Missing .next/standalone. Run `npm run build` first, then retry.",
  );
  process.exit(1);
}

fs.rmSync(deployRoot, { recursive: true, force: true });
fs.mkdirSync(deployRoot, { recursive: true });

copyDir(standaloneRoot, deployRoot);

const deployNextDir = path.join(deployRoot, ".next");
const deployStaticDir = path.join(deployNextDir, "static");
fs.rmSync(deployStaticDir, { recursive: true, force: true });
fs.mkdirSync(deployNextDir, { recursive: true });
copyDir(staticRoot, deployStaticDir);

if (fs.existsSync(publicRoot)) {
  copyDir(publicRoot, path.join(deployRoot, "public"));
}

const note = `Hostinger deploy bundle
- Entry point: server.js
- Run command: node server.js
- No build step needed (prebuilt)
`;

fs.writeFileSync(path.join(deployRoot, "DEPLOY.txt"), note);

console.log("Deploy bundle created at ./deploy");
