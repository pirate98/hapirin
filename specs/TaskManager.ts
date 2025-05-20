import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
  getAllTask({ }): Promise<any>;
  registerPushNotificationHome(data: Record<string, any>): Promise<any>;
  registerPushNotificationCreate(data: Record<string, any>): Promise<any>;
  installPushNotificationData(data: Record<string, any>): Promise<any>;
  updatePushNotificationData(data: Record<string, any>): Promise<any>;
  deletePushNotificationData(data: Record<string, any>): Promise<any>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'TaskManager'
)