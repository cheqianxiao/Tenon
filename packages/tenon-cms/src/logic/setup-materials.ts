import {
  createTextVNode,
  defineComponent, h,
  onMounted, onUpdated,
  onBeforeUnmount, onBeforeMount,
  reactive,
  getCurrentInstance,
  computed,
  watchEffect,
  Fragment,
  resolveDynamicComponent,
  ref,
} from "vue";
import { internalSchema } from "../schemas";
import { IMaterialConfig } from "../store/modules/materials";
import { ISchema, parseSchemas2Props } from "./schema";
import { MaterialComponentContext } from "./setup-component-context";
import { getValueByHackContext, getValueByInjectContext } from "@tenon/shared";
import { createTenonEditorComponentByMaterial } from "./tree-operation";
import _ from "lodash";
import { ComponentTreeNode } from "../store/modules/viewer";
import { materialDependency } from "./material-dependency";
import { eventsMap, IExecuteQueueItem } from "./events";

const materials = new Map<string, (() => IMaterialConfig)[]>();
const materialsMap = new Map<string, () => IMaterialConfig>();
const componentMap = new Map<string, any>();

export const setupMaterials = (store: any) => {
  const vueRaw = import.meta.globEager('../materials/**/*.vue');
  const configRaw = import.meta.globEager('../materials/**/*.config.json');
  const viewRaw = import.meta.globEager('../materials/**/*.view.json');
  const logicRaw = import.meta.globEager('../materials/**/*.ts');
  Object.keys(configRaw).forEach(key => {
    const extractPrefixName = key.replace('../materials/', '');
    const categoryKey = extractPrefixName.split('/')[0];
    const compName = extractPrefixName.split('/')[1];

    const getPath = (placeholder) => {
      return key.replace('.config.json', placeholder);
    }
    const config = configRaw[key].default;

    const vuePath = getPath('.vue');
    const vueConfig = vueRaw?.[vuePath]?.default;

    const viewPath = getPath('.view.json');
    const viewConfig = viewRaw[viewPath]?.default;

    const logicPath = getPath('.ts');
    const logicConfig = logicRaw[logicPath]?.default;

    if (!materials.get(categoryKey)) {
      materials.set(categoryKey, []);
    }

    setupConfigSchemas(config);
    const compFactory: () => IMaterialConfig = () => {
      const bornConfig = _.cloneDeep(config);
      const base: IMaterialConfig = {
        name: compName,
        config: bornConfig,
        schemas: bornConfig.schemas,
        component: {},
      };

      base.component = config.setup === 'native'
        ? vueConfig
        : createComponent(viewConfig, logicConfig, base);

      return base;
    };

    materials.get(categoryKey)!.push(compFactory);
    materialsMap.set(compName, compFactory);
  });

  store.dispatch('materials/setMaterials', materials);
  store.dispatch('materials/setMaterialsMap', materialsMap);
}


function createComponent(viewConfig, logic, material: IMaterialConfig) {
  if (componentMap.has(material.config.name)) {
    const comp = { ...componentMap.get(material.config.name) };

    return comp;
  }
  const comp = defineComponent({
    name: material.config.name,
    render: function (this: any) {
      return parseConfig2RenderFn.call(this, viewConfig, true).call(this);
    },
    inheritAttrs: false,
    props: parseSchemas2Props(material.config.schemas),
    setup: function (props, ctx) {
      return setupComponent(props, ctx, logic);
    },
  });

  componentMap.set(material.config.name, comp);
  return comp;
}

