
/**
 * Форматирует площадь для отображения
 * @param areaValue Значение площади
 * @returns Отформатированная строка с площадью
 */
export const formatArea = (areaValue: number | null | undefined): string => {
  if (areaValue === null || areaValue === undefined || isNaN(Number(areaValue))) {
    return "Площадь не указана";
  }
  
  const area = Number(areaValue);
  
  return `${area} м²`;
};

/**
 * Форматирует цену для отображения
 * @param priceValue Значение цены
 * @returns Отформатированная строка с ценой
 */
export const formatPrice = (priceValue: number | null | undefined): string => {
  if (priceValue === null || priceValue === undefined || isNaN(Number(priceValue))) {
    return "Цена по запросу";
  }
  
  const price = Number(priceValue);

  // Если цена больше или равна 1 000 000, отображаем в миллионах
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} млн ₽`;
  }
  
  // Для цен меньше 1 млн, форматируем с разделителем тысяч
  return `${price.toLocaleString('ru-RU')} ₽`;
};

/**
 * Преобразует строковое представление цены в числовое значение
 * @param priceString Строка с ценой (например, "4.5 млн ₽")
 * @returns Числовое значение цены
 */
export const parsePriceString = (priceString: string): number | null => {
  if (!priceString || priceString === "Цена по запросу") {
    return null;
  }
  
  // Удаляем все нечисловые символы, кроме десятичной точки
  const cleanedString = priceString.replace(/[^\d.]/g, '');
  
  // Проверяем, содержит ли строка "млн"
  if (priceString.includes("млн")) {
    // Умножаем на миллион
    return parseFloat(cleanedString) * 1000000;
  }
  
  // Иначе просто преобразуем строку в число
  return parseFloat(cleanedString);
};
