import { XCoord, YCoord, Coord, Type, KING_ROW_TYPES, ARR_8, 
    X_COORD_NAMES, Y_COORD_NAMES, Active, SanType, Captured, Moved } from "./constants.js";
import { piecesToStr } from "./utility.js";
import { debugCoord, debugPiece, debugMove } from './debug.js';


export const isXOnBoard = (piece) =>
{
    const xRange = piece & XCoord.RANGE_ON;

    return !(xRange === 0 || xRange === XCoord.RANGE_ON);
}

export const isYOnBoard = (piece) =>
{
    const yRange = piece & YCoord.RANGE_ON;

    return !(yRange === 0 || yRange === YCoord.RANGE_ON);
}

export const isOnBoard = (piece) =>
{
    return isXOnBoard(piece) && isYOnBoard(piece);
}

export const coordNameToCoordBits = (coordName) => 
    XCoord[coordName[0]] + YCoord[coordName[1]];

export const createKingRow = (isActive, y) =>
    KING_ROW_TYPES.map((type, x) =>
    {
        const value = isActive + type
        + XCoord[X_COORD_NAMES[x]] + YCoord[Y_COORD_NAMES[y]];

        return value;
    });

export const createPawnRow = (isActive, y) =>
    ARR_8.map((x) =>
        isActive + Type.PAWN 
        + XCoord[X_COORD_NAMES[x]] + YCoord[Y_COORD_NAMES[y]]);
    
export const STANDARD_PIECES = [
    ...createKingRow(Active.TRUE, 0), ...createPawnRow(Active.TRUE, 1),
    ...createPawnRow(Active.FALSE, 6), ...createKingRow(Active.FALSE, 7)
];

export const PAWN_PIECES = [
    ...createPawnRow(Active.TRUE, 1),
    ...createPawnRow(Active.FALSE, 6)
];