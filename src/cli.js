import readline from 'readline';

import { PAWN_PIECES, STANDARD_PIECES } from './helpers.js';
import { findMoves } from './evaluate.js';
import { argv, debugPort } from 'process';
import { debugBoard, debugMove, debugPiece } from './debug.js';
import { createSanTree } from './san.js';
import { debuglog } from 'util';

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

let game = null;

const gameCommands = {
    turn: () =>
    {

    },
    suggestMove: (san) =>
    {
        const move = parseMovefromSAN(san);

        const match = findMoveMatch(move, moves);
    }
}

/*
const playGame = ({ mode="pawns" }) =>
{
    if (!modes.hasOwnProperty(mode)) return 
        rl.question(compose(script.modeNotFound(mode), script.menu), menu);

    const game = {
        turn: 0,
        pieces: modes[mode]
    };

    const getMoveInput = () =>
    {
        const sanTree = createSanTree(findMoves(game.pieces));
        const currentTurn = Index.active()
       .log(debugBoard(pieces));
        
        const promptMove = (san) =>
        {
            if (san in sanTree)
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
}
*/


const menuCommands = {
    new: (mode="pawns") =>
    {
        if (modes.hasOwnProperty(mode))
        {
            let game = {
                turn: 0,
                pieces: modes[mode],
            };
        }
        else
        {
            rl.question(compose(script.modeNotFound(mode), script.menu), menu);
        }
    },
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
