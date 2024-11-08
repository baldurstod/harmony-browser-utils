declare class Notification_2 {
    #private;
    timeout: number;
    content: NotificationContent;
    type: string;
    constructor(content: NotificationContent, type: string, ttl?: number);
    setTtl(ttl?: number): void;
    get view(): HTMLElement;
}

export declare type NotificationContent = HTMLElement | string;

export declare class NotificationManager {
    #private;
    static setParent(htmlParent: HTMLElement): void;
    static addNotification(content: NotificationContent, type: string, ttl: number): void;
    static closeNofication(notification: Notification_2): void;
}

declare type Option_2 = {
    name: string;
    editable: boolean;
    type: string;
    dv: string;
    datalist?: Array<any>;
};
export { Option_2 as Option }

export declare class OptionsManager extends EventTarget {
    #private;
    logException: boolean;
    constructor();
    init(parameters: {
        [key: string]: any;
    }): Promise<void>;
    addOption(option: any): void;
    setItem(name: string, value: any): void;
    getSubItem(name: string, subName: string): Option_2 | undefined;
    setSubItem(name: string, subName: string, value: any): Promise<void>;
    removeSubItem(name: string, subName: string): void;
    getItem(name: string): any;
    removeItem(name: string): void;
    resetItem(name: string): void;
    resetItems(names: Array<string>): void;
    resetAllItems(): void;
    clear(): void;
    showOptionsManager(): void;
    getOptionsPerType(type: string): Promise<Set<unknown>>;
    getOption(name: string): Promise<Option_2 | undefined>;
    getOptionType(name: string): Promise<string | undefined>;
    getList(name: string): Promise<any[] | undefined>;
}

export declare function SaveFile(file: File): void;

export declare const ShortcutHandler: ShortcutHandlerClass;

declare class ShortcutHandlerClass extends EventTarget {
    #private;
    constructor();
    addContext(name: any, element: any): void;
    setShortcuts(contextName: any, shortcutMap: any): void;
    setShortcut(contextName: any, name: any, shortcut: any): void;
    addShortcut(contextName: any, name: any, shortcut: any): void;
}

export declare type SubOption = {
    [key: string]: Option_2;
};

export declare function supportsPopover(): boolean;

export { }
