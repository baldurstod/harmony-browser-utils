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
    constructor();
    setParent(htmlParent: HTMLElement): void;
    addNotification(content: NotificationContent, type: string, ttl?: number): void;
    closeNofication(notification: Notification_2): void;
}

declare type Option_2 = {
    name: string;
    editable: boolean;
    type: string;
    dv?: string;
    datalist?: Array<any>;
    context?: string;
    preventResetAll?: boolean;
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
    getOptionsPerType(type: string): Promise<Map<string, any>>;
    getOption(name: string): Promise<Option_2 | undefined>;
    getOptionType(name: string): Promise<string | undefined>;
    getList(name: string): Promise<any[] | undefined>;
}

export declare function SaveFile(file: File): void;

export declare class ShortcutHandler extends EventTarget {
    #private;
    constructor();
    addContext(name: string, element: HTMLElement | Document): void;
    setShortcuts(contextName: string, shortcutMap: Map<string, string>): void;
    setShortcut(contextName: string, name: string, shortcut: string): void;
    addShortcut(contextName: string, name: string, shortcut: string): void;
}

export declare type SubOption = {
    [key: string]: Option_2;
};

export declare function supportsPopover(): boolean;

export { }
