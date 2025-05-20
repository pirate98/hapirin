import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  registerPushCreateAndroid: (userId: string, title: string, time: string) => Promise<any>;
  registerPushHomeAndroid: (userId: string, title: string, time: string) => Promise<any>;
  updatePushNotification: (userId: string, title: string, time: string, titleOld: string, oldDate: string) => void
  cancelPushNotification: (userId: string, title: string, time: string) => Promise<any>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'NotificationHandle'
)