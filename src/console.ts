import { $ } from "./util";

enum LogType {
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
    constructor(element: HTMLDivElement) {
        this.consoleWindow = element;
    }
    clearConsole() {
        for (const child of Array.from(this.consoleWindow.children))
            child.remove();
    }
    redrawLogs() {
        this.clearConsole();
        this.logs.forEach((log) => {
            const logEl = $``({
                props: { class: "log", "data-type": log.type },
                children: [
                    $``({
                        props: { class: "logType" },
                        _html: log.type.toUpperCase(),
                    }),
                ],
            });
            const typeEl = document.createElement("div");
            const msgEl = document.createElement("div");
            logEl.append(typeEl, msgEl);
            typeEl.classList.add("logType");
            msgEl.classList.add("logMessage");
            msgEl.innerHTML = log.message;
            typeEl.innerHTML = log.type.toUpperCase();
            this.consoleWindow.append(logEl);
        });
    }
    addLog(l: Log) {
        console.log("adding new log");
        this.logs.push(l);
        this.redrawLogs();
    }
}