function setupComponent(props, ctx, logic) {
  const instance = getCurrentInstance();
  const tenonComp: ComponentTreeNode = (instance as any)?.ctx.$attrs.tenonComp;

  tenonComp.ctx = (instance as any)?.ctx;
  tenonComp.ctx.tenonComp = tenonComp.ctx.tenonComp || tenonComp;

  const parentComp: ComponentTreeNode | null = findParentTenonComp(instance);
  if (parentComp) {
    if (tenonComp.refKey) {
      parentComp.refs = parentComp.refs || {};
      parentComp.refs[tenonComp.refKey] = parentComp.refs[tenonComp.refKey] || tenonComp;
    }
    tenonComp.parentComponent = parentComp;
    // parentComp.subComponents[`${tenonComp.name}_${tenonComp.id}`].parentComponent = parentComp;
  };

  setupComponentEvents(tenonComp);

  const setupStates = reactive(logic?.({
    onMounted, onUpdated, onBeforeUnmount, onBeforeMount,
    watch: watchEffect
  }, props, ctx, tenonComp) || {});

  const handlers = reactive<string[]>([]);
  Object.keys(setupStates).forEach(key => {
    if (typeof setupStates[key] === "function") {
      handlers.push(key);
      eventsMap.set(`${key}_${tenonComp.id}`, setupStates[key]);
    }
  });

  setupStates.executeEvents$ = (eventName: string) => {
    if (!tenonComp.events[eventName]) return;
    executeQueueEvents(tenonComp.events[eventName].executeQueue);
  };
  // debugger;
  tenonComp.states = setupStates;
  tenonComp.handlers = handlers;
  tenonComp.ctx._isTenonComp = true;

  return setupStates;
}


function setupComponentEvents(tenonComp: ComponentTreeNode) {
  if (tenonComp.events.onMounted) {
    const eventStruct = tenonComp.events["onMounted"];
    onMounted(() => {
      executeQueueEvents(eventStruct.executeQueue);
    });
  }
  if (tenonComp.events.onBeforeUnmount) {
    const eventStruct = tenonComp.events["onBeforeUnmount"];
    onBeforeUnmount(() => {
      executeQueueEvents(eventStruct.executeQueue);
    });
  }
}

function executeQueueEvents(executeQueue: IExecuteQueueItem[]) {
  executeQueue.forEach(item => {
    const eventIdentifier = `${item.eventName}_${item.tenonCompID}`;
    const eventEntity = eventsMap.get(eventIdentifier);
    if (eventEntity) eventEntity();
  });
}

export function findParentTenonComp(instance: any): ComponentTreeNode | null {
  if (!instance?.parent) return null;
  if (instance.parent.ctx._isTenonComp) return instance.parent.ctx.tenonComp;
  return findParentTenonComp(instance.parent);
}

function parseConfig2RenderFn(this: any, config, isRoot?: boolean) {
  if (typeof config === "string" || typeof config === "number") {
    config = String(config);
    config = config.trim();
    if (config.startsWith('{{') && config.endsWith('}}')) {
      return () => createTextVNode(computed(() => getValueByHackContext(this, config.slice(2, -2))).value);
    }
    return () => createTextVNode(config);
  }
  config = _.cloneDeep(config);
  let {
    el,
    props = {},
    children = [],
  } = config;

  if (config["<FOR>"] && !config._processedFOR) {
    const renderLoop = computed<Array<any>>(() => getValueByHackContext(this, config["<FOR>"]));

    return function _custom_for_render(this: any) {
      return h(Fragment, renderLoop.value.map(
        (item, index) => {
          const itemKey = config["<FORItemKey>"] || "item";
          const indexKey = config["<FORIndexKey>"] || "index";
          const subConfig = _.cloneDeep(config);
          subConfig._processedFOR = true;
          this[itemKey] = item;
          this[indexKey] = index;
          return parseConfig2RenderFn.call(this, subConfig).call(this);
        })
      );
    };
  }

  if (config["<IF>"] && !config._processedIF) {
    const renderCondition = computed(() => getValueByHackContext(this, config["<IF>"]));
    return function _custom_if_render(this: any) {
      const subConfig = _.cloneDeep(config);
      subConfig._processedIF = true;
      return renderCondition.value ? h(Fragment, [parseConfig2RenderFn.call(this, subConfig).call(this)]) : null;
    }
  }

  let processedProps: any = setupProps.call(this.tenonComp.ctx, props) || {};

  const Component = resolveDynamicComponent(el);
  if (typeof Component !== "string") {
    el = Component;
  }
  else if (materialDependency[el]) el = materialDependency[el];

  if (materialsMap.has(el)) {
    const compFactory = materialsMap.get(el);
    if (compFactory) {
      const material = compFactory();
      const source = _.cloneDeep(processedProps);
      const tenonComp = createTenonEditorComponentByMaterial(material, null, {
        isSlot: !!source.isSlot,
        props: source
      });
      if (el !== "Compose-View" || !source.isSlot) {
        processedProps = {
          tenonComp,
          ...tenonComp.props
        };
      }
      tenonComp.refKey = config.refKey;
      el = material.component;
    }
  }

  const rootRef = ref(null);
  processedProps["ref"] = rootRef;

  return function _custom_render(this: any) {
    const defaultArray: any[] = [];
    const injectChildren: any = {
      default: () => defaultArray,
    };

    children.forEach(child => {
      const { isSlot, slotKey } = child;
      if (isSlot) {
        const slotConfig = child;
        if (slotKey === "default") {
          defaultArray.push(parseConfig2RenderFn.call(this, slotConfig).call(this));
        } else {
          const vNode = parseConfig2RenderFn.call(this, slotConfig).call(this);
          if (vNode) {
            (injectChildren[slotKey] = () => vNode);
          } else {
            delete injectChildren[slotKey];
          }
        }
      }
      else
        defaultArray.push(parseConfig2RenderFn.call(this, child).call(this));
    });

    const VNode = h(el, processedProps, injectChildren);
    if (isRoot) {
      VNode.props = VNode.props || {};
      if (VNode.props?.onVnodeMounted) {
        if (!(VNode.props?.onVnodeMounted instanceof Array)) {
          VNode.props.onVnodeMounted = [VNode.props?.onVnodeMounted];
        }
      } else {
        VNode.props.onVnodeMounted = [];
      }
      const instance = getCurrentInstance();
      VNode.props?.onVnodeMounted.push(() => {
        if ((instance as any).ctx.tenonComp && (VNode?.props?.ref as any).value) {
          (instance as any).ctx.tenonComp.refs['$rootRef'] = (VNode?.props?.ref as any).value;
        }
      });
      if (VNode.props!.tenonComp) {
        VNode.props!.tenonComp.refs['$rootRef'] = (VNode.props?.ref as any);
      }
    }
    return VNode;
  };
}

