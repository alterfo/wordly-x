import {DB} from './DB';
import * as test from "node:test";
describe('DB', () => {
    test('Should be able to create DB', () => {
        expect(DB).toBeInstanceOf(DB);
    })
})
