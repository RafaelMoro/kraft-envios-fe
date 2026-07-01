import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const commandFiles = [
  ['research.md', 'research.prompt.md'],
  ['plan.md', 'plan.prompt.md'],
  ['implement.md', 'implement.md'],
  ['frontend-design.md', 'frontend-design.prompt.md'],
];

for (const [sourceName, targetName] of commandFiles) {
  const source = join(root, '.opencode', 'command', sourceName);
  const githubTarget = join(root, '.github', 'prompts', targetName);
  const claudeTarget = join(root, '.claude', 'commands', sourceName);

  mkdirSync(dirname(githubTarget), { recursive: true });
  copyFileSync(source, githubTarget);
  console.log(`${sourceName} -> ${targetName}`);

  mkdirSync(dirname(claudeTarget), { recursive: true });
  copyFileSync(source, claudeTarget);
  console.log(`${sourceName} -> .claude/commands/${sourceName}`);
}

const skillFiles = [
  'frontend-design',
];

for (const skillName of skillFiles) {
  const source = join(root, '.opencode', 'skills', skillName, 'SKILL.md');
  const target = join(root, '.claude', 'skills', skillName, 'SKILL.md');

  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  console.log(`${skillName}/SKILL.md -> .claude/skills/${skillName}/SKILL.md`);
}
