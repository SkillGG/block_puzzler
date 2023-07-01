import "./style.css";
import { Game } from "./game";
import { DevConsole } from "./console";
import { getHTMLBoxes } from "@utils/utils";
import { GameOptions } from "./options";
import { GameMenu } from "@component/Menu/menu";
import { FpsCounter } from "./gameComponents/FpsCounter/fpsCounter";
import { Playfield } from "@component/Playfield/playfield";

export enum GameState {
    MENU = "MENU",
    GAME = "GAME",
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

const options = (window.options = new GameOptions<GameState>(
    optionsBox as HTMLDivElement
));

const game = (window.game = new Game<GameState>(
    devConsole,
    options,
    GameState.MENU
));
gameBox.append(game);

options.createManager(game.manager, GameState.GAME);

/**
 * Register all GameStates
 */
game.manager.registerGameState(...Object.values(GameState));
/**
 * Add objects
 */
const fpsCounter = new FpsCounter([10, 10]);
game.manager.addObject(fpsCounter, GameState.GAME);
game.manager.addObject(fpsCounter, GameState.MENU);

const menuManager = new GameMenu(game.manager);
game.manager.addStateManager(new GameMenu(game.manager));
menuManager.registerObjects();
game.manager.addStateManager(new Playfield(game.manager));

/**
 * Game loop
 */

const targetFPS = 60;
const fpsInterval: number = 1000 / targetFPS;
let previous: number;

function loop() {
    requestAnimationFrame(loop);
    const curtime = performance.now();
    const timeDelta = curtime - previous;
    if (timeDelta > fpsInterval) {
        fpsCounter.curTime = curtime;
        previous = curtime - (timeDelta % fpsInterval);
        game.update(timeDelta);
        game.render();
    }
}

game.run();

previous = performance.now();
loop();