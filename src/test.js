import _ from 'lodash';

import { debugQ } from './debug.js';
import { PAWN_PIECES, STANDARD_PIECES, isOnBoard, parseQfromSAN } from './helpers.js';

const testCases = [
    ["Naxa4", { type: "KNIGHT", pos1: { x: "a" }, pos2: { x: "a", y: "4"}, capture: true, }],
    ["b7Q", { pos1: { x: "b", y: "7" }, pos2: {}, promote: "QUEEN" }],
    ["Rb6xb8", { type: "ROOK", pos1: { x: "b", "y": "6" }, pos2: { x: "b", y: "8"}, capture: true }]
];

for (let [san, compareQ] of testCases)
{
    const result = debugQ(parseQfromSAN(san));

    console.log(_.isEqual(compareQ, result), result, compareQ);
}