import { h } from "vue";
import TextComponent from "./Text.vue";
import { clickTrigger, doubleClickTrigger } from "../../../events";
import { IMaterialEventMeta, internalMeta } from "../../../events/event-meta";
import { MaterialPropsType, BaseMaterial } from "../../../base-material";
import { ModelHost, ModelImpl, RendererHost } from "@tenon/engine";
import { TextReact } from "./Text.react";
import { createElement } from "react";

const TenonTextInfo = {
  name: 'TenonText',
  icon: 'app',
  description: '[原子组件] 提供文本能力',
  props: {
    text: {
      type: MaterialPropsType.String,
      default: '占位文字(生产环境不会渲染)',
      name: '文本',
    },
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

export class TenonText extends BaseMaterial<RendererHost.React | RendererHost.Vue> {
  public name = TenonTextInfo.name;
  public icon = TenonTextInfo.icon;
  public description = TenonTextInfo.description;
  public propMeta = TenonTextInfo.props;
  public supportRenderHost = [RendererHost.React, RendererHost.Vue];

  public eventMeta = [...internalMeta, ...TenonTextInfo.eventMeta];

  public render(
    type: RendererHost.React | RendererHost.Vue,
    model: ModelImpl[ModelHost],
    props: {
      [K in keyof TenonText["propMeta"]]: TenonText["propMeta"][K]["type"];
    },
  ) {
    const setProps = {
      ...props,
      ...this.getInternalProps(),
      bridge: model.bridge,
    };
    switch (type) {
      case RendererHost.React:
        return createElement(TextReact, setProps);
      case RendererHost.Vue:
        return h(TextComponent, setProps);
    }
  }
}
