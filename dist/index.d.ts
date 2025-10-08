import { Second } from 'harmony-types';

export declare function addNotification(content: NotificationContent, type: NotificationType, ttl: Second, params?: NotificationParams): Notification_2;

export declare function addNotificationEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;

export declare function closeNotification(notification: Notification_2 | NotificationId): void;

export declare enum EntryType {
    File = "file",
    Directory = "directory"
}

export declare function loadScript(script: string): Promise<boolean>;

export declare function loadScripts(scripts: Array<string>): Promise<boolean>;

declare class Notification_2 {
    #private;
    constructor(content: NotificationContent, type: NotificationType, ttl: Second, params?: NotificationParams);
    get htmlElement(): HTMLElement;
    close(): void;
    get id(): NotificationId;
}
export { Notification_2 as Notification }

export declare type NotificationContent = HTMLElement | string;

export declare enum NotificationEvents {
    Added = "notificationadded",
    Removed = "notificationremoved"
}

export declare type NotificationId = number;

export declare type NotificationParams = {
    parent?: HTMLElement | ShadowRoot;
};

export declare type NotificationRemovedEventData = {
    notification: Notification_2;
};

export declare enum NotificationsPlacement {
    Top = "top",
    Bottom = "bottom",
    Left = "left",
    Right = "right",
    TopLeft = "top-left",
    TopRight = "top-right",
    BottomLeft = "bottom-left",
    BottomRight = "bottom-right",
    Center = "center",
    DockedTop = "docked-top",
    DockedBottom = "docked-bottom"
}

export declare enum NotificationType {
    Success = "success",
    Warning = "warning",
    Error = "error",
    Info = "info"
}

declare type Option_2 = {
    name: string;
    editable: boolean;
    type: string;
    defaultValue?: string;
    datalist?: Array<any>;
    context?: string;
    protected?: boolean;
};
export { Option_2 as Option }

export declare type OptionMap = {
    [key: string]: OptionValue;
};

export declare class OptionsManager {
    #private;
    static logException: boolean;
    static init(parameters: {
        [key: string]: any;
    }): Promise<void>;
    static addOption(option: any): void;
    static setItem(name: string, value: any): void;
    static getSubItem(name: string, subName: string): Promise<OptionValue>;
    static setSubItem(name: string, subName: string, value: any): Promise<void>;
    static removeSubItem(name: string, subName: string): void;
    static getItem(name: string): any;
    static removeItem(name: string): void;
    static resetItem(name: string): void;
    static resetItems(names: Array<string>): void;
    static resetAllItems(): void;
    static clear(): void;
    static showOptionsManager(): void;
    static getOptionsPerType(type: string): Promise<Map<string, any>>;
    static getOption(name: string): Promise<Option_2 | undefined>;
    static getOptionType(name: string): Promise<string | undefined>;
    static getList(name: string): Promise<any[] | undefined>;
}

export declare type OptionsManagerEvent = {
    name: string;
    value: OptionValue;
    context?: string;
};

export declare const OptionsManagerEvents: EventTarget;

export declare type OptionValue = string | number | boolean | bigint | OptionMap | null | undefined;

export declare class PersistentStorage {
    #private;
    static estimate(): Promise<StorageEstimate>;
    static createFile(path: string): Promise<FileSystemFileHandle | null>;
    static createDirectory(path: string): Promise<FileSystemDirectoryHandle | null>;
    static deleteFile(path: string): Promise<boolean>;
    static deleteDirectory(path: string, recursive: boolean): Promise<boolean>;
    static clear(): Promise<boolean>;
    static listEntries(path: string, options?: {
        recursive?: boolean;
        absolutePath?: boolean;
        filter?: StorageFilter;
    }): AsyncGenerator<FileSystemHandle, null, unknown>;
    static readFile(path: string): Promise<File | null>;
    static readFileAsString(path: string): Promise<string | null>;
    static writeFile(path: string, file: ArrayBuffer | ArrayBufferView | Blob | string, options?: FileSystemCreateWritableOptions): Promise<boolean>;
    static showPanel(): Promise<void>;
}

export declare function saveFile(file: File): void;

export declare const SEPARATOR = "/";

export declare function setNotificationsPlacement(placement: NotificationsPlacement): void;

export declare class ShortcutHandler {
    #private;
    static addContext(name: string, element: HTMLElement | Document): void;
    static setShortcuts(contextName: string, shortcutMap: Map<string, string>): void;
    static setShortcut(contextName: string, name: string, shortcut: string): void;
    static addShortcut(contextName: string, name: string, shortcut: string): void;
    static addEventListener(type: string, callback: (evt: CustomEvent<KeyboardEvent>) => void, options?: AddEventListenerOptions | boolean): void;
}

export declare type StorageFilter = {
    directories?: boolean;
    files?: boolean;
    name?: string;
};

export declare type SubOption = {
    [key: string]: Option_2;
};

export declare function supportsPopover(): boolean;

export { }
