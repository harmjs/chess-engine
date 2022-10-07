import { Active, Coord, Moved, Type, Direction, Enpassent, 
    PAWN_CAPTURE_DIRECTIONS, PAWN_PUSH_DIRECTION, Captured, 
    YCoord, IXCoord, XCoord, IYCoord, ENPASSANT_CAPTURE_DIRECTIONS, KNIGHT_DIRECTIONS, CARDINAL_DIRECTIONS, DIRECTIONS, INTERCARDINAL_DIRECTIONS
} from "./constants.js";
import { debugPiece, debugCoord } from "./debug.js";
import { isOnBoard } from './helpers.js';

// the replace index doesn't actual need to be known
// all we have to do is remove the pieces and order them by length

const modifyPieces = (pieces, replacePiece, replaceIndex, removeIndex=null) =>
{
    const nextPieces = pieces.slice();

    nextPieces[replaceIndex] = replacePiece;
    if (removeIndex !== null) nextPieces.splice(removeIndex, 1);

    return nextPieces;
}

const findPawnMoves = (from, indexMap, coordMap, moves, pieces) =>
{
    const index = indexMap.get(from);
    if ((from & Active.ON) === Active.TRUE)
    {
        if (!coordMap.has(from + Direction.NORTH & Coord.ON))
        {
            if ((from & Moved.ON) === Moved.FALSE)
            {
                if (!coordMap.has(from + PAWN_PUSH_DIRECTION & Coord.ON))
                {
                    const to = from + PAWN_PUSH_DIRECTION + Moved.TRUE + Enpassent.TRUE;
                    const nextPieces = modifyPieces(pieces, to, index);

                    moves.push({ from, to, nextPieces });
                }
                const to = from + Direction.NORTH + Moved.TRUE;
                const nextPieces = modifyPieces(pieces, to, index);

                moves.push({ from, to, nextPieces });
            }
            else
            {
                const to = from + Direction.NORTH;
                const nextPieces = modifyPieces(pieces, to, index);
                moves.push({ to, from, nextPieces });
            }
        }
    }

    for (let direction of PAWN_CAPTURE_DIRECTIONS)
    {
        if (coordMap.has((from + direction) & Coord.ON))
        {
            const captured = coordMap.get((from + direction) & Coord.ON);
            if ((captured & Active.ON) === Active.FALSE)
            {
                const to = from + direction + Captured.TRUE;
                const capturedIndex = indexMap.get(captured);
                const nextPieces = modifyPieces(pieces, to, index, 
                    capturedIndex);
                
                moves.push({ captured, to, from, nextPieces });
            }
        }
    }

    // Enpassent logic
    if ((from & YCoord.ON) === IYCoord["5"])
    {
        for (let direction of ENPASSANT_CAPTURE_DIRECTIONS)
        {
            if (coordMap.has((from + direction) & Coord.ON))
            {
                const captured = coordMap.has((from + direction));

                if (captured & Enpassent.ON === Enpassent.TRUE)
                {
                    const to = from + direction + Captured.TRUE;
                    const capturedIndex = indexMap.get(captured);
                    const nextPieces = modifyPieces(pieces, to, index, 
                        capturedIndex);

                    moves.push(moves.push({ captured, to, from, nextPieces }));
                }
            }
        }
    }
}

const createFindMovesInLineDirections = (lineDirections) => ((from, indexMap, coordMap, moves, pieces) => 
{
    const index = indexMap.get(from);
    for (let lineDirection of lineDirections)
    {
        let multiplier = 1;

        while (true)
        {
            let to = lineDirection * multiplier;

            if (!isOnBoard(to))
            {
                break;
            }
            else if (coordMap.has(to & Coord.ON))
            {
                const captured = coordMap.get(to & Coord.ON)

                if ((captured & Active.ON) === Active.FALSE)
                {
                    const capturedIndex = indexMap.get(captured);
                    const nextPieces = modifyPieces(pieces, to, index, 
                        capturedIndex);
                    to = to + Captured.TRUE;

                    moves.push({ captured, to, from, nextPieces });
                }
                break;
            }
            else
            {
                const nextPieces = modifyPieces(pieces, to, index, 
                    capturedIndex);
                moves.push({ to, from, nextPieces });
            }
            multiplier += 1;
        }
    }
});


const createFindMovesInDirections = (directions) => ((from, indexMap, coordMap, moves, pieces) =>
{
    const index = indexMap.get(from);
    for (let direction of directions)
    {
        let to = from + direction;

        if (coordMap.has(to & Coord.ON))
        {
            const captured = coordMap.has(to & Coord.ON);

            if ((captured & Active.ON) === Active.FALSE)
            {
                const capturedIndex = indexMap.get(captured);
                const nextPieces = modifyPieces(pieces, to, index, 
                    capturedIndex);
                to = to + Captured.TRUE;

                moves.push({ captured, to, from, nextPieces });
            }
        }
        else if (isOnBoard(to))
        {
            const nextPieces = modifyPieces(pieces, to, index, 
                capturedIndex);
            to = to + Captured.TRUE;

            moves.push({ captured, to, from, nextPieces });
        }
    }
});

const findMovesByType =  new Map([
    [Type.PAWN, findPawnMoves],
    [Type.KNIGHT, createFindMovesInDirections(KNIGHT_DIRECTIONS)],
    [Type.BISHOP, createFindMovesInLineDirections(INTERCARDINAL_DIRECTIONS)],
    [Type.ROOK, createFindMovesInLineDirections(CARDINAL_DIRECTIONS)],
    [Type.QUEEN, createFindMovesInLineDirections(DIRECTIONS)],
    [Type.KING, createFindMovesInDirections(DIRECTIONS)]
]);

export const findMoves = (pieces) =>
{
    const moves = [];

    const coordMap = new Map(pieces.map((piece) =>
        [piece & Coord.ON, piece]));
    const indexMap = new Map((pieces.map((piece, index) => 
        [piece, index])));

    const activePieces = pieces.filter((piece) => 
        ((piece & Active.ON) === Active.TRUE));

    for (let from of activePieces) findMovesByType.get(from & Type.ON)
        (from, indexMap, coordMap, moves, pieces);

    return moves;
}