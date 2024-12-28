jest.mock('fs', () => ({ readFileSync: jest.fn(() => `
    import { abc } from 'def';

    export class A {
        constructor() {
            console.log('Hello, World!');
        }
    }
    `) })
);
import { mockVsWorkspaceFolder } from '../__tests__/utils.spec';
import { LocCounter } from './loc-counter';
describe('loc-counter', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should correctly count the lines of code for a .ts file", () => {
        const filePath = 'myboguspath.ts';
        mockVsWorkspaceFolder();
        
        const counter = new LocCounter();
        const count = counter.getValue(filePath);
        expect(count).toBe(6);
    });
});