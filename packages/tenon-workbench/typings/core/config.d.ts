import { VNode } from "vue";
import { ContextServiceCore } from '../services/context';
export declare type HeaderBarConfig = IHeaderBarItem[];
export declare enum HeaderBarType {
    Info = "Info",
    Operator = "Operator",
    ListTree = "ListTree"
}
export interface IHeaderBarBaseItem<BarType extends HeaderBarType> {
    name: string;
    type: BarType;
    hidden?: boolean;
}
export interface IHeaderBarInfoItem extends IHeaderBarBaseItem<HeaderBarType.Info> {
    render: () => VNode;
}
export interface IHeaderBarOperatorItem extends IHeaderBarBaseItem<HeaderBarType.Operator> {
    popupText?: string;
    iconName?: string;
    listTree?: IListTree[];
    render?: () => VNode;
}
export interface IListTree extends IHeaderBarBaseItem<HeaderBarType.ListTree> {
    text?: string;
    render?: () => VNode;
    children?: IListTree[];
}
export declare type IHeaderBarItem = IHeaderBarInfoItem | IHeaderBarOperatorItem;
export declare const BarService: symbol;
export declare class BarConfig {
    private headerBarConfigInit;
    actionMap: Map<any, {
        [props: string]: Function[];
    }>;
    contextService: ContextServiceCore;
    constructor(headerBarConfigInit: HeaderBarConfig);
    init(): void;
    get headerBarConfig(): any;
    regisAction(name: any, action: string, cb: Function): void;
    emitAction(name: any, action: string, ...args: any[]): void;
    updateUIConfig(name: any, partial: Partial<IHeaderBarItem>): void;
}
