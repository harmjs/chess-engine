export const toggleUint16 = (int) => 
    parseInt((~int >>> 0).toString(2).slice(16), 2); 

export const piecesToStr = (pieces) => 
    String.fromCharCode.apply(null, pieces);

export const strToPieces = (str) =>
{
    const buffer = new Uint16Array(str.length);
    for (var i = 0; i < str.length; i++) buffer[i] = str.charCodeAt(i);
    return buffer;
}