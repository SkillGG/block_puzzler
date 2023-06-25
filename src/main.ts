import "./style.css";
import { Game } from "./game";
import { DevConsole } from "./console";
import { getHTMLBoxes } from "./util";
import { GameOptions } from "./options";

let running = true;

declare global {
    interface Window {
        game: Game;
    }
}

const [gameBox, consoleBox, optionsBox] = getHTMLBoxes([
    "#gameBox",
    "#consoleBox",
    "#optionsBox",
]);

if (!gameBox || !consoleBox || !optionsBox)
    throw new Error("Could not find the boxes!");

const devConsole = (window.gameconsole = new DevConsole(
    consoleBox as HTMLDivElement
));

const options = (window.options = new GameOptions());

const game = (window.game = new Game(
    () => (running = false),
    devConsole,
    options
));

gameBox.append(game);

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
    if (running) window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);
