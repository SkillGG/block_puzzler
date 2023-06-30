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
        if (
            getComputedStyle(this.consoleWindow.parentElement!).display ===
            "none"
        )
            return;
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
    static refresh() {
        DevConsole.instance?.redrawLogs();
    }
}

export const Log = (type: LogType = LogType.INFO, ...msg: any[]) => {
    DevConsole.newLog({
        message: msg.reduce((p, n) => {
            if (typeof n === "object" && !Array.isArray(n)) {
                return `${p} {${Object.entries(n).reduce((q, z) => {
                    return `${q},${z[0]}:${z[1]}`;
                }, "")}}`;
            }
            return `${p} ${n?.toString()}`;
        }, ""),
        type,
    });
};

export const LogI = (...msg: any[]) => {
    Log(LogType.INFO, ...msg);
};
export const LogW = (...msg: any[]) => {
    Log(LogType.WARN, ...msg);
};
export const LogE = (...msg: any[]) => {
    Log(LogType.ERROR, ...msg);
};
