import { PAWN_PIECES, STANDARD_PIECES } from './helpers.js';
import { getMoves } from './evaluate.js';
import { getSanMoves} from './san.js';
import { debugBoard, debugMove, debugPiece } from './debug.js';
import { SanType } from './constants.js';
import readline from 'readline/promises';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const compose = (...args) => args.join(' ') + '\n';

const script = {
    welcome: "Welcome to harmjs' chess engine.",
    menu: "Type a command or type 'help' to see a detailed description of all commands.",
    quit: "Thanks for checking out my project.",
    modeNotFound: (mode) => `There is no mode called '${mode}'.`,
    commandNotFound: (command) => `'${command}' is not a recognized command.`,
    todo: (command) => `'${command}' has not been implemented yet.`,
    move: "What will be white's move?"
}


// callback hell CLI is swamping my style
// promises aren't experiemental, we async/await syntax now,
// polish at this stage is a mistake
// this is a testing / bugcatching platform

export const start = async () =>
{
    let pieces = STANDARD_PIECES;

    while(true)
    {
        const sanMoves = getSanMoves(getMoves(pieces));
        console.log(debugBoard(pieces), Object.keys(sanMoves));

        const san = await rl.question(compose(script.move));

        if (san in sanMoves)
            pieces = sanMoves[san].nextPieces;
    }
}

/*
const createNewGame = () =>
{
    const game = {
        turn: 0,
        pieces: STANDARD_PIECES
    };

    const promptSan = (san) => 
    {
        const result = moves.find((move) => move.san === san);
        console.log(result);
    }

    const moves = injectSan(findMoves(game.pieces));
}

/*
const getMoveInput = () =>
{
        const moves = findMoves(game.pieces);
        const san = findSan(moves);
        
        const promptMove = (san) =>
        {
            if (san)
            {
                game.pieces = sanTree[san].nextPieces;
                getMoveInput();
            }
            else
            {
                rl.question("That move isn't valid. What move does white make?", promptMove);
            }
        }

            rl.question("What move does white play?", promptMove);

        getMoveInput();
    }
    
    getMoveInput();
}


const menuCommands = {
    new: createNewGame,
    quit: () =>
    {
        rl.close();
    },
    help: () =>
    {
        rl.question(compose(script.todo("help"), script.menu), menu);
    }
};

const menu = (str) =>
{
    const args = str.split(' ');
    const command = args.shift();

    if (menuCommands.hasOwnProperty(command))
    {
        menuCommands[command].call(...args);
    }
    else
    {
        rl.question(compose(script.commandNotFound(command), script.menu), menu);
    }
}

export const start = () =>
{
    rl.question(compose(script.welcome, script.menu), menu);
}

*/