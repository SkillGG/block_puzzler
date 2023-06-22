import "./style.css";
import { Game } from "./game";

let running = true;

declare global {
    interface Window {
        game: Game;
    }
}

const game = (window.game = new Game(() => (running = false)));

document.body.append(window.game);

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
