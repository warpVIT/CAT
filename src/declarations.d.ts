// Этот файл позволяет TypeScript понимать нестандартные импорты
declare module '*.jsx' {
    import React from 'react';
    const component: React.ComponentType<any>;
    export default component;
  }
  
  // Если у вас есть файлы CSS модулей
  declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
  }
  
  // Если у вас есть изображения
  declare module '*.png';
  declare module '*.jpg';
  declare module '*.svg' {
    import React from 'react';
    export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
    const src: string;
    export default src;
  }