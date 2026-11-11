/**
 * 🧪 testing module
 * @version 1.0.1
 * @date 2026-11-11
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */
import { cyan, green, LOG, red, yellow } from '@robert.tools/log';
import {
    buildApp,
    buildApps,
    checkEnv,
    checkOldProcesses,
    checkProcess,
    getArgs,
    getEnvInfo,
    getName,
    run,
    runNpm,
    runTask,
    shutdown,
    startApp,
    startApps,
    startEleventy,
    startProcesses,
    startVite,
} from './index';

import * as LIB from './index';

import type { TASKS, PROCESSES } from './index.d';

import * as CMD from '@robert.tools/cmd';
import { ChildProcess } from 'child_process';
import mock from 'mock-fs';

const mockCommand = (mock: string) =>
    jest.spyOn(CMD, 'command').mockImplementation(() => mock);

describe('✅ getArgs()', () => {
    const FN = getArgs;
    const SCRIPT = ['node', 'script.js'];
    const ARGS = ['arg1', 'arg2'];
    const ARGV = [...SCRIPT, 'task'];
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('should return the correct arguments', () => {
        jest.replaceProperty(process, 'argv', [...ARGV, ...ARGS]);
        expect(FN()).toEqual(['arg1', 'arg2']);
    });
    it('should return the correct arguments when no arguments are provided', () => {
        jest.replaceProperty(process, 'argv', [...ARGV]);
        expect(FN()).toEqual([]);
    });
    it('should return the correct arguments when only node and script are provided', () => {
        jest.replaceProperty(process, 'argv', SCRIPT);
        expect(FN()).toEqual([]);
    });
});
describe('✅ getName()', () => {
    const FN = getName;
    const name = 'task';
    const SCRIPT = ['node', 'script.js'];
    const ARGV = [...SCRIPT, name];
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('should return the correct name', () => {
        jest.replaceProperty(process, 'argv', [...ARGV, 'arg1', 'arg2']);
        expect(FN()).toEqual(name);
    });
    it('should return the correct name if its the file name', () => {
        jest.replaceProperty(process, 'argv', [...SCRIPT]);
        // expect(FN()).toEqual(name);
        expect(FN(true)).toEqual('script');
    });
    it('should return undefined when no file name provided', () => {
        jest.replaceProperty(process, 'argv', []);
        // expect(FN()).toEqual(name);
        expect(FN(true)).toEqual(undefined);
    });
    it('should return undefined when no argument is provided', () => {
        jest.replaceProperty(process, 'argv', SCRIPT);
        expect(FN()).toEqual(undefined);
    });
});
describe('✅ getEnvInfo()', () => {
    const FN = getEnvInfo;
    const SCRIPT = ['node', 'script.js'];
    const ARGV = [...SCRIPT, 'task'];
    let spyOK: jest.SpyInstance;
    let spyFAIL: jest.SpyInstance;
    beforeEach(() => {
        spyOK = jest.spyOn(LOG, 'OK');
        spyFAIL = jest.spyOn(LOG, 'FAIL');
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('should return true when task name and NODE_ENV are provided', () => {
        jest.replaceProperty(process, 'argv', [...ARGV]);
        jest.replaceProperty(process, 'env', { NODE_ENV: 'development' });
        expect(FN()).toEqual(true);
        const name = cyan('task');
        const env = green('development');
        const EXPECTED = `🚀 Starting ${name} task ... [NODE_ENV=${env}]`;
        expect(spyOK).toHaveBeenCalledWith(EXPECTED);
    });
    it('should return false when task name is not provided', () => {
        jest.replaceProperty(process, 'argv', SCRIPT);
        expect(FN()).toEqual(false);
        expect(spyFAIL).toHaveBeenCalledWith('No task name provided.');
    });
    it('should return true when NODE_ENV is not provided', () => {
        jest.replaceProperty(process, 'argv', [...ARGV]);
        jest.replaceProperty(process, 'env', {});
        expect(FN()).toEqual(true);
        const name = cyan('task');
        const env = yellow(undefined);
        const EXPECTED = `🚀 Starting ${name} task ... [NODE_ENV=${env}]`;
        expect(spyOK).toHaveBeenCalledWith(EXPECTED);
    });
});
describe('✅ checkProcess() and checkOldProcesses()', () => {
    const NAME = 'test';
    let spyOK: jest.SpyInstance;
    let spyFAIL: jest.SpyInstance;
    beforeEach(() => {
        spyOK = jest.spyOn(LOG, 'OK');
        spyFAIL = jest.spyOn(LOG, 'FAIL');
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('has process running', () => {
        const FN = checkProcess;
        const FN_2 = checkOldProcesses;
        const RESULT = '12 process\n24 other process';
        beforeEach(() => {
            mockCommand(RESULT);
        });
        it('should return the correct process string', () => {
            const result = FN(NAME);
            const EXPECTED = RESULT;
            expect(result).toEqual(EXPECTED);
        });
        it('should return false when old processes are detected', () => {
            expect(FN_2([NAME])).toEqual(false);
            const EXPECTED = 'Stopping due to running development processes.';
            expect(spyFAIL).toHaveBeenCalledWith(EXPECTED);
        });
    });
    describe('no process running', () => {
        const FN = checkProcess;
        const FN_2 = checkOldProcesses;
        beforeEach(() => {
            mockCommand('');
        });
        it('should return an empty string when no process is found', () => {
            expect(FN(NAME)).toEqual('');
        });
        it('should return true when no old processes are detected', () => {
            expect(FN_2([NAME])).toEqual(true);
            const msgOK = '🧪 check old processes';
            expect(spyOK).toHaveBeenCalledWith(expect.stringContaining(msgOK));
        });
    });
});
describe('✅ startProcesses()', () => {
    const FN = startProcesses;
    const COMMAND = 'echo';
    const ARGS = ['hello'];
    const TASKS: TASKS = [{ command: COMMAND, args: ARGS }];
    let spyOK: jest.SpyInstance;
    let children = [] as PROCESSES;
    beforeEach(() => {
        spyOK = jest.spyOn(LOG, 'OK');
    });
    afterEach(() => {
        jest.restoreAllMocks();
        children[0] && children[0].kill();
    });
    it('should start all processes and return child processes', () => {
        children = FN(TASKS);
        expect(children.length).toEqual(TASKS.length);
        const child = children[0];
        const pid = child.pid;
        expect(pid).toBeDefined();
        const EXPECTED = `🚀 Starting process: ${green(`${COMMAND} ${ARGS.join(' ')}`)} [PID: ${cyan(child.pid)}]`;
        expect(spyOK).toHaveBeenCalledWith(EXPECTED);
        expect(child.killed).toEqual(false);
        shutdown(children);
        expect(child.killed).toEqual(true);
    });
});
describe('✅ run()', () => {
    const FN = run;
    it('should return the correct TASK object', () => {
        const command = 'echo';
        const args = ['hello'];
        expect(FN(command, args)).toEqual({ command, args });
        expect(FN(command)).toEqual({ command, args: [] });
    });
});
describe('✅ runNPM()', () => {
    const FN = runNpm;
    afterEach(() => {
        mock.restore();
        jest.clearAllMocks();
    });
    it('should return the correct TASK object for npm run', () => {
        const command = 'build';
        const args = ['--prod'];
        const EXPECTED = { command: 'npm', args: ['run', command, ...args] };
        expect(FN(command, args)).toEqual(EXPECTED);
        expect(FN(command)).toEqual({ command: 'npm', args: ['run', command] });
    });
    it('should return an empty TASK object', () => {
        const spyFAIL = jest.spyOn(LOG, 'FAIL');
        const command = '';
        const args = ['--prod'];
        expect(FN(command, args)).toEqual({ command: '', args: [] });
        expect(spyFAIL).toHaveBeenCalledWith('No npm task name provided.');
    });
});
describe('✅ runTask()', () => {
    const FN = runTask;
    const tsx = 'tsx';
    const file = 'src/setup/scripts/sample.ts';
    afterEach(() => {
        mock.restore();
        jest.clearAllMocks();
    });
    it('should return the correct TASK object', () => {
        mock({ [file]: '' });
        const command = 'sample';
        const opt = 'hello';
        const args = [opt];
        expect(FN(command, args)).toEqual({ command: tsx, args: [file, opt] });
        expect(FN(command)).toEqual({ command: tsx, args: [file] });
    });
    it('should return an empty TASK object', () => {
        const spyFAIL = jest.spyOn(LOG, 'FAIL');
        mock({});
        const command = 'sample';
        const opt = 'hello';
        const args = [opt];
        expect(FN(command, args)).toEqual({ command: '', args: [] });
        expect(spyFAIL).toHaveBeenCalledWith(`Task file not found: ${file}`);
    });
});
describe('✅ shutdown', () => {
    const FN = shutdown;
    const pid = 1234;
    it('should shut down all child processes', () => {
        const mockChild = { pid, kill: jest.fn() } as unknown as ChildProcess;
        const spyINFO = jest.spyOn(LOG, 'INFO');
        FN([mockChild]);
        const EXPECTED = `🧹 Shutting down child process with PID: ${pid}`;
        expect(spyINFO).toHaveBeenCalledWith(EXPECTED);
        expect(mockChild.kill).toHaveBeenCalled();
    });
});
describe('✅ checkEnv', () => {
    const FN = checkEnv;
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it('should return false if environment info is not available', () => {
        jest.spyOn(LIB, 'getEnvInfo' as any).mockReturnValue(false);
        jest.spyOn(LIB, 'checkOldProcesses' as any).mockReturnValue(false);
        expect(FN()).toBe(false);
    });
    it('should return false if old processes are detected', () => {
        jest.spyOn(LIB, 'getEnvInfo' as any).mockReturnValue(true);
        jest.spyOn(LIB, 'checkOldProcesses' as any).mockReturnValue(false);
        expect(FN()).toBe(false);
        // mocks will be restored by afterEach
    });
    it('should return true if environment info is available and no old processes are detected', () => {
        jest.spyOn(LIB, 'getEnvInfo' as any).mockReturnValue(true);
        jest.spyOn(LIB, 'checkOldProcesses' as any).mockReturnValue(true);
        expect(FN()).toBe(true);
    });
});
describe('✅ startApp', () => {
    const FN = startApp;
    const appName = 'my-app';
    const param = '--prod';
    it('should return the correct TASK object', () => {
        const app = 'start_app';
        const command = 'npm';
        const args = ['run', app, '--', appName];
        expect(FN(appName)).toEqual({ command, args });
        expect(FN(appName, param)).toEqual({ command, args: [...args, param] });
    });
});
describe('✅ startApps', () => {
    const FN = startApps;
    const apps = ['my-app', { name: 'another-app', args: '--prod' }];
    it('should return the correct TASK objects', () => {
        const result = FN(apps);
        expect(result).toEqual([
            startApp('my-app'),
            startApp('another-app', '--prod'),
        ]);
    });
});
describe('✅ buildApp', () => {
    const FN = buildApp;
    const appName = 'my-app';
    const param = '--prod';
    const prefix = `📦 Building app: `;
    const appFile = `src/backend/apps/${appName}/index.ts`;
    afterEach(() => {
        mock.restore();
        jest.clearAllMocks();
    });
    it('should return the correct TASK object if app file exists', () => {
        mock({ [appFile]: 'content' });
        const spy = jest.spyOn(LOG, 'OK');
        const result = FN(appName, param);
        expect(result).toEqual({ command: 'tsx', args: [appFile, param] });
        expect(spy).toHaveBeenCalledWith(`${prefix}${green(appName)}`);
    });
    it('should return an empty TASK object if app file does not exist', () => {
        mock({});
        const spy = jest.spyOn(LOG, 'FAIL');
        const result = FN(appName);
        expect(result).toEqual({ command: '', args: [] });
        expect(spy).toHaveBeenCalledWith(`${prefix}${red(appName)} not exists`);
    });
});
describe('✅ buildApps', () => {
    const FN = buildApps;
    const apps = ['my-app', { name: 'another-app', args: '--prod' }];
    it('should return the correct TASK objects', () => {
        const result = FN(apps);
        expect(result).toEqual([
            buildApp('my-app'),
            buildApp('another-app', '--prod'),
        ]);
    });
});
describe('✅ startVite', () => {
    const FN = startVite;
    const command = 'vite';
    it('should return the correct TASK object with default parameters', () => {
        expect(FN()).toEqual({ command, args: ['serve'] });
        expect(FN('serve')).toEqual({ command, args: ['serve'] });
    });
    it('should return the correct TASK object with type and config', () => {
        const config = 'vite.config.js';
        const result = FN('build', config);
        const args = ['build', '--config', config];
        expect(result).toEqual({ command, args });
    });
});
describe('✅ startEleventy', () => {
    const FN = startEleventy;
    const command = 'eleventy';
    const shim = '.eleventy.shim.js';
    const config = `--config=${shim}`;
    afterEach(() => {
        mock.restore();
        jest.clearAllMocks();
    });
    it('should return the correct TASK object with serve option', () => {
        mock({ [shim]: 'content' });
        expect(FN()).toEqual({ command, args: [config, '--serve'] });
        expect(FN(true)).toEqual({ command, args: [config, '--serve'] });
    });
    it('should return the correct TASK object without serve option', () => {
        mock({ [shim]: 'content' });
        const result = FN(false);
        expect(result).toEqual({ command, args: [config] });
    });
    it('should return an empty TASK object if Eleventy shim does not exist', () => {
        mock({});
        const spy = jest.spyOn(LOG, 'FAIL');
        const result = FN();
        expect(result).toEqual({ command: '', args: [] });
        expect(spy).toHaveBeenCalledWith(`Eleventy shim not exist: ${shim}`);
    });
});
