import "./style.css";
import { Game } from "./game";
import { DevConsole } from "./console";
import { getHTMLBoxes } from "@utils";
import { GameOptions } from "./options";
import { GameMenu } from "@components/Menu/menu";
import { FpsCounter } from "@components/FpsCounter/fpsCounter";
import { Playfield } from "@components/Playfield/playfield";
import { SpriteLoader } from "@primitives/Sprite/SpriteLoader";
import { BreakingAnimation } from "@components/Animation/Break/break";
import { HoverAnimation } from "@components/Animation/Hover/hover";
import { TileSpriteURLList } from "@components/Playfield/Tile/assets/tileSpriteList";
import { genericMultiSpriteLoader } from "./utils/genericSpriteLoaders";

export enum GameState {
    MENU = "MENU",
    GAME = "GAME",
}
SpriteLoader.addSprite(
    BreakingAnimation.ID,
    BreakingAnimation.sprite.loadSprites
);

SpriteLoader.addAnimation(HoverAnimation.ID, HoverAnimation.sprite.loadSprites);

SpriteLoader.addSprites(
    Object.keys(TileSpriteURLList),
    genericMultiSpriteLoader(TileSpriteURLList)
);

SpriteLoader.loadAllSprites().then(() => {
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
    const fpsCounter = new FpsCounter([10, 0], Game.VERSION);
    game.manager.addObject(fpsCounter, GameState.GAME);
    game.manager.addObject(fpsCounter, GameState.MENU);

    const menuManager = new GameMenu(game.manager);
    game.manager.addStateManager(new GameMenu(game.manager));
    menuManager.registerObjects();
    game.manager.addStateManager(new Playfield(game.manager));

    /**
     * Game loop
     */

    const targetFPS = Game.desiredFPS;
    const fpsInterval: number = 1000 / targetFPS;
    let previous: number;

    async function loop() {
        const curtime = performance.now();
        const timeDelta = curtime - previous;
        if (timeDelta > fpsInterval) {
            fpsCounter.curTime = curtime;
            previous = curtime - (timeDelta % fpsInterval);
            await game.update(timeDelta);
            await game.render();
        }
        requestAnimationFrame(loop);
    }

    game.run();

    previous = performance.now();
    loop();
});
