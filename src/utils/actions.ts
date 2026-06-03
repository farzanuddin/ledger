import { Alert } from "react-native";
import { getErrorMessage } from "./errors";

export async function handleAction<T>(
  fn: () => Promise<T>,
  errorTitle: string,
): Promise<T | false> {
  try {
    return await fn();
  } catch (error) {
    Alert.alert(errorTitle, getErrorMessage(error));
    return false;
  }
}
