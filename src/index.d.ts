/**
 * 🏷️ typing module
 * @version 1.0.1
 * @date 2026-11-11
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */
export type APP = string | { name: string; args: string };
export type TASK = { command: string; args: string[] };
export type TASKS = TASK[];
export type PROCESSES = ChildProcess[];
