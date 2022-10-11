import readline from 'readline';

import { PAWN_PIECES, STANDARD_PIECES } from './helpers.js';
import { findMoves } from './evaluate.js';
import { debugBoard, debugMove, debugPiece } from './debug.js';
import { findSan } from './san.js';
import { SanType } from './constants.js';

const modes = {
    standard: STANDARD_PIECES,
    pawns: PAWN_PIECES,
};

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

*/

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
