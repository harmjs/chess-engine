import { XCoord, YCoord, Coord, Type, KING_ROW_TYPES, ARR_8, 
    X_COORD_NAMES, Y_COORD_NAMES, Active, SanType } from "./constants.js";

export const isOnBoard = (coord) =>
{
    const xRange = coord & XCoord.RANGE_ON;

    if (xRange === 0 || xRange === XCoord.RANGE_ON) return false;
    
    const yRange = coord & YCoord.RANGE_ON;

    if (yRange === 0 || yRange === YCoord.RANGE_ON) return false;

    return true;
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
    ...createPawnRow(Active.FALSE, 6),
    ...createPawnRow(Active.TRUE, 1)
];


const parseType = (san, q) =>
{
    if (san.length === 0) return san;
    if (san[0] in SanType)
    {
        q.type = SanType[san[0]];
        return san.substr(1);
    }

    q.type = Type.PAWN;
    return san;
}

const parsePos = (san, q, type) =>
{
    if (!san) return san;
    q[type] = {};

    if (san[0] in XCoord)
    {
        q[type].x = XCoord[san[0]];
        san = san.substr(1);
    }

    if (san[0] in YCoord)
    {
        q[type].y = YCoord[san[0]];
        san = san.substr(1);
    }

    return san;
}

export const parseCapture = (san, q) =>
{
    if (!san) return san;
    if (san[0] in SanType)
    {
        q.promotion = SanType[san[0]];
        san.substr(1);
    }

    return san;
}

export const parsePromotion = (san, q) =>
{

    if (!san) return san;
    if (san[0] === "x")
    {
        q.capture = true;
        san.substr(1);
    }
}

export const parseQfromSAN = (san) =>
{
    const q = { };

    san = parseType(san, q);
    san = parsePos(san, q, "pos1");
    san = parseCapture(san, q)
    san = parsePos(san, q, "pos2");
    san = parsePromotion(san, q);

    return q;
}

const searchMovesFromSAN = (san, moves) =>
{
    const q = {};

    if (SanType.hasOwnProperty(san[0]))
    {
        q.type = SanType[san[0]];
    }
    else
    {
        q.type = Type.PAWN;
    }
}

export const intepretQ = function()
{

}


