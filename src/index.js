import { Active, Type, TYPE_NAMES, XCoord, X_COORD_NAMES, YCoord, Coord, Y_COORD_NAMES } from './constants.js';
import { debugBoard, debugPiece, debugMove, debugCoord } from './debug.js';
import { findMoves } from './evaluate.js';

import { parseMovefromSAN, findMoveInMoves, sanLibrary } from './san.js';

import { PAWN_CAPTURE_DEBUG, PAWN_PIECES, STANDARD_PIECES } from './helpers.js';


const moves = findMoves(PAWN_CAPTURE_DEBUG);

console.log(moves.length);

console.log(sanLibrary(findMoves(PAWN_CAPTURE_DEBUG)));
