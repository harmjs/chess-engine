import { debugQ } from './debug.js';
import { PAWN_PIECES, STANDARD_PIECES, isOnBoard, parseQfromSAN } from './helpers.js';
import { XCoord, YCoord, Type, KNIGHT_DIRECTIONS, Active, Direction, Coord, Moved, PAWN_PUSH_DIRECTION, KING_ROW_TYPES } from './constants.js';
import { findMoves } from './evaluate.js';

import _ from 'lodash';

//const plays = findMoves(PAWN_PIECES);

//console.log(plays);

//console.log(debugBoard(PAWN_PIECES));

const debugQParse = (san) => console.log(debugQ(parseQfromSAN(san)));

const testQParseFromSan = (san, compareQ) =>
{
    const qDebug = debugQ(parseQfromSAN(san));
    return _.isEqual(qDebug, compareQ);
}

const testCases = [
    ["Naxa4", { type: "KNIGHT", pos1: { x: "a" }, pos2: { x: "a", y: "4"}, capture: true, }],
    ["b7Q", { type: "PAWN", pos1: { x: "b", y: "7" }, promote: "QUEEN" }],
    ["Rb6xb8", { type: "ROOK", pos1: { x: "b", "y": "6" }, pos2: { x: "b", y: "8"}, capture: true }]
];

for (let [san, compareQ] of testCases)
{
    const result = debugQ(parseQfromSAN(san));

    console.log(_.isEqual(compareQ, result), result, compareQ);
}

//console.log(plays.length);
//plays.map((pieces) => console.log(debugBoard(pieces)));