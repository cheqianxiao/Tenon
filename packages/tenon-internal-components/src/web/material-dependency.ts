import DynamicComponent from "./dynamic-component.vue";
import Root from "./Root.vue";
import TenonAvatar from "./Avatar.vue";
import TenonText from "./Text.vue";
import TenonIcon from "./Icon.vue";
import TenonTable from "./Table.vue";
import For from "./For.vue";
import GhostText from "./GhostText.vue";
import Loading from "./Loading.vue";

import {
  Image,
  Card,
  Grid,
  Button,
  Carousel,
  Menu,
  Alert,
  Step,
  Steps,
  Checkbox,
  CheckboxGroup,
  DatePicker,
  Form,
  Input,
  InputNumber,
  InputTag,
  Radio,
  RadioGroup,
  Rate,
  Select,
  Switch,
  Textarea,
  TimePicker,
  Tag,
  Space,
  Typography,
  Spin,
  Skeleton,
  Avatar,
  Table,
} from "@arco-design/web-vue";

export const arcoDep: {
  install: any;
}[] = [
  Image,
  Card,
  Grid,
  Button,
  Carousel,
  Menu,
  Alert,
  Avatar,
  Table,
  
  // Step,
  Steps,
  Checkbox,
  // CheckboxGroup,
  DatePicker,
  Form,
  Input,
  InputNumber,
  InputTag,
  Radio,
  // RadioGroup,
  Rate,
  Select,
  Switch,
  Textarea,
  TimePicker,
  Tag,
  Space,
  Typography,
  Spin,
  Skeleton,
  IconUser,
]

import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconCaretDown,
  IconCaretLeft,
  IconCaretRight,
  IconCaretUp,
  IconCheckCircle,
  IconCloseCircle,
  IconDelete,
  IconDoubleDown,
  IconDoubleLeft,
  IconDoubleRight,
  IconDoubleUp,
  IconDown,
  IconGithub,
  IconLeft,
  IconQq,
  IconRight,
  IconThunderbolt,
  IconUp,
  IconWechat,
  IconWechatpay,
  IconExclamationCircle,
  IconPlusCircle,
  IconMinusCircle,
  IconQuestionCircle,
  IconStop,
  IconHeartFill,
  IconStarFill,
  IconThumbDownFill,
  IconThumbUpFill,
  IconAt,
  IconCloudDownload,
  IconCodeBlock,
  IconCodeSquare,
  IconCode,
  IconDownload,
  IconExport,
  IconHome,
  IconImport,
  IconList,
  IconMore,
  IconPoweroff,
  IconRefresh,
  IconReply,
  IconSearch,
  IconPlayCircle,
  IconUser,
  IconLock,
} from '@arco-design/web-vue/es/icon';

export const materialDependency: any = {
  ArcoImage: Image,
  ArcoCard: Card,
  GridCol: Grid.Col,
  GridRow: Grid.Row,
  ArcoButton: Button,
  ArcoCarousel: Carousel,
  ArcoCarouselItem: Carousel.Item,
  ArcoMenu: Menu,
  ArcoSubMenu: Menu.SubMenu,
  ArcoMenuItem: Menu.Item,
  ArcoAlert: Alert,
  ArcoStep: Steps,
  ArcoStepItem: Step,
  ArcoCheckbox: Checkbox,
  ArcoCheckboxGroup: CheckboxGroup,
  ArcoDatePicker: DatePicker,
  ArcoForm: Form,
  ArcoFormItem: Form.Item,
  ArcoInput: Input,
  ArcoInputNumber: InputNumber,
  ArcoInputTag: InputTag,
  ArcoRadio: Radio,
  ArcoRadioGroup: RadioGroup,
  ArcoRate: Rate,
  ArcoSelect: Select,
  ArcoOption: Select.Option,
  ArcoSwitch: Switch,
  ArcoTextarea: Textarea,
  ArcoTimePicker: TimePicker,
  ArcoTag: Tag,
  ArcoSpace: Space,
  ArcoTypography: Typography,
  ArcoTypographyParagraph: Typography.Paragraph,
  ArcoTypographyText: Typography.Text,
  ArcoTypographyTitle: Typography.Title,
  TenonTemplate: Root,
  TenonText: TenonText,
  TenonGhostText: GhostText,
  TenonAvatar: TenonAvatar,
  TenonIcon: TenonIcon,
  TenonTable: TenonTable,
  TenonFor: For,
  TenonLoading: Loading,
  DynamicComponent: DynamicComponent,
}

export const IconTypes = {
  thunder: IconThunderbolt,
  arrowDown: IconArrowDown,
  arrowLeft: IconArrowLeft,
  arrowRight: IconArrowRight,
  arrowUp: IconArrowUp,
  caretDown: IconCaretDown,
  caretUp: IconCaretUp,
  caretLeft: IconCaretLeft,
  caretRight: IconCaretRight,
  wechat: IconWechat,
  qq: IconQq,
  github: IconGithub,
  wechatPay: IconWechatpay,
  delete: IconDelete,
  down: IconDown,
  up: IconUp,
  left: IconLeft,
  right: IconRight,
  doubleDown: IconDoubleDown,
  doubleUp: IconDoubleUp,
  doubleLeft: IconDoubleLeft,
  doubleRight: IconDoubleRight,
  checkCircle: IconCheckCircle,
  closeCircle: IconCloseCircle,
  exclCircle: IconExclamationCircle,
  plusCircle: IconPlusCircle,
  minusCircle: IconMinusCircle,
  quizCircle: IconQuestionCircle,
  stop: IconStop,
  heartFill: IconHeartFill,
  starFill: IconStarFill,
  playCircle: IconPlayCircle,
  thumbDown: IconThumbDownFill,
  thumbUp: IconThumbUpFill,
  at: IconAt,
  cloudDown: IconCloudDownload,
  codeBlock: IconCodeBlock,
  codeSquare: IconCodeSquare,
  code: IconCode,
  download: IconDownload,
  export: IconExport,
  import: IconImport,
  home: IconHome,
  list: IconList,
  more: IconMore,
  poweroff: IconPoweroff,
  refresh: IconRefresh,
  reply: IconReply,
  search: IconSearch,
  user: IconUser,
  lock: IconLock,
};