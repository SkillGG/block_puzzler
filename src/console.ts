import { $ } from "@utils/utils";

export enum LogType {
    INFO = "info",
    ERROR = "error",
    WARN = "warn",
}

type Log = {
    type: LogType;
    message: string;
};

declare global {
    interface Window {
        gameconsole: DevConsole;
    }
}

export class DevConsole {
    consoleWindow: HTMLDivElement;
    logs: Log[] = [];

    static instance: DevConsole;

    lockScroll = false;

    constructor(element: HTMLDivElement) {
        this.consoleWindow = element;
        DevConsole.instance = this;
    }
    clear() {
        this.logs = [];
        this.clearDOM();
    }
    clearDOM() {
        for (const child of Array.from(this.consoleWindow.children))
            child.remove();
    }
    redrawLogs() {
        this.clearDOM();
        this.logs.forEach((log) => {
            const logEl = $``({
                props: { class: "log", "data-type": log.type },
                children: [
                    $``({
                        props: { class: "logType" },
                        _html: log.type.toUpperCase(),
                    }),
                    $``({
                        props: { class: "logMessage" },
                        _html: log.message,
                    }),
                ],
            });
            this.consoleWindow.append(logEl);
        });
    }
    addLog(l: Log) {
        this.logs.push(l);
        this.redrawLogs();
        if (!this.lockScroll) {
            this.consoleWindow.parentElement?.scrollTo({
                top: 9999999,
            });
        }
    }
    static newLog(l: Log) {
        DevConsole.instance?.addLog(l);
    }
}
