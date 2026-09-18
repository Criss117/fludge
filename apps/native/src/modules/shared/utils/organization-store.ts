import { IOrganizationStorage } from "@fludge/client/providers/organization.provider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ORGANIZATION_LOCAL_STORAGE_KEY } from "./constanst";

export const OrganizationStore: IOrganizationStorage = {
  async save(state) {
    try {
      const serialized = JSON.stringify(state);
      await AsyncStorage.setItem(ORGANIZATION_LOCAL_STORAGE_KEY, serialized);
    } catch (error) {
      throw new Error(`No se pudo guardar en AsyncStorage: ${error}`);
    }
  },

  async load() {
    const raw = await AsyncStorage.getItem(ORGANIZATION_LOCAL_STORAGE_KEY);

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  },

  async clear() {
    await AsyncStorage.removeItem(ORGANIZATION_LOCAL_STORAGE_KEY);
  },
};
