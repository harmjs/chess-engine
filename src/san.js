import invert from "lodash/invert.js"; 
import { SanType, Type, Active, Moved, XCoord, YCoord, Coord, ISanType, Captured, IXCoord, IYCoord} from "./constants.js";
import { debugPiece, debugRank, debugType } from "./debug.js";

const pawnSANFormula = (move) => (
    IXCoord[move.to & XCoord.ON] + IYCoord[move.to & YCoord.ON]);
    //+ (move.to & Type.ON !== Type.PAWN) ? ISanType[move.to & Type.ON] : "");

const pawnCaptureSanFormulas = [
    (move) => (
        IXCoord[move.from & XCoord.ON] + "x"
        + IXCoord[move.to & XCoord.ON] + IYCoord[move.to & YCoord.ON]
        + ((move.to & Type.ON) !== Type.PAWN ? ISanType[move.to & Type.ON] : "")),
    (move) => (
        IXCoord[move.from & XCoord.ON] + IYCoord[move.from & YCoord.ON] + "x"
        + IXCoord[move.to & XCoord.ON] + IYCoord[move.to & YCoord.ON]
        + ((move.to & Type.ON) !== Type.PAWN ? ISanType[move.to & Type.ON] : ""))
];

const pieceSANFormulas = [
    (move) => (
        ISanType[move.from & Type.ON]
        + ((move.to & Captured.ON) === Captured.True ? "x" : "")
        + IXCoord[move.to & XCoord.ON] + IYCoord[move.to & YCoord.ON]),
    (move) => (
        ISanType[move.from & Type.ON]
        + IYCoord[move.from & YCoord.ON]
        + ((move.to & Captured.ON) === Captured.True ? "x" : "")
        + IXCoord[move.to & XCoord.ON] + IYCoord[move.to & YCoord.ON]),
    (move) => (
        ISanType[move.from & Type.ON]
        + IXCoord[move.from & XCoord.ON]
        + ((move.to & Captured.ON) === Captured.True ? "x" : "")
        + IXCoord[move.to & XCoord.ON] + IYCoord[move.to & YCoord.ON]),
    (move) => (
        ISanType[move.from & Type.ON]
        + IXCoord[move.from & XCoord.ON] + IYCoord[move.from & YCoord.ON]
        + ((move.to & Captured.ON) === Captured.True ? "x" : "")
        + IXCoord[move.to & XCoord.ON] + IYCoord[move.to & YCoord.ON])
];

const recurseMarkSan = (sanLibrary, formulas, formulaIndex, moves, moveIndex) =>
{
    const formula = formulas[formulaIndex];
    const san = formula(moves[moveIndex]);

    if (san in sanLibrary)
    {
        if (!Array.isArray(sanLibrary[san]))
            sanLibrary[san] = [sanLibrary[san]];

        sanLibrary[san].push(moveIndex)

        const plus1 = formulaIndex + 1;
        for (let collidedMoveIndex in sanLibrary[san])
            recurseMarkSan(sanLibrary, formulas, plus1, moves, collidedMoveIndex);
    }
    else
    {
        sanLibrary[san] = moveIndex;
    }
}

export const injectSan = (moves) =>
{
    const sanLibrary = {};

    for (let index = 0; index < moves.length; index++)
    {
        const move = moves[index];

        if ((move.from & Type.ON) !== Type.PAWN)
        {
            recurseMarkSan(sanLibrary, pieceSANFormulas, 0, moves, index);
        }
        else if ((move.to & Captured.ON) === Captured.FALSE)
        {
            sanLibrary[pawnSANFormula(move)] = parseInt(index);
        }
        else
        {
            recurseMarkSan(sanLibrary, pawnCaptureSanFormulas, 0, moves, index)
        }
    }

    const iSanLibrary = invert(sanLibrary);

    moves.forEach((move, index) => move.san = iSanLibrary[index]);
    
    return moves;
}

export const parseMovefromSAN = (san) =>
{
    const move = {
        from: Active.TRUE + Type.PAWN,
        to: Active.TRUE + Type.PAWN + Moved.TRUE
    };

    if (san.length && san[0] in SanType)
    {
        move.from = (move.from & Type.OFF) + SanType[san[0]];
        move.to = (move.from & Type.OFF) + SanType[san[0]];
        san = san.substr(1);
    }

    if (san.length && san[0] in XCoord)
    {
        move.to += XCoord[san[0]];
        san = san.substr(1);
    }

    if (san.length && san[0] in YCoord)
    {
        move.from += YCoord[san[0]]
        move.to += YCoord[san[0]];
        san = san.substr(1);
    }

    if (san.length && san[0] === "x")
    {
        move.to += Captured.TRUE;
        san = san.substr(1);
    }

    if (san.length && san[0] in XCoord)
    {
        move.to = (move.to & XCoord.OFF) + XCoord[san[0]];
        san = san.substr(1);
    } 
    else
    {
        move.from = (move.from & XCoord.OFF);
    }

    if (san.length && san[0] in YCoord)
    {
        move.to = (move.to & YCoord.OFF) + YCoord[san[0]];
        san = san.substr(1);
    }
    else
    {
        move.from = (move.from & YCoord.OFF);
    }

    if (san.length && san[0] in SanType)
    {
        move.to = (move.to & Type.OFF) + SanType[san[0]];
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
        findMatchScore(targetMove.from, candidateMove.from)
        + findMatchScore(targetMove.to, candidateMove.to)))
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



const parseTree = {

}

/*

*/