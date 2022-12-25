import {
  IDynamicFeature, Loader, Controller, ActionController,
  ActionType, awaitLoad, InjectBarService, BarServiceCore,
  FootBarController, FootBarControllerResult,
} from "@tenon/workbench";
import { IFullScreenFeature } from "./fullscreen.interface";
import { FootBarName } from "@/configs/foot-bar-config";
import { ExitFullScreenConfig, FullScreenConfig } from "./configs";

@Controller()
export class FullScreenController {

  @Loader(IFullScreenFeature)
  fullScreenFeatureLoader: IDynamicFeature<IFullScreenFeature>;

  get fullScreenFeature() {
    return this.fullScreenFeatureLoader.instance;
  }


  @FootBarController(FootBarName.FullScreen)
  @awaitLoad(IFullScreenFeature)
  async enableFullScreen(): Promise<FootBarControllerResult> {
    const disabled = !this.fullScreenFeature!.enableFullScreen();
    return {
      disabled,
      ...disabled ? {
        popupText: '无法使用全屏功能',
      } : {},
    };
  }

  @ActionController(FootBarName.FullScreen, ActionType.onClick)
  @awaitLoad(IFullScreenFeature)
  async toggleFullScreen(
    @InjectBarService() barService: BarServiceCore,
  ) {
    const fullscreen = await this.fullScreenFeature!.toggleFullScreen();
  }
}
