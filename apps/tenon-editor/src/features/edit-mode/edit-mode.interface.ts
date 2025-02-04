import { bindDynamicLoader, createDynamicFeatureTag } from "@tenon/workbench";
import { FeatureName } from "../feature-name";
import { Ref } from "vue";
import { ToolBarName } from "@/configs/tool-bar-config";

export interface IEditModeFeature {
  // interface
  mode: EditModeType;
  switchMode(mode: EditModeType): void;
}

export enum EditModeType {
  Preview = ToolBarName.PreviewMode,
  Edit = ToolBarName.EditMode,
};


export const IEditModeFeature = createDynamicFeatureTag(FeatureName.EditMode);
bindDynamicLoader(IEditModeFeature, {
  load: async () => {
    const {
      EditModeHandler,
    } = await import('./edit-mode.handler');
    return EditModeHandler;
  }
});

// bind feature tag here

