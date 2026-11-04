/**
 * 🧪 testing module
 * @version 1.0.0
 * @date 2026-11-04
 * @license MIT
 * @author Robert Willemelis <github.com/willi84>
 */
import { sample } from './index';

describe('@robert.tools/task', () => {
    it('should return a task string', () => {
        expect(sample('hello')).toBe('sample: hello');
    });

    it('should return a task string with empty input', () => {
        expect(sample('')).toBe('sample: ');
    });
});
