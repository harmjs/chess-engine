import fs from 'fs';
import crypto from 'crypto';

import { 
    Enpassent, Type, Moved, XCoord, YCoord, Active, 
    X_COORD_NAMES, Y_COORD_NAMES, BOOL_NAMES 
} from "./constants.js";

/*
** Note: A portion of the pawn zoobrist key:values will never be used,
** but that hardly matters at this point
*/

export const writeZobristCache = (path) =>
{
    const zobristTypes = [
        Type.PAWN, Type.PAWN + Enpassent.TRUE,
        Type.KNIGHT, Type.BISHOP, Type.ROOK, 
        Type.ROOK + Moved.TRUE, Type.QUEEN, 
        Type.KING, Type.KING + Moved.TRUE
    ];

    const zobristFactors = [
        zobristTypes,
        X_COORD_NAMES.map((xName) => XCoord[xName]),
        Y_COORD_NAMES.map((yName) => YCoord[yName]),
        BOOL_NAMES.map((boolName) => Active[boolName])
    ];

    const zobristKeys = zobristFactors.reduce((a, b) => 
    {
        const products = [];
        for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++)
            products.push(a[i] + b[j]);
        return products;
    });

    const zobristValues = 
        crypto.getRandomValues(new BigUint64Array(zobristKeys.length))

    const zobristDict = zobristKeys
        .reduce((map, key, index) => 
        {
            map[key] = zobristValues[index].toString();
            return map;
        }, {})

    fs.writeFileSync("./zobrist-cache.json", JSON.stringify(zobristDict));
}