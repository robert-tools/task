// 📦 external dependencies
import { command } from '@robert.tools/cmd';
import { cyan, green, LOG, red, yellow } from '@robert.tools/log';
import { $string } from '@robert.tools/typings';
import { ChildProcess, spawn, SpawnOptions } from 'child_process';
import { APP, PROCESSES, TASK, TASKS } from './index.d';
import { FS } from '@robert.tools/fs';

/**
 * 🎯 Get the command-line arguments passed to the script.
 * @returns {string[]} 📤 array of the arguments
 */
export const getArgs = (): string[] => {
    return process.argv.slice(3); // TODO: detect 2 oder 3
};

/**
 * 🎯 Get the name of the task from the command-line arguments.
 * @param {boolean} isFileName ➡️ task name is a file name and not param
 * @returns {$string} 📤 name of the task
 */
export const getName = (isFileName = false): $string => {
    if (isFileName) {
        const taskFile = process.argv[1];
        if (!taskFile) {
            return taskFile;
        }
        const taskName = taskFile.split('/').pop()?.split('.').shift() ?? '';
        return taskName;
    }
    const taskName = process.argv[2];
    return taskName; // TODO: detect 2 oder 3
};

/**
 * 🎯 Get environment information for the current task.
 * @param {boolean} isFileName ➡️ task name is a file name and not param
 * @returns {boolean} 📤 true if environment information is available
 */
export const getEnvInfo = (isFileName = false): boolean => {
    const name = getName(isFileName);
    if (!name) {
        LOG.FAIL('No task name provided.');
        return false;
    }
    const NODE_ENV = process.env.NODE_ENV;
    const hasEnv = NODE_ENV !== undefined;
    const env = hasEnv ? green(NODE_ENV) : yellow(NODE_ENV);
    LOG.OK(`🚀 Starting ${cyan(name)} task ... [NODE_ENV=${env}]`);
    return true;
};

/**
 * 🎯 Check for running processes matching the given name.
 * @param {string} name ➡️ name of process to check
 * @returns {string} 📤 output of the process check
 */
export const checkProcess = (name: string): string => {
    const finalName = `[${name[0]}]${name.slice(1)}`;
    const result = command(`ps aux | grep "${finalName}"`);
    return result.trim();
};

/**
 * 🎯 Check for old development processes.
 * @param {string[]} names ➡️ array of process names to check
 * @returns {boolean} 📤 true if no old processes are detected, false otherwise
 */
export const checkOldProcesses = (names: string[] = []): boolean => {
    const defaultNames = ['vite', 'eleventy'];
    const hasNames = names.length > 0;
    const checkedNames = names.length > 0 ? names : defaultNames;
    let processResult = '';
    for (const name of checkedNames) {
        processResult += checkProcess(`/node_modules/.bin/${name}`) + '\n';
    }
    const exit = processResult.trim().length > 0;
    if (exit) {
        LOG.WARN('Old development processes detected.');
        LOG.DEBUG(`Old processes:\n ${processResult}`);
        // stop script here
        LOG.FAIL('Stopping due to running development processes.');
    } else {
        const strNames = checkedNames.join(', ');
        const val = hasNames ? green(strNames) : yellow(strNames);
        const defaultStr = hasNames ? '' : '[default]';
        LOG.OK(`🧪 check old processes ${val} ${defaultStr}`);
    }
    return exit === false;
};

/**
 * 🎯 Start the specified processes as child processes.
 * @param {TASKS} processes ➡️ array of tasks to start
 * @returns {PROCESSES} 📤 array of spawned child processes
 */
export const startProcesses = (processes: TASKS): PROCESSES => {
    const children: ChildProcess[] = [];
    for (const { command, args } of processes) {
        if (command && command !== '') {
            const proc = green(`${command} ${args.join(' ')}`);
            const config: SpawnOptions = { stdio: 'inherit', shell: true };
            const child = spawn(command, args, config);
            // check if issue
            const pid = child.pid;
            LOG.OK(`🚀 Starting process: ${proc} [PID: ${cyan(pid)}]`);
            children.push(child);
        }
    }
    return children;
};

/**
 * 🎯 Run any command
 * @param {string} command ➡️ command to run
 * @param {string[]} args ➡️ array of arguments to pass to the command
 * @returns {TASK} 📤 object containing the tasks
 */
export const run = (command: string, args: string[] = []): TASK => {
    return { command, args };
};

/**
 * 🎯 Run a npm task
 * @param {string} command ➡️ name of the npm task to run
 * @param {string[]} args ➡️ array of arguments to pass to the npm task
 * @returns {TASK} 📤 object containing the tasks
 */
export const runNpm = (command: string, args: string[] = []): TASK => {
    if (command === '') {
        LOG.FAIL('No npm task name provided.');
        return { command: '', args: [] };
    }
    return { command: 'npm', args: ['run', command, ...args] };
};

/**
 * 🎯 Run a task by name
 * @param {string} name ➡️ name of the task to run
 * @param {string[]} args ➡️ array of arguments to pass to the task
 * @returns {TASK} 📤 object containing the tasks
 */
export const runTask = (name: string, args: string[] = []): TASK => {
    const appFile = `src/setup/scripts/${name}.ts`;
    const has = FS.hasFile(appFile);
    if (!has) {
        LOG.FAIL(`Task file not found: ${appFile}`);
        return { command: '', args: [] };
    }
    return { command: 'tsx', args: [appFile, ...args] };
};

/**
 * 🎯 Shut down all child processes.
 * @param {ChildProcess[]} children ➡️ array of child processes to shut down
 */
export const shutdown = (children: ChildProcess[]) => {
    for (const child of children) {
        LOG.INFO(`🧹 Shutting down child process with PID: ${child.pid}`);
        child.kill();
    }
};

/**
 * 🎯 Check the environment for required conditions
 * @param {boolean} isFileName ➡️ task name is a file name and not param
 * @returns {boolean} ➡️ true if environment is valid, false otherwise
 */
export const checkEnv = (isFileName = false): boolean => {
    if (!getEnvInfo(isFileName)) return false;
    if (!checkOldProcesses()) return false;
    return true;
};

/**
 * 🎯 Start a specific app using npm
 * @param {string} appName ➡️ name of the app to start
 * @param {string} param ➡️ additional parameters to pass to the app
 * @returns {TASK} 📤 object containing the tasks
 */
export const startApp = (appName: string, param: string = ''): TASK => {
    const args = ['--', appName, ...param.split(' ')].filter(
        (item: string) => item !== ''
    );
    return runNpm('start_app', args);
};

/**
 * 🎯 Start multiple apps using npm
 * @param apps ➡️ array of apps to start
 * @returns {TASK[]} 📤 array of objects containing the tasks for each app
 */
export const startApps = (apps: APP[]): TASK[] => {
    const result: TASK[] = [];
    for (const app of apps) {
        const name = typeof app === 'string' ? app : app.name;
        const param = typeof app === 'string' ? '' : app.args;
        result.push(startApp(name, param));
    }
    return result;
};
/**
 * 🎯 Build a specific app using tsx
 * @param {string} appName ➡️ name of the app to build
 * @param {string} param ➡️ additional parameters to pass to the build command
 * @returns {TASK} 📤 object containing the tasks for building the app
 */
export const buildApp = (appName: string, param: string = ''): TASK => {
    const appFile = `src/backend/apps/${appName}/index.ts`;
    if (!FS.hasFile(appFile)) {
        LOG.FAIL(`📦 Building app: ${red(appName)} not exists`);
        return { command: '', args: [] };
    } else {
        LOG.OK(`📦 Building app: ${green(appName)}`);
    }
    return run('tsx', [appFile, param]);
};
/**
 * 🎯 Build multiple apps using tsx
 * @param apps ➡️ array of apps to build
 * @returns {TASK[]} 📤 array of objects containing the tasks for each app
 */
export const buildApps = (apps: APP[]): TASK[] => {
    const result: TASK[] = [];
    for (const app of apps) {
        const name = typeof app === 'string' ? app : app.name;
        const param = typeof app === 'string' ? '' : app.args;
        result.push(buildApp(name, param));
    }
    return result;
};

/**
 * 🎯 Start Vite with the specified type and optional config
 * @param {string} type ➡️ type of Vite command (default: 'serve')
 * @param {string} config ➡️ optional path to the Vite config file
 * @returns {TASK} 📤 object containing the task for starting Vite
 */
export const startVite = (type = 'serve', config?: string): TASK => {
    const args = [type, ...(config ? ['--config', config] : [])];
    return run('vite', args);
};
/**
 * 🎯 Start Eleventy with optional serve flag
 * @param {boolean} serve ➡️ whether to start Eleventy with the serve option (default: true)
 * @returns {TASK} 📤 object containing the task for starting Eleventy
 */
export const startEleventy = (serve = true): TASK => {
    const has = FS.hasFile('.eleventy.shim.js');
    if (!has) {
        LOG.FAIL(`Eleventy shim not exist: .eleventy.shim.js`);
        return { command: '', args: [] };
    }
    const args = ['--config=.eleventy.shim.js', ...(serve ? ['--serve'] : [])];
    return run('eleventy', args);
};

// 🗃️ export types
export type { APP, TASKS, TASK as TASK_NEW, PROCESSES } from './index.d';
