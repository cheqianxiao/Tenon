import {
  ActionController, HeaderBarController, ToolBarController,
  awaitLoad, IDynamicFeature, Loader,
  HeaderBarControllerResult, ToolBarControllerResult,
  ActionType,
  BarService,
  BarConfig,
  InjectBarService,
  InjectActionInfoService,
  ActionInfo,
  HeaderBarType,
  InjectDrawerService,
  DrawerServiceCore,
} from "@tenon/workbench";
import { HeaderBarName, MoreItemName } from "../../configs/header-bar-config";
import { HeaderBarFeature } from "./headerbar.interface";
import SubTitle from "../../components/sub-title.vue";
import { h } from "vue";
import { MessagePlugin } from "tdesign-vue-next";
import { ToolBarName } from "../../configs/tool-bar-config";
import { FootBarName } from "../../configs/foot-bar-config";
import FullScreen from "vue-material-design-icons/FullScreen.vue";
import FullScreenExit from "vue-material-design-icons/FullScreenExit.vue"

export class HeaderBarsController {

  @Loader(HeaderBarFeature)
  headerBar: IDynamicFeature<HeaderBarFeature>;

  @Loader(BarService)
  barService: IDynamicFeature<BarConfig>

  @ActionController(HeaderBarName.GithubIcon, ActionType.onClick)
  @awaitLoad(HeaderBarFeature)
  handleGithubIconClick() {
    window.open(this.headerBar.instance!.getGitHubHref(), '_blank');
  }

  @ActionController(HeaderBarName.DocIcon, ActionType.onClick)
  handleDocIconClick(
    @InjectBarService() barService: BarConfig,
    @InjectActionInfoService() actionInfo: ActionInfo,
  ) {
    console.log(barService, actionInfo);
  }

  @ActionController(MoreItemName.More, ActionType.onClick)
  @ActionController('edit', ActionType.onClick)
  handleMoreClick(@InjectActionInfoService() actionInfo: ActionInfo) {
    console.log(actionInfo);

    if (actionInfo.name === MoreItemName.More) {
      MessagePlugin.success('点击更多');
    } else if (actionInfo.name === 'edit') {
      MessagePlugin.success('切换为编辑模式');
    }
  }

  @HeaderBarController(HeaderBarName.GithubIcon)
  async updateGithubItemConfig(): Promise<HeaderBarControllerResult> {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    return {
      type: HeaderBarType.Operator,
      popupText: 'Github: D0ct0r',
      icon: {
        iconName: 'logo-github',
      }
    };
  }

  @HeaderBarController(HeaderBarName.SubTitle)
  async updateSubTitle(): Promise<HeaderBarControllerResult> {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    return {
      render: () => h(SubTitle, {
        text: 'Workbench副标题 (updated)',
        style: {
          alignSelf: 'flex-end',
        },
      }),
    };
  }

  @ToolBarController(ToolBarName.SaveConfig)
  async updateMode(): Promise<ToolBarControllerResult> {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    return {
      disabled: true,
    };
  }

  @ToolBarController('preview')
  async updatePreview(): Promise<ToolBarControllerResult> {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
    return {
      disabled: true,
    };
  }

  @ActionController(ToolBarName.MaterialSwitch, ActionType.onActive)
  @awaitLoad(BarService)
  handleMaterialActive(
    @InjectActionInfoService() actionInfo: ActionInfo,
    @InjectDrawerService() drawerService: DrawerServiceCore,
  ) {
    console.log(actionInfo);
    const barService = this.barService.instance!;
    drawerService.left.replaceLayer('物料面板', () => h('span', '物料面板'));
    barService.updateToolBarConfig(ToolBarName.ComponentTreeSwitch, {
      active: false,
    });
  }

  @ActionController(ToolBarName.MaterialSwitch, ActionType.onDeActive)
  handleMaterialDeActive(
    @InjectActionInfoService() actionInfo: ActionInfo,
    @InjectDrawerService() drawerService: DrawerServiceCore,
  ) {
    console.log(actionInfo);
    drawerService.left.detachLayer();
  }

  @ActionController(ToolBarName.ComponentTreeSwitch, ActionType.onActive)
  @awaitLoad(BarService)
  handleComponentTreeActive(
    @InjectActionInfoService() actionInfo: ActionInfo,
    @InjectDrawerService() drawerService: DrawerServiceCore,
  ) {
    console.log(actionInfo);
    const barService = this.barService.instance!;
    drawerService.left.replaceLayer('组件树面板', () => h('span', '组件树面板'));
    barService.updateToolBarConfig(ToolBarName.MaterialSwitch, {
      active: false,
    });
  }

  @ActionController(ToolBarName.ComponentTreeSwitch, ActionType.onDeActive)
  handleComponentTreeDeActive(
    @InjectDrawerService() drawerService: DrawerServiceCore,
  ) {
    drawerService.left.detachLayer();
  }

  @ActionController(FootBarName.FullScreen, ActionType.onClick)
  @awaitLoad(HeaderBarFeature)
  handleFullScreenClick(
    @InjectBarService() barService: BarConfig,
  ) {
    const isFullScreen = this.headerBar.instance!.isFullScreen;
    this.headerBar.instance!.toggleFullScreen();
    barService.updateFootBarConfig(FootBarName.FullScreen, {
      icon: {
        iconRender: () => h(isFullScreen ? FullScreen : FullScreenExit, {
          size: 24,
          key: String(isFullScreen),
        }),
      },
      popupText: isFullScreen ? '全屏' : '取消全屏'
    })
  }
}