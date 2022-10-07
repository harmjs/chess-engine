import { Moved, Type, XCoord, YCoord, Coord, Active, Enpassent, Y_COORD_NAMES,
    Y_COORD_NAMES_REVERSED, ACTIVE_TYPE_TO_CHAR, X_COORD_NAMES, ActiveType, IType, IXCoord, IYCoord, Captured
} from './constants.js';

import { coordNameToCoordBits, isXOnBoard, isYOnBoard, isOnBoard } from './helpers.js';

const boardStart     = "___|_________________________|___ \n";
const boardEnd       = "‾‾‾|‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾|‾‾‾ \n";
const boardHorLegend = "   | aa bb cc dd ee ff gg hh | \n";

export const debugBoard = (pieces, yFlipped) =>
{
    let boardStr = boardHorLegend + boardStart;

    const yCoordNames = yFlipped ? Y_COORD_NAMES : Y_COORD_NAMES_REVERSED;

    const coordMap = new Map(pieces.filter(isOnBoard).map((piece) => 
        [piece & Coord.ON, piece]));


    for (let y = 0; y < 8; y++)
    {
        const yCoordName = yCoordNames[y];

        boardStr += yCoordName + "  |";
        
        for (let x = 0; x < 8; x++)
        {
            const xCoordName = X_COORD_NAMES[x];
            const coord = coordNameToCoordBits(xCoordName + yCoordName);

            if (coordMap.has(coord))
            {
                const activeType = coordMap.get(coord) & ActiveType.ON;
                boardStr += ` ${ACTIVE_TYPE_TO_CHAR[activeType]}`;
            }
            else 
            {
                boardStr += " ··";
            }
        }
        boardStr += ` |  ${yCoordName} \n`;
    }

    return  boardStr + boardEnd + boardHorLegend;
}

export const debugFile = (piece) =>
{
    return IXCoord[piece & XCoord.ON];
}

export const debugRank = (piece) =>
{
    return IYCoord[piece & YCoord.ON];
}

export const debugXCoord = (piece) =>
{
    if (isXOnBoard(piece)) return IXCoord[piece & XCoord.ON];
    if ((piece & XCoord) === 0) return "UNDEFINED";
    return "OUT_OF_RANGE";
}

export const debugYCoord = (piece) =>
{
    if (isYOnBoard(piece)) return IYCoord[piece & YCoord.ON];
    if ((piece & YCoord) === 0) return "UNDEFINED";
    return "OUT_OF_RANGE";
}

export const debugCoord = (piece) => ({ 
    x: debugXCoord(piece),  
    y: debugYCoord(piece) });

export const debugType = (piece) => IType[(piece & Type.ON)];

export const debugPiece = (piece, short=false) =>
{
    const type = (piece & Type.ON);
    const active = (piece & Active.ON);
    
    const coord = debugCoord(piece)

    const debug = {
        active: active === Active.TRUE,
        type: IType[type],
        x: coord.x,
        y: coord.y
    };

    if (short) return debug;

    const capture = (piece & Captured.ON) === Captured.TRUE;

    if (capture) debug["capture"] = true;

    if (type === Type.PAWN || type === Type.ROOK || type === Type.KING)
        debug["moved"] = (piece & Moved.ON) === Moved.TRUE;

    if (type === Type.PAWN)
        debug["enpassent"] = (piece & Enpassent.ON) === Enpassent.TRUE;

    return debug;
}

export const debugMove = (move, short=false) =>
{
    return { 
        from: debugPiece(move.from, short),
        to: debugPiece(move.to, short)
    };
}

export const debugBin = (piece) => piece.toString(2).padStart(16, '0');


const debugQPos = ({ x, y }) =>
{
    const qPos = {};

    if (x) qPos.x = debugFile(x);
    if (y) qPos.y = debugRank(y);

    return qPos;
}

export const debugQ = ({ type, pos1, pos2, capture, promote }) => 
{
    const debug = {};

    if (type) debug.type = debugType(type);
    if (pos1) debug.pos1 = debugQPos(pos1);
    if (pos2) debug.pos2 = debugQPos(pos2);
    if (capture) debug.capture = capture;
    if (promote) debug.promote = debugType(promote);

    return debug;
}