/**
 * Копирует переданный текст в буфер обмена.
 * Использует современный Clipboard API, если он доступен (в безопасных контекстах).
 * В противном случае использует устаревший метод document.execCommand.
 * @param text - Текст для копирования.
 * @returns Promise<boolean> - true в случае успеха, false в случае ошибки.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Попытка использовать современный Navigator Clipboard API
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Не удалось скопировать через Clipboard API:', err);
      // Если современный метод не сработал, пробуем старый
    }
  }

  // Fallback для старых браузеров или небезопасных контекстов (http)
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  // Делаем элемент невидимым
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Не удалось скопировать через execCommand:', err);
    document.body.removeChild(textArea);
    return false;
  }
}