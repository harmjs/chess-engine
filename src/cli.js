import readline from 'readline';

import { PAWN_PIECES, STANDARD_PIECES } from './utility.js';
import { findMoves } from './evaluate.js';
import { argv } from 'process';
import { debugBoard, debugPiece } from './debug.js';
import { isFunction } from 'lodash';

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
    todo: (command) => `'${command}' has not been implemented yet.`
}

let game = null;

const playCommands = {
    play: () =>
    {
        const moves = findMoves(game.pieces);
    }
};

const menuCommands = {
    new: (mode="pawns") =>
    {
        if (modes.hasOwnProperty(mode))
        {
            const game = {
                turn: 0,
                pieces: modes[mode]
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

const play = (str) =>
{
    const args = str.split(' ');
    const command = args.shift();

    if (menuCommands.hasOwnProperty(command))
    {

    }
}

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
