
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-20'
  };

  return (
    <img 
      src="/lovable-uploads/4bd889fc-8ffe-47aa-b676-1c905f09b991.png" 
      alt="CritiScan ABGS Logo" 
      className={`${sizeClasses[size]} ${className || ''}`}
    />
  );
};

export default Logo;
