import "./style.css";
import { Game } from "./game";
import { DevConsole } from "./console";
import { getHTMLBoxes } from "@utils/utils";
import { GameOptions } from "./options";
import { GameMenu } from "@component/Menu/menu";
import { FpsCounter } from "./gameComponents/FpsCounter/fpsCounter";

export enum GameState {
    MENU = "MENU",
    GAME = "GAME",
}

declare global {
    interface Window {
        game: Game<GameState>;
    }
}

const [gameBox, consoleBox, optionsBox] = getHTMLBoxes([
    "#gameBox",
    "#consoleContent",
    "#optionsBox",
]);

if (!gameBox || !consoleBox || !optionsBox)
    throw new Error("Could not find the boxes!");

const devConsole = (window.gameconsole = new DevConsole(
    consoleBox as HTMLDivElement
));

const options = (window.options = new GameOptions());

const game = (window.game = new Game<GameState>(
    devConsole,
    options,
    GameState.MENU
));
gameBox.append(game);

/**
 * Register all GameStates
 */
game.manager.registerGameState(...Object.values(GameState));
/**
 * Add objects
 */
const fpsCounter = new FpsCounter([0, 0]);
game.manager.addObject(fpsCounter, GameState.GAME);
game.manager.addObject(fpsCounter, GameState.MENU);

game.manager.addObjectManager(new GameMenu(game.manager));

// /** Game loop */
// let previousUPS = Date.now();
// let previousFPS = Date.now();
// function loop() {
//     const curtime = Date.now();
//     if (game.running) window.requestAnimationFrame(loop);
//     console.log(curtime, previousFPS);
//     const updateDelta = curtime - previousUPS;
//     const frameDelta = curtime - previousFPS;
//     console.log(updateDelta, 1000 / targetUPS);
//     if (updateDelta > 1000 / targetUPS) {
//         game.update(updateDelta);
//         previousUPS = curtime;
//     }
//     if (frameDelta > 1000 / targetFPS) {
//         game.render();
//         previousFPS = curtime;
//     }
// }

const targetFPS = 60;
const fpsInterval: number = 1000 / targetFPS;
let previous: number, start: number, curtime: number, timeDelta: number;

let prevUpdate = 0;
function loop() {
    requestAnimationFrame(loop);
    curtime = performance.now();
    timeDelta = curtime - previous;
    if (timeDelta > fpsInterval) {
        fpsCounter.curTime = curtime;
        previous = curtime - (timeDelta % fpsInterval);
        game.update(timeDelta);
        game.render();
        prevUpdate = timeDelta;
    }
}

game.run();

start = previous = performance.now();
loop();

// window.requestAnimationFrame(loop);
