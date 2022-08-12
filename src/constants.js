import { toggleUint16 } from './utility.js';
import invert from "lodash/invert.js"; 

export const ARR_8 = [...Array(8)].map((_, index) => index);
export const BOOL_NAMES = ["FALSE", "TRUE"];
export const TYPE_NAMES = [
    "PAWN", "KNIGHT", "BISHOP", "ROOK", "QUEEN", "KING", "MOVEMENT"
];

export const X_COORD_NAMES = ["a", "b", "c", "d", "e", "f", "g", "h"];
export const Y_COORD_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8"];

/*
 * Piece encoding into uint16:
 *   1 bit tracking whether piece has moved (only used for king, pawns, rooks)
 *   1 bit for tracking if piece can be captured using enpassent (only used for pawns)
 *   1 bit for whether it is the current pieces turn
 *   3 bits for type of piece
 *   4 bits for x position - (00xx or 11xx bits are out of bounds)
 *   4 bits for y poisition - (00xx or 11xx bits are out of bounds)
 *   1 bit for tracking if a peice has been captured
 *   1 bit unused
 */

export const VIEW_NAMES = [
    "MOVED", "ENPASSANT", "ACTIVE", "TYPE", "X_COORD", "Y_COORD", "CAPTURED", "UNUSED"
];

export const VIEW_SIZES = [1, 1, 1, 3, 4, 4, 1, 1];
export const VIEW_MASKS = (() => 
{
    const viewMasks = [];
    for (let a = 0, b = 0; a < VIEW_SIZES.length; b+= VIEW_SIZES[a], a++)
    {
        let viewMask = 0;
        for (let c = 0; c < VIEW_SIZES[a]; c++) 
            viewMask += 2 ** (b + c);
        viewMasks.push(viewMask);
    }
    return viewMasks;
})();

export const VIEW_FACTORS = (() => 
{
    const viewFactor = [1];
    for (let i = 0; i < VIEW_SIZES.length - 1; i++)
        viewFactor.push(viewFactor[i] * 2 ** VIEW_SIZES[i]);
    return viewFactor;
})();

const createFactoredEnum = (viewIndex, names, buffer = 0) =>
    names.reduce((factoredEnum, name, index) =>
    {
        factoredEnum[name] = (index + buffer) * VIEW_FACTORS[viewIndex];
        return factoredEnum;
    }, { ON: VIEW_MASKS[viewIndex], OFF: toggleUint16(VIEW_MASKS[viewIndex]) });

const ViewIndex = VIEW_NAMES.reduce((viewIndex, name, index) => 
{
    viewIndex[name] = index;
    return viewIndex;
}, {});

export const Moved = createFactoredEnum(ViewIndex.MOVED, BOOL_NAMES);
export const Enpassent = createFactoredEnum(ViewIndex.ENPASSANT, BOOL_NAMES);
export const Active = createFactoredEnum(ViewIndex.ACTIVE, BOOL_NAMES);
export const Type = createFactoredEnum(ViewIndex.TYPE, TYPE_NAMES);
export const XCoord = createFactoredEnum(ViewIndex.X_COORD, X_COORD_NAMES, 4);
export const YCoord = createFactoredEnum(ViewIndex.Y_COORD, Y_COORD_NAMES, 4);
export const Captured = createFactoredEnum(ViewIndex.CAPTURED, BOOL_NAMES, 1);

export const Coord = { 
    ON: XCoord.ON + YCoord.ON, 
    OFF: toggleUint16(XCoord.ON + YCoord.ON) 
};

XCoord.RANGE_ON = 2 ** 8 + 2 ** 9;
YCoord.RANGE_ON = 2 ** 12 + 2 ** 13;
Coord.RANGE_ON = XCoord.RANGE_ON + YCoord.RANGE_ON;

export const ActiveType = { ON: Active.ON + Type.ON };

export const KING_ROW_TYPES = [
    Type.ROOK, Type.KNIGHT, Type.BISHOP, Type.QUEEN,
    Type.KING, Type.BISHOP, Type.KNIGHT, Type.ROOK
];

const Cardinal = {
    NORTH: VIEW_FACTORS[ViewIndex.Y_COORD],
    SOUTH: -VIEW_FACTORS[ViewIndex.Y_COORD],
    EAST: VIEW_FACTORS[ViewIndex.X_COORD],
    WEST: -VIEW_FACTORS[ViewIndex.X_COORD]
};

const Intercardinal = {
    NORTH_EAST: Cardinal.NORTH + Cardinal.EAST,
    NORTH_WEST: Cardinal.NORTH + Cardinal.WEST,
    SOUTH_EAST: Cardinal.SOUTH + Cardinal.EAST,
    SOUTH_WEST: Cardinal.SOUTH + Cardinal.WEST 
};

export const Direction = Object.assign({}, Cardinal, Intercardinal);

export const KNIGHT_DIRECTIONS = [
    Direction.NORTH + Direction.NORTH_EAST, 
    Direction.EAST + Direction.NORTH_EAST,
    Direction.EAST + Direction.SOUTH_EAST,
    Direction.SOUTH + Direction.SOUTH_EAST,
    Direction.SOUTH + Direction.SOUTH_WEST,
    Direction.WEST + Direction.SOUTH_WEST,
    Direction.WEST + Direction.NORTH_WEST,
    Direction.NORTH + Direction.NORTH_WEST
];

export const PAWN_CAPTURE_DIRECTIONS = [Direction.NORTH_EAST, Direction.NORTH_WEST];
export const PAWN_PUSH_DIRECTION = Direction.NORTH + Direction.NORTH;

export const Y_COORD_NAMES_REVERSED = Y_COORD_NAMES.reverse();

export const ACTIVE_TYPE_TO_CHAR = {
    [Type.PAWN + Active.TRUE]: "♙ ",
    [Type.KNIGHT + Active.TRUE]: "♘ ",
    [Type.BISHOP + Active.TRUE]: "♗ ",
    [Type.ROOK + Active.TRUE]: "♖ ",
    [Type.QUEEN + Active.TRUE]: "♕ ",
    [Type.KING + Active.TRUE]: "♔ ",
    [Type.PAWN + Active.FALSE]: "♟︎ ",
    [Type.KNIGHT + Active.FALSE]: "♞ ",
    [Type.BISHOP + Active.FALSE]: "♝ ",
    [Type.ROOK + Active.FALSE]: "♜ ",
    [Type.QUEEN + Active.FALSE]: "♛ ",
    [Type.KING + Active.FALSE]: "♚ ",
    [Type.MOVEMENT + Active.TRUE]: "XX",
    [Type.MOVEMENT + Active.FALSE]: "XX"
};

export const SanType = {
    "N": Type.KNIGHT,
    "B": Type.BISHOP,
    "R": Type.ROOK,
    "Q": Type.QUEEN,
    "K": Type.KING
};

export const IType = invert(Type);
export const IXCoord = invert(XCoord);
export const IYCoord = invert(YCoord);