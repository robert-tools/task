# Changelog

## 1.0.1

### 🗃️ API changes

Allow reading process name from file name instead of command line argument.
This is useful when running tasks from a script file.

- updated: getName(isFileName: boolean)
- updated: getEnvInfo(isFileName: boolean)
- updated: checkEnv(isFileName: boolean)

## 1.0.0

### ⚙️ chore

- setup

### 🗃️ API changes

- add: getArgs
- add: getName
- add: getEnvInfo
- add: checkProcess
- add: checkOldProcesses
- add: startProcesses
- add: run
- add: runNpm
- add: runTask
- add: shutdown
- add: checkEnv
- add: startApp
- add: startApps
- add: buildApp
- add: buildApps
- add: startVite
- add: startEleventy
