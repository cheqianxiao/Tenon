import { ComponentTreeNode } from "../store/modules/viewer";
import { useStore } from "../store";
import { reactive, toRaw } from "vue";
import { createPropsBySchemas } from "./schema";
import { createTenonEditorComponentByMaterial } from "./tree-operation";

export const tree2config = (config: ComponentTreeNode) => {
  let newConfig: any = {};
  const extractKey = [
    'parent',
    'children',
    'material',
    'props',
    'slots',
    'states',
    'ctx',
    'subComponents'
  ]
  for (let key in config) {
    if (extractKey.includes(key)) continue;
    newConfig[key] = config[key];
  }
  if (config.props) {
    newConfig.props = { ...toRaw(config.props) };
  }
  if (config.children) {
    newConfig.children = config.children.map(child => {
      return tree2config(child);
    });
  }
  if (config.slots) {
    const oldSlots = toRaw(config.slots);
    newConfig.slots = {};
    Object.keys(oldSlots).forEach(key => {
      newConfig.slots[key] = tree2config(oldSlots?.[key] || {});
    });
  }
  if (config.states) {
    newConfig.states = toRaw(config.states);
  }
  return newConfig;
};

export const config2tree = (config: any, sup?: any): ComponentTreeNode => {
  const store = useStore();
  const materialsMap = store.getters["materials/getMaterialsMap"];
  if (sup) {
    config.parent = sup;
  }
  const compFactory = materialsMap.get(config.name);

  config.material = compFactory();
  config.material.tenonComp = config;

  if (config.props) {
    const materialProps = createPropsBySchemas(materialsMap.get(config.name)?.().schemas);
    Object.keys(materialProps).forEach(key => {
      if (!config.props[key]) config.props[key] = materialProps[key];
    })
    config.props = reactive(config.props);
  }
  if (config.children) {
    config.children.forEach(child => {
      config2tree(child, config);
    });
  }
  if (config.slots) {
    let newSlots = {};
    Object.keys(config.slots).forEach(key => {
      newSlots[key] = config2tree(config.slots[key]);
    });
    config.slots = newSlots;
  }
  if (config.states) {
    config.states = reactive(config.states);
  }

  config.subComponents = {};

  return config;
}