import {
  BaseMaterial, IMaterialEventMeta, MaterialPropsType,
  clickTrigger, doubleClickTrigger, internalMeta,
} from "@tenon/materials";
import { h } from "vue";
import composeViewVue from "./components/compose-view.vue";
import { IComposeViewFeature } from "./compose-view.interface";
import { IRuntimeComponentTreeFeature } from "../runtime-component-tree";
import { Logger } from "@/utils/logger";
import type { RendererManager } from "@/core/renderer";
import { IRenderer, ModelImpl, ModelType, RendererType } from "@tenon/engine";

const TenonComposeViewInfo = {
  name: 'ComposeView',
  icon: 'app',
  description: '[原子组件] 提供组合视图的能力',
  props: {
    style: {
      type: MaterialPropsType.StyleSheet,
      default: {
        color: '#777',
      },
      name: '样式',
    },
  },
  eventMeta: [
    {
      name: 'onClick',
      desc: '点击事件',
      trigger: clickTrigger,
    },
    {
      name: 'onDoubleClick',
      desc: '双击事件',
      trigger: doubleClickTrigger,
    }
  ] as IMaterialEventMeta[],
}

export class TenonComposeView extends BaseMaterial<RendererType.Vue> implements IRenderer {
  public name = TenonComposeViewInfo.name;
  public icon = TenonComposeViewInfo.icon;
  public description = TenonComposeViewInfo.description;
  public propMeta = TenonComposeViewInfo.props;
  public nestable = true;
  public eventMeta = [...internalMeta, ...TenonComposeViewInfo.eventMeta];

  private composeViewHandler: IComposeViewFeature;
  private rendererManager: RendererManager;
  private runtimeComponentTreeHandler: IRuntimeComponentTreeFeature;
  constructor(
    composeViewHandler: IComposeViewFeature,
    rendererManager: RendererManager,
    runtimeComponentTreeHandler: IRuntimeComponentTreeFeature,
  ) {
    super();
    this.composeViewHandler = composeViewHandler;
    this.rendererManager = rendererManager;
    // this.runtimeComponentTreeHandler = runtimeComponentTreeHandler;
    if (!this.composeViewHandler) {
      Logger.log('composeViewHandler is null', this);
    }
  }

  public render(model: ModelImpl[ModelType.Tree], props: {
    [K in keyof TenonComposeView["propMeta"]]: TenonComposeView["propMeta"][K]["type"];
  }) {
    Logger.log('render compose view', model, props);
    const { children } = model;
    const setProps = {
      key: model.id,
      ...props,
      ...this.getInternalProps(),
      runtimeTree: model,
      bridge: model.bridge,
      composeViewHandler: this.composeViewHandler,
      isEmpty: children.length === 0,
    };
    // this.runtimeComponentTreeHandler.initRuntimeTree(model);
    // @ts-ignore
    return h(composeViewVue, setProps, () => {
      // console.log(`render children, host: ${runtimeTree.id}`, children);
      return children.map((child) => {
        // this.runtimeComponentTreeHandler.initRuntimeTree(child);
        const renderer = this.rendererManager.getRenderer(child.name);
        return renderer.render(child, { key: child.id });
      });
    });
  }
}
