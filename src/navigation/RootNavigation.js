// src/navigation/RootNavigation.js

import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  console.log( params, '---------------------- params ---------------------');
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
