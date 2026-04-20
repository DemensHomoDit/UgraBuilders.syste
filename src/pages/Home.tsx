
import React from 'react';
import Index from './Index';

/**
 * Компонент Home перенаправляет на Index для обеспечения 
 * обратной совместимости со старыми маршрутами
 */
const Home = () => {
  return <Index />;
};

export default Home;
