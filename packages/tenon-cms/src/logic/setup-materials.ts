import { Image } from "@arco-design/web-vue";
import {
  createTextVNode,
  defineComponent, h,
  onMounted, onUpdated,
  onBeforeUnmount, onBeforeMount,
  reactive
} from "vue";
import { IMaterial } from "../store/modules/materials";
import { containerSchema, parseSchemas2Props } from "./schema";

const materials = new Map<string, (() => IMaterial)[]>();
const materialsMap = new Map<string, () => IMaterial>();
const componentMap = new Map<string, any>();
const dependencies = {
  Image,
}

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
    const config = configRaw[key];
    const vuePath = getPath('.vue');
    const vueConfig = vueRaw?.[vuePath]?.default;

    const viewPath = getPath('.view.json');
    const viewConfig = viewRaw[viewPath]?.default;

    const logicPath = getPath('.ts');
    const logicConfig = logicRaw[logicPath]?.default;

    if (!materials.get(categoryKey)) {
      materials.set(categoryKey, []);
    }

    config.schemas?.unshift(containerSchema);
    const comp: () => IMaterial = () => {
      const base: IMaterial = {
        name: compName,
        component: config.setup === 'native'
          ? vueConfig
          : componentMap.has(config.name)
            ? componentMap.get(config.name)
            : createComponent(viewConfig, logicConfig, config),
        config,
        schemas: config.schemas,
      };
      return base;
    };

    materials.get(categoryKey)!.push(comp);
    materialsMap.set(compName, comp);
  });

  store.dispatch('materials/setMaterials', materials);
  store.dispatch('materials/setMaterialsMap', materialsMap);
}


function createComponent(viewConfig, logic, config) {
  const comp = defineComponent({
    name: config.name,
    render: function (this: any) {
      return parseConfig2View.call(this, viewConfig).call(this);
    },
    props: parseSchemas2Props(config.schemas),
    setup: function (props, ctx) { return setupComponent(props, ctx, logic, config) },
  });

  componentMap.set(config.name, comp);
  return comp;
}

function setupComponent(props, ctx, logic, config) {
  const state = logic?.({
    onMounted, onUpdated, onBeforeUnmount, onBeforeMount
  }, props, ctx) || {};

  return reactive(state);
}

function parseConfig2View(this: any, config) {
  if (typeof config === 'string') {
    config = config.trim();
    if (config.startsWith('{{') && config.endsWith('}}')) {
      return () => createTextVNode(recursiveGetValue(this, config.slice(2, -2)));
    }
    return () => createTextVNode(config);
  }

  let {
    el,
    props = {},
    children = []
  } = config;

  if (dependencies[el]) el = dependencies[el];

  if (materialsMap.has(el)) {
    const compFactory = materialsMap.get(el);
    const material = compFactory?.();
    el = material?.component;
  }

  const processedProps = setupProps.call(this, props);
  return function _custom_render(this: any) {
    return h(el, processedProps, {
      default: () => children.map(child => parseConfig2View.call(this, child).call(this)),
    });
  };
}

function recursiveGetValue(obj: any, path: string) {
  if (path.includes('.')) {
    const [key, ...rest] = path.split('.');
    return recursiveGetValue(obj[key], rest.join('.'));
  }
  return obj[path];
}

function setupProps(this: any, props = {}) {
  const newProps = {};
  Object.keys(props).forEach(key => {
    const value = props[key];
    switch (key) {
      case 'style':
        newProps[key] = recursiveGetValue(this, value);
        break;
      default:
        newProps[key] = value;
        break;
    }
  });
  return newProps;
}