// frontend/src/cap-native-setup.ts

import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Устанавливает стиль иконок статус-бара.
 * Основная работа по "наложению" теперь выполняется в MainActivity.java.
 */
export async function setupNativeBars() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // Теперь нам нужно только задать стиль иконкам, т.к. фон уже прозрачный
    // благодаря нативному коду.
    // Style.Dark -> темные иконки для светлого фона.
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (e) {
    console.error('Не удалось установить стиль статус-бара.', e);
  }
}