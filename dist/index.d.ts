import { HarmonyPanel } from 'harmony-ui';
import { JSONObject } from 'harmony-types';
import { Second } from 'harmony-types';
import { vec2 } from 'gl-matrix';

export declare function addNotification(content: NotificationContent, type: NotificationType, ttl: Second, params?: NotificationParams): Notification_2;

export declare function addNotificationEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;

export declare const BadPagePathError: Error;

export declare function closeNotification(notification: Notification_2 | NotificationId): void;

export declare type DatalistElement = string | number | [string, string];

export declare enum EntryType {
    File = "file",
    Directory = "directory"
}

export declare const ExistingPathError: Error;

export declare function getQueryParams(): Record<string, string | string[]>;

export declare function loadScript(script: string): Promise<boolean>;

export declare function loadScripts(scripts: string[]): Promise<boolean>;

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
    datalist?: DatalistElement[];
    context?: string;
    protected?: boolean;
};
export { Option_2 as Option }

export declare type OptionJSON = {
    name: string;
    editable: boolean;
    type: string;
    default?: string;
    datalist?: DatalistElement[];
    context?: string;
    protected?: boolean;
};

export declare type OptionMap = {
    [key: string]: OptionValue;
};

export declare class OptionsManager {
    #private;
    static logException: boolean;
    static init(parameters: OptionsManagerInitParams): Promise<void>;
    static setItem(name: string, value: OptionValue): void;
    static getSubItem(name: string, subName: string): Promise<OptionValue>;
    static setSubItem(name: string, subName: string, value: OptionValue): Promise<void>;
    static removeSubItem(name: string, subName: string): void;
    static getItem(name: string): OptionValue;
    static removeItem(name: string): void;
    static resetItem(name: string): void;
    static resetItems(names: string[]): void;
    static resetAllItems(): void;
    static clear(): void;
    static showOptionsManager(): void;
    static getOptionsPerType(type: string): Promise<Map<string, OptionValue>>;
    static getOption(name: string): Promise<Option_2 | undefined>;
    static getOptionType(name: string): Promise<string | undefined>;
    static getList(name: string): Promise<DatalistElement[] | undefined>;
}

export declare type OptionsManagerEvent<T extends OptionValue> = {
    name: string;
    value: T;
    context?: string;
};

export declare const OptionsManagerEvents: EventTarget;

declare type OptionsManagerInitParams = {
    url?: string;
    json?: JSONObject;
};

export declare type OptionValue = string | number | boolean | bigint | OptionMap | null | undefined | vec2 | string[];

export declare abstract class Page {
    readonly path: string;
    abstract htmlElement: HTMLElement;
    constructor(path: string);
    abstract activated(): void;
    abstract deactivated(): void;
}

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
    static readFileAsJSON(path: string): Promise<JSONObject | null>;
    static writeFile(path: string, content: ArrayBuffer | Blob | string, options?: FileSystemCreateWritableOptions): Promise<boolean>;
    static getPanel(): HarmonyPanel;
}

export declare function readFileAsText(file: File): Promise<string>;

export declare function saveFile(file: File): void;

export declare const SEPARATOR = "/";

export declare function setNotificationsPlacement(placement: NotificationsPlacement): void;

export declare class ShortcutHandler {
    #private;
    static getCodeState(code: string): boolean;
    static getKeyState(key: string): boolean;
    static getControlState(): boolean;
    static getAltState(): boolean;
    static getShiftState(): boolean;
    static addContext(name: string, element: HTMLElement | Document): void;
    static clearShortcuts(): void;
    static setShortcuts(contextName: string, shortcutMap: Map<string, string>): void;
    static setShortcut(contextName: string, name: string, shortcut: string): void;
    static addShortcut(contextName: string, name: string, shortcut: string): void;
    static addEventListener(type: string, callback: (evt: CustomEvent<KeyboardEvent>) => void, options?: AddEventListenerOptions | boolean): void;
}

export declare abstract class SinglePageApplication {
    #private;
    abstract htmlElement: HTMLElement;
    constructor();
    init(pages?: Page[]): Promise<void>;
    /**
     * Add several pages
     * @param pages The pages to add
     */
    addPages(pages: Page[]): void;
    /**
     * Add a single page
     * @param page The page to add. Overwrite an existing page of the same path
     * @throws BadPagePathError, ExistingPathError
     */
    addPage(page: Page): void;
    /**
     * Remove a single page
     * @param path The path of the page to remove. Does nothing if the path doesn't exist
     */
    removePage(path: string): void;
    abstract initApplication(): Promise<void>;
    abstract pageActivated(): void;
    navigateTo(path: string, replaceSate?: boolean): Promise<void>;
}

export declare type StorageFilter = {
    directories?: boolean;
    files?: boolean;
    name?: string;
};

export declare type SubOption = Record<string, Option_2>;

export declare function supportsPopover(): boolean;

export declare const UnknownPageError: Error;

export { }
