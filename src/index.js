import { Active, Type, TYPE_NAMES, XCoord, X_COORD_NAMES, YCoord, Coord, Y_COORD_NAMES } from './constants.js';
import { debugBoard, debugPiece, debugMove, debugCoord } from './debug.js';
import { findMoves } from './evaluate.js';
import { start } from './cli.js';

import { parseMovefromSAN, createSanTree, findMoveInMoves } from './san.js';

import { PAWN_PIECES, STANDARD_PIECES } from './helpers.js';


start();

// ACTIVE === WHITE in this context
// 7 is 

//const pieces = PAWN_PIECES;
//const command = "e4";

//const q = parseQfromSAN(command);

//const moves = findMoves(pieces);

//const moves = findMoves(STANDARD_PIECES);
//const san = "e3";
//const move = parseMovefromSAN(san);

//const results = findMoveInMoves(move, [moves[9]]);

//const result = createSanTree(findMoves(STANDARD_PIECES));

//console.log(result);