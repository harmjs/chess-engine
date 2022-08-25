import { SanType, Type, Active, Moved, XCoord, YCoord, Coord, ISanType, Captured, IXCoord, IYCoord} from "./constants.js";
import { debugRank, debugType } from "./debug.js";


// san => move
// move => san


export const createSanTree = (moves) =>
{
    const sanTree = {};

    for (let [index, { toPiece, fromPiece }] of moves.entries())
    {
        const fromType = fromPiece & Type.ON;
        const toXCoord = toPiece & XCoord.ON;
        const toYCoord = toPiece & YCoord.ON;
        const toCapture = toPiece & Captured.ON;

        if (fromType === Type.PAWN & toCapture === Captured.FALSE)
        {
            const san = IXCoord[toXCoord] + IYCoord[toYCoord];
            sanTree[san] = index;
        }
    }

    for (let [value, key] of Object.entries(sanTree))
    {
        sanTree[value] = moves[key];
    }

    return sanTree;
}

export const parseMovefromSAN = (san) =>
{
    const move = {
        fromPiece: Active.TRUE + Type.PAWN,
        toPiece: Active.TRUE + Type.PAWN + Moved.TRUE
    };

    if (san.length && san[0] in SanType)
    {
        move.fromPiece = (move.fromPiece & Type.OFF) + SanType[san[0]];
        move.toPiece = (move.fromPiece & Type.OFF) + SanType[san[0]];
        san = san.substr(1);
    }

    if (san.length && san[0] in XCoord)
    {
        move.toPiece += XCoord[san[0]];
        san = san.substr(1);
    }

    if (san.length && san[0] in YCoord)
    {
        move.fromPiece += YCoord[san[0]]
        move.toPiece += YCoord[san[0]];
        san = san.substr(1);
    }

    if (san.length && san[0] === "x")
    {
        move.toPiece += Captured.TRUE;
        san = san.substr(1);
    }

    if (san.length && san[0] in XCoord)
    {
        move.toPiece = (move.toPiece & XCoord.OFF) + XCoord[san[0]];
        san = san.substr(1);
    } 
    else
    {
        move.fromPiece = (move.fromPiece & XCoord.OFF);
    }

    if (san.length && san[0] in YCoord)
    {
        move.toPiece = (move.toPiece & YCoord.OFF) + YCoord[san[0]];
        san = san.substr(1);
    }
    else
    {
        move.fromPiece = (move.fromPiece & YCoord.OFF);
    }

    if (san.length && san[0] in SanType)
    {
        move.toPiece = (move.toPiece & Type.OFF) + SanType[san[0]];
        san = san.substr(1);
    }

    return move;
}

const findMatchScore = (target, candidate) =>
{
    let score = 0;

    if ((target & Type.ON) !== (candidate & Type.ON)) return -4;

    if ((target & XCoord.ON) !== XCoord.NULL)
    {
        if ((candidate & XCoord.ON) !== (target & XCoord.ON)) return -4;
        score += 1;
    }

    if ((target & YCoord.ON) !== YCoord.NULL)
    {
        if ((candidate & YCoord.ON) !== (target & YCoord.ON)) return -4;
        score += 1;
    }

    return score;
}

export const findMoveInMoves = (targetMove, candidateMoves) =>
{
    return candidateMoves
    .map((candidateMove, index) => (
        findMatchScore(targetMove.fromPiece, candidateMove.fromPiece)
        + findMatchScore(targetMove.fromPiece, candidateMove.fromPiece)))
    .reduce((result, score, index) => 
    {
        if (score > result.scoreToBeat) return ({
            moves: [candidateMoves[index]],
            scoreToBeat: score });
        if (score === result.scoreToBeat)
        {
            result.moves.push(candidateMoves[index]);
            return result;
        }
        return result;
    }, { scoreToBeat: -1, moves: null });
}


// 1. If there is only 1 piece of a type, it never needs to fromSquare
// 2. If there are 2+ piece of a type, but only one can make it to the toSqaure, it doesn't need a fromSqaure
// 3. If there are 2+ pieces of a type which can make it to a to the square, only include the identifying file
// 4. If there are 2+ pieces of a type which can make it to the sqaure


// lets just solve it for pawns for now :)
// 

const parseTree = {

}

/*

*/