import { useState, useEffect } from 'react';

/**
 * Хук для создания отложенного значения
 * Полезен для предотвращения частых обновлений, например, при вводе в поисковое поле
 * 
 * @param value Значение, которое нужно отложить
 * @param delay Задержка в миллисекундах
 * @returns Отложенное значение
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Создаем таймер, который обновит значение после указанной задержки
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймер при изменении значения или размонтировании компонента
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
} 