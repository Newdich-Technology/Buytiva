import { spawnSync } from 'node:child_process';

const environment = {
	...process.env,
	DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://ci:ci@localhost:5432/buytiva'
};

const preparationCommands = [
	['db:generate'],
	['--filter', '@buytiva/web', 'exec', 'svelte-kit', 'sync'],
	['exec', 'vitest', 'run']
];

for (const argumentsList of preparationCommands) {
	const command = argumentsList[0] === 'db:generate' ? ['run', ...argumentsList] : argumentsList;
	const result = spawnSync('pnpm', command, { stdio: 'inherit', env: environment });
	if (result.status !== 0) process.exit(result.status ?? 1);
}
