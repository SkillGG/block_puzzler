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

/** Game loop */
let previousUPS = 0;
let previousFPS = 0;
const targetUPS = 60;
const targetFPS = 60;
function loop(curtime: number) {
    const updateDelta = curtime - previousUPS;
    const frameDelta = curtime - previousFPS;
    if (updateDelta / 1000 > 1 / targetUPS) {
        game.update(updateDelta);
        previousUPS = curtime;
    }
    if (frameDelta / 1000 > 1 / targetFPS) {
        game.render();
        previousFPS = curtime;
    }
    if (game.running) window.requestAnimationFrame(loop);
}

game.run();

window.requestAnimationFrame(loop);