function recursiveGetValue(obj: any, path: string) {
  if (!obj) return;
  if (path.includes('.')) {
    const [key, ...rest] = path.split('.');
    return recursiveGetValue(obj[key], rest.join('.'));
  }
  return obj[path];
}

function setupProps(this: any, props = {}) {
  const newProps = {};
  Object.keys(props).forEach(key => {
    injectDynamicPropsValue.call(this, props, key);
  });

  Object.keys(props).forEach(key => {
    key = key.trim();
    let value = props[key];
    switch (key) {
      case "style":
        if (typeof value === "string") {
          newProps[key] = recursiveGetValue(this, value);
        } else if (typeof value === "object") {
          newProps["style"] = value;
        }
        break;
      case "<BINDING>":
        value = value instanceof Array ? value : [value];
        value.forEach(val => {
          const bindings = props[val] || this[val] || {};
          Object.keys(bindings).forEach((bindingKey) => {
            newProps[bindingKey] = bindings[bindingKey];
          });
        });
        break;
      default:
        newProps[key] = value;
        break;
    }
  });
  return newProps;
}

function injectDynamicPropsValue(this: any, value: any, key: string) {
  if (!value[key]) return;
  const type = typeof value[key];
  switch (type) {
    case "object":
      Object.keys(value[key]).forEach(subKey => {
        injectDynamicPropsValue.call(this, value[key], subKey);
      });
      break;
    case "string":
      if (value[key].startsWith("{{") && value[key].endsWith("}}")) {
        value[key] = getValueByHackContext(this, value[key].slice(2, -2))
      }
      break;
    default:
      break;
  }
}
function setupConfigSchemas(config) {
  const {
    schemas = [],
  } = config;
  config.schemas = schemas.map((schema: ISchema) => {
    const {
      type,
      key = "",
      title,
      fieldName,
    } = schema;
    switch (type) {
      case 'object':
      case 'custom':
        return schema;
      case 'internal':
        const specSchema = Object.assign({}, internalSchema[key]);
        if (!specSchema) return schema;
        specSchema.title = title;
        specSchema.fieldName = fieldName;
        return specSchema;
      default:
        return schema;
    }
  });
  config.schemas?.push(internalSchema.containerLayout);
  config.schemas?.push(internalSchema.containerBackground);
  // config.schemas?.push(internalSchema.textStyle);
}
