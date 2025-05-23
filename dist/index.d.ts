export declare function addNotification(content: NotificationContent, type: NotificationType, ttl: number, params?: NotificationParams): Notification_2;

export declare function addNotificationEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions | boolean): void;

export declare function closeNotification(notification: Notification_2 | number): void;

export declare function loadScript(script: string): Promise<boolean>;

export declare function loadScripts(scripts: Array<string>): Promise<boolean>;

declare class Notification_2 {
    #private;
    constructor(content: NotificationContent, type: NotificationType, ttl: number, params?: NotificationParams);
    get htmlElement(): HTMLElement;
    get id(): number;
}
export { Notification_2 as Notification }

export declare type NotificationContent = HTMLElement | string;

export declare enum NotificationEvents {
    Added = "notificationadded",
    Removed = "notificationremoved"
}

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

export declare class OptionsManager extends EventTarget {
    #private;
    logException: boolean;
    constructor();
    init(parameters: {
        [key: string]: any;
    }): Promise<void>;
    addOption(option: any): void;
    setItem(name: string, value: any): void;
    getSubItem(name: string, subName: string): Promise<OptionValue>;
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

export declare type OptionValue = string | number | boolean | bigint | OptionMap | null | undefined;

export declare function SaveFile(file: File): void;

export declare function setNotificationsPlacement(placement: NotificationsPlacement): void;

export declare class ShortcutHandler {
    #private;
    static addContext(name: string, element: HTMLElement | Document): void;
    static setShortcuts(contextName: string, shortcutMap: Map<string, string>): void;
    static setShortcut(contextName: string, name: string, shortcut: string): void;
    static addShortcut(contextName: string, name: string, shortcut: string): void;
    static addEventListener(type: string, callback: (evt: CustomEvent<KeyboardEvent>) => void, options?: AddEventListenerOptions | boolean): void;
}

export declare type SubOption = {
    [key: string]: Option_2;
};

export declare function supportsPopover(): boolean;

export { }
