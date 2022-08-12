import { Active, Coord, Moved, Type, Direction, Enpassent, PAWN_CAPTURE_DIRECTIONS, PAWN_PUSH_DIRECTION, Captured } from "./constants.js";
import { debugPiece, debugCoord } from "./debug.js";
import { isOnBoard } from './helpers.js';


const modifyPieces = (pieces, replacePiece, replaceIndex, removeIndex=null) =>
{
    const nextPieces = pieces.slice();

    nextPieces[replaceIndex] = replacePiece;
    if (removeIndex !== null) nextPieces.splice(removeIndex, 1);

    return nextPieces;
}

export const findMoves = (pieces) =>
{
    const moves = [];

    const coordMap = new Map(pieces.map((piece) => 
        [piece & Coord.ON, piece]));
    const indexMap = new Map((pieces.map((piece, index) => 
        [piece, index])));

    const activePieces = pieces.filter((piece) => 
        ((piece & Active.ON) === Active.TRUE));

    for (let piece of activePieces)
    {
        const index = indexMap.get(piece);

        if ((piece & Active.ON) === Active.TRUE)
        {
            if (!coordMap.has(piece + Direction.NORTH & Coord.ON))
            {
                if ((piece & Moved.ON) === Moved.FALSE)
                {
                    if (!coordMap.has(piece + PAWN_PUSH_DIRECTION & Coord.ON))
                    {
                        const nextPiece = piece + PAWN_PUSH_DIRECTION + Moved.TRUE;
                        const nextPieces = modifyPieces(pieces, nextPiece, index);

                        moves.push({ piece, nextPieces, nextPiece });
                    }
                    const nextPiece = piece + Direction.NORTH + Moved.TRUE;
                    const nextPieces = modifyPieces(pieces, nextPiece, index);

                    moves.push({ piece, nextPiece, nextPieces });
                }
                else
                {
                    const nextPiece = piece + Direction.NORTH;
                    const nextPieces = modifyPieces(pieces, nextPiece, index);
                    moves.push({ piece, nextPiece, nextPieces });
                }
            }
        }

        for (let direction in PAWN_CAPTURE_DIRECTIONS)
        {
            if (coordMap.has(piece + direction & Coord.ON))
            {
                const occupier = coordMap.get(piece + direction & Coord.ON);
                if (occupier & Active.ON === Active.FALSE)
                {
                    const nextPiece = piece + direction;
                    const capturedIndex = indexMap.get(occupier);
                    const nextPieces = modifyPieces(pieces, nextPiece, nextPieces, 
                        capturedIndex);
                    
                    moves.push({piece, nextPiece, nextPieces, occupier });
                }
            }
        }
    }
    return moves;
}

const movePawn = (pawn, coordMap) =>
{
    const moves = [];

    const coord = pawn & Coord.MASK;

    // move forward
    if (!coordMap.has(coord + Direction.NORTH))
    {
        moves.push(pawn + Direction.NORTH);
    }
    else
    {

    }

    // capture
    for (let direction in PAWN_CAPTURE_DIRECTIONS)
    {
        let nextCoord = coord + direction;
        if (coordMap.has(nextCoord))
        {
            const occupier = coordMap.get(nextCoord);

            if ((occupier & Active.MASK) === Active.FALSE)
            {
                moves.push([pawn, occupier]);
            }
        }
    }
    return moves;
}