# 🗂️ @robert.tools/task

A system to run tasks

## 📜 Usage

### 🟢 Installation

```bash
npm install @robert.tools/task
```

### 📝 Sample usage

```typescript
import { task } from '@robert.tools/task';

task('hello'); // 'task: hello'
```

## 🗃️ commands

After an npm install with `npm i` the following commands are available:

* get command line arguments: `getArgs()`
* get the task name: `getName()`
* get environment info: `getEnvInfo()`
* check a process: `checkProcess(name)`
* check old processes: `checkOldProcesses(name[])`
* start processes: `startProcesses(TASKS)`
* run a command: `run(command, args)`
* run a task: `runTask(name, args)`
* shutdown: `shutdown(ChildProcess[])`
* check environment: `checkEnv()`
* start an app: `startApp(appName, param)`
* start multiple apps: `startApps(APP[])`
* build an app: `buildApp(appName, param)`
* build multiple apps: `buildApps(APP[])`

### specific

* run an npm command: `runNpm(command, args)`
* start Vite: `startVite(type, config)`
* start Eleventy: `startEleventy(serve)`

## ⚖️ Notes

This software is hand-crafted, test-driven and assisted by AI tools. I know each
line of my code. ✌️

| Tool | Comment |
| --- | --- |
| ![assisted by Jest](https://img.shields.io/badge/Jest-TDD-008800?logo=jest) | Test-driven development with Jest |
| ![assisted by robert.tools](https://img.shields.io/badge/robert.tools-ecosystem-008800) | Part of the robert.tools ecosystem |
| ![assisted by GitHub Copilot](https://img.shields.io/badge/GitHub_Copilot-assisted-8A2BE2?logo=githubcopilot) | Code completion |
| ![assisted by OpenAI](https://img.shields.io/badge/OpenAI-assisted-8A2BE2?logo=openai) | chatGPT research |
