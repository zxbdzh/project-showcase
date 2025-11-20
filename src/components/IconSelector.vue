<template>
  <div class="icon-selector">
    <el-form-item :label="label" :required="required">
      <el-popover placement="bottom" :width="400" trigger="click">
        <template #reference>
          <div class="icon-display" @click="showIconPicker = true">
            <font-awesome-icon v-if="modelValue" :icon="selectedIcon" />
            <span v-else>选择图标</span>
          </div>
        </template>
        <div class="icon-grid">
          <div
            v-for="icon in availableIcons"
            :key="icon.name"
            class="icon-item"
            :class="{ selected: modelValue === icon.name }"
            @click="selectIcon(icon)"
          >
            <font-awesome-icon :icon="icon.icon" />
          </div>
        </div>
      </el-popover>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  faUser,
  faHeart,
  faStar,
  faCheckCircle,
  faTimesCircle,
  faPlusSquare,
  faFile,
  faFolder,
  faFileAlt,
  faFileImage,
  faFilePdf,
  faEnvelope,
  faComment,
  faComments,
  faShare,
  faShareAlt,
  faChartBar,
  faChartLine,
  faChartPie,
  faSun,
  faCloud,
  faSnowflake,
  faMap,
  faMapMarkerAlt,
  faCompass,
  faGlobe,
  faWheelchair,
  faUniversalAccess,
  faAssistiveListeningSystems,
  faSignLanguage,
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faArrowCircleUp,
  faBars,
  faEllipsisH,
  faEllipsisV,
  faExpand,
  faCompress,
} from '@fortawesome/free-solid-svg-icons'
import {
  farUser,
  farHeart,
  farStar,
  farCheckCircle,
  farTimesCircle,
  farPlusSquare,
  farFile,
  farFolder,
  farFileAlt,
  farFileImage,
  farFilePdf,
  farEnvelope,
  farComment,
  farComments,
  farShare,
  farShareAlt,
  farChartBar,
  farChartLine,
  farChartPie,
  farSun,
  farCloud,
  farSnowflake,
  farMap,
  farMapMarkerAlt,
  farCompass,
  farGlobe,
  farWheelchair,
  farUniversalAccess,
  farAssistiveListeningSystems,
  farSignLanguage,
} from '@fortawesome/free-regular-svg-icons'
import {
  faGithub as faGithubBrand,
  faTwitter as faTwitterBrand,
  faFacebook as faFacebookBrand,
  faLinkedin as faLinkedinBrand,
  faInstagram as faInstagramBrand,
  faYoutube as faYoutubeBrand,
  faChrome as faChromeBrand,
  faFirefox as faFirefoxBrand,
  faSafari as faSafariBrand,
  faEdge as faEdgeBrand,
  faOpera as faOperaBrand,
  faInternetExplorer as faInternetExplorerBrand,
  faApple as faAppleBrand,
  faMicrosoft as faMicrosoftBrand,
  faGoogle as faGoogleBrand,
  faAmazon as faAmazonBrand,
  faPaypal as faPaypalBrand,
  faStripe as faStripeBrand,
  faBitcoin as faBitcoinBrand,
  faEthereum as faEthereumBrand,
  faDiscord as faDiscordBrand,
  faSlack as faSlackBrand,
  faTelegram as faTelegramBrand,
  faWhatsapp as faWhatsappBrand,
  faVuejs as faVuejsBrand,
  faReact as faReactBrand,
  faAngular as faAngularBrand,
  faNodeJs as faNodeJsBrand,
  faNpm as faNpmBrand,
  faYarn as faYarnBrand,
  faLinux as faLinuxBrand,
  faWindows as faWindowsBrand,
  faAndroid as faAndroidBrand,
  faDocker as faDockerBrand,
} from '@fortawesome/free-brands-svg-icons'

interface IconItem {
  name: string
  icon: any
  type: 'fas' | 'far' | 'fab'
}

const props = defineProps<{
  modelValue: string
  label?: string
  required?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const showIconPicker = ref(false)

// 创建图标映射
const iconMap: Record<string, IconItem> = {
  // Solid icons
  faUser: { name: 'faUser', icon: faUser, type: 'fas' },
  faHeart: { name: 'faHeart', icon: faHeart, type: 'fas' },
  faStar: { name: 'faStar', icon: faStar, type: 'fas' },
  faCheckCircle: { name: 'faCheckCircle', icon: faCheckCircle, type: 'fas' },
  faTimesCircle: { name: 'faTimesCircle', icon: faTimesCircle, type: 'fas' },
  faPlusSquare: { name: 'faPlusSquare', icon: faPlusSquare, type: 'fas' },
  faFile: { name: 'faFile', icon: faFile, type: 'fas' },
  faFolder: { name: 'faFolder', icon: faFolder, type: 'fas' },
  faFileAlt: { name: 'faFileAlt', icon: faFileAlt, type: 'fas' },
  faFileImage: { name: 'faFileImage', icon: faFileImage, type: 'fas' },
  faFilePdf: { name: 'faFilePdf', icon: faFilePdf, type: 'fas' },
  faEnvelope: { name: 'faEnvelope', icon: faEnvelope, type: 'fas' },
  faComment: { name: 'faComment', icon: faComment, type: 'fas' },
  faComments: { name: 'faComments', icon: faComments, type: 'fas' },
  faShare: { name: 'faShare', icon: faShare, type: 'fas' },
  faShareAlt: { name: 'faShareAlt', icon: faShareAlt, type: 'fas' },
  faChartBar: { name: 'faChartBar', icon: faChartBar, type: 'fas' },
  faChartLine: { name: 'faChartLine', icon: faChartLine, type: 'fas' },
  faChartPie: { name: 'faChartPie', icon: faChartPie, type: 'fas' },
  faSun: { name: 'faSun', icon: faSun, type: 'fas' },
  faCloud: { name: 'faCloud', icon: faCloud, type: 'fas' },
  faSnowflake: { name: 'faSnowflake', icon: faSnowflake, type: 'fas' },
  faMap: { name: 'faMap', icon: faMap, type: 'fas' },
  faMapMarkerAlt: { name: 'faMapMarkerAlt', icon: faMapMarkerAlt, type: 'fas' },
  faCompass: { name: 'faCompass', icon: faCompass, type: 'fas' },
  faGlobe: { name: 'faGlobe', icon: faGlobe, type: 'fas' },
  faWheelchair: { name: 'faWheelchair', icon: faWheelchair, type: 'fas' },
  faUniversalAccess: { name: 'faUniversalAccess', icon: faUniversalAccess, type: 'fas' },
  faAssistiveListeningSystems: {
    name: 'faAssistiveListeningSystems',
    icon: faAssistiveListeningSystems,
    type: 'fas',
  },
  faSignLanguage: { name: 'faSignLanguage', icon: faSignLanguage, type: 'fas' },
  faArrowUp: { name: 'faArrowUp', icon: faArrowUp, type: 'fas' },
  faArrowDown: { name: 'faArrowDown', icon: faArrowDown, type: 'fas' },
  faArrowLeft: { name: 'faArrowLeft', icon: faArrowLeft, type: 'fas' },
  faArrowRight: { name: 'faArrowRight', icon: faArrowRight, type: 'fas' },
  faArrowCircleUp: { name: 'faArrowCircleUp', icon: faArrowCircleUp, type: 'fas' },
  faBars: { name: 'faBars', icon: faBars, type: 'fas' },
  faEllipsisH: { name: 'faEllipsisH', icon: faEllipsisH, type: 'fas' },
  faEllipsisV: { name: 'faEllipsisV', icon: faEllipsisV, type: 'fas' },
  faExpand: { name: 'faExpand', icon: faExpand, type: 'fas' },
  faCompress: { name: 'faCompress', icon: faCompress, type: 'fas' },

  // Regular icons
  farUser: { name: 'farUser', icon: farUser, type: 'far' },
  farHeart: { name: 'farHeart', icon: farHeart, type: 'far' },
  farStar: { name: 'farStar', icon: farStar, type: 'far' },
  farCheckCircle: { name: 'farCheckCircle', icon: farCheckCircle, type: 'far' },
  farTimesCircle: { name: 'farTimesCircle', icon: farTimesCircle, type: 'far' },
  farPlusSquare: { name: 'farPlusSquare', icon: farPlusSquare, type: 'far' },
  farFile: { name: 'farFile', icon: farFile, type: 'far' },
  farFolder: { name: 'farFolder', icon: farFolder, type: 'far' },
  farFileAlt: { name: 'farFileAlt', icon: farFileAlt, type: 'far' },
  farFileImage: { name: 'farFileImage', icon: farFileImage, type: 'far' },
  farFilePdf: { name: 'farFilePdf', icon: farFilePdf, type: 'far' },
  farEnvelope: { name: 'farEnvelope', icon: farEnvelope, type: 'far' },
  farComment: { name: 'farComment', icon: farComment, type: 'far' },
  farComments: { name: 'farComments', icon: farComments, type: 'far' },
  farShare: { name: 'farShare', icon: farShare, type: 'far' },
  farShareAlt: { name: 'farShareAlt', icon: farShareAlt, type: 'far' },
  farChartBar: { name: 'farChartBar', icon: farChartBar, type: 'far' },
  farChartLine: { name: 'farChartLine', icon: farChartLine, type: 'far' },
  farChartPie: { name: 'farChartPie', icon: farChartPie, type: 'far' },
  farSun: { name: 'farSun', icon: farSun, type: 'far' },
  farCloud: { name: 'farCloud', icon: farCloud, type: 'far' },
  farSnowflake: { name: 'farSnowflake', icon: farSnowflake, type: 'far' },
  farMap: { name: 'farMap', icon: farMap, type: 'far' },
  farMapMarkerAlt: { name: 'farMapMarkerAlt', icon: farMapMarkerAlt, type: 'far' },
  farCompass: { name: 'farCompass', icon: farCompass, type: 'far' },
  farGlobe: { name: 'farGlobe', icon: farGlobe, type: 'far' },
  farWheelchair: { name: 'farWheelchair', icon: farWheelchair, type: 'far' },
  farUniversalAccess: { name: 'farUniversalAccess', icon: farUniversalAccess, type: 'far' },
  farAssistiveListeningSystems: {
    name: 'farAssistiveListeningSystems',
    icon: farAssistiveListeningSystems,
    type: 'far',
  },
  farSignLanguage: { name: 'farSignLanguage', icon: farSignLanguage, type: 'far' },

  // Brand icons
  faGithub: { name: 'faGithub', icon: faGithubBrand, type: 'fab' },
  faTwitter: { name: 'faTwitter', icon: faTwitterBrand, type: 'fab' },
  faFacebook: { name: 'faFacebook', icon: faFacebookBrand, type: 'fab' },
  faLinkedin: { name: 'faLinkedin', icon: faLinkedinBrand, type: 'fab' },
  faInstagram: { name: 'faInstagram', icon: faInstagramBrand, type: 'fab' },
  faYoutube: { name: 'faYoutube', icon: faYoutubeBrand, type: 'fab' },
  faChrome: { name: 'faChrome', icon: faChromeBrand, type: 'fab' },
  faFirefox: { name: 'faFirefox', icon: faFirefoxBrand, type: 'fab' },
  faSafari: { name: 'faSafari', icon: faSafariBrand, type: 'fab' },
  faEdge: { name: 'faEdge', icon: faEdgeBrand, type: 'fab' },
  faOpera: { name: 'faOpera', icon: faOperaBrand, type: 'fab' },
  faInternetExplorer: { name: 'faInternetExplorer', icon: faInternetExplorerBrand, type: 'fab' },
  faApple: { name: 'faApple', icon: faAppleBrand, type: 'fab' },
  faMicrosoft: { name: 'faMicrosoft', icon: faMicrosoftBrand, type: 'fab' },
  faGoogle: { name: 'faGoogle', icon: faGoogleBrand, type: 'fab' },
  faAmazon: { name: 'faAmazon', icon: faAmazonBrand, type: 'fab' },
  faPaypal: { name: 'faPaypal', icon: faPaypalBrand, type: 'fab' },
  faStripe: { name: 'faStripe', icon: faStripeBrand, type: 'fab' },
  faBitcoin: { name: 'faBitcoin', icon: faBitcoinBrand, type: 'fab' },
  faEthereum: { name: 'faEthereum', icon: faEthereumBrand, type: 'fab' },
  faDiscord: { name: 'faDiscord', icon: faDiscordBrand, type: 'fab' },
  faSlack: { name: 'faSlack', icon: faSlackBrand, type: 'fab' },
  faTelegram: { name: 'faTelegram', icon: faTelegramBrand, type: 'fab' },
  faWhatsapp: { name: 'faWhatsapp', icon: faWhatsappBrand, type: 'fab' },
  faVuejs: { name: 'faVuejs', icon: faVuejsBrand, type: 'fab' },
  faReact: { name: 'faReact', icon: faReactBrand, type: 'fab' },
  faAngular: { name: 'faAngular', icon: faAngularBrand, type: 'fab' },
  faNodeJs: { name: 'faNodeJs', icon: faNodeJsBrand, type: 'fab' },
  faNpm: { name: 'faNpm', icon: faNpmBrand, type: 'fab' },
  faYarn: { name: 'faYarn', icon: faYarnBrand, type: 'fab' },
  faLinux: { name: 'faLinux', icon: faLinuxBrand, type: 'fab' },
  faWindows: { name: 'faWindows', icon: faWindowsBrand, type: 'fab' },
  faAndroid: { name: 'faAndroid', icon: faAndroidBrand, type: 'fab' },
  faDocker: { name: 'faDocker', icon: faDockerBrand, type: 'fab' },
}

const availableIcons = computed(() => {
  return Object.values(iconMap)
})

const selectedIcon = computed(() => {
  return iconMap[props.modelValue]?.icon || null
})

const selectIcon = (icon: IconItem) => {
  emit('update:modelValue', icon.name)
  showIconPicker.value = false
}
</script>

<style scoped>
.icon-selector {
  width: 100%;
}

.icon-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  color: #606266;
  transition: all 0.3s;
}

.icon-display:hover {
  border-color: #409eff;
  color: #409eff;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  color: #606266;
  transition: all 0.3s;
}

.icon-item:hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #f5f7fa;
}

.icon-item.selected {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
}
</style>
