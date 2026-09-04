import { useState, useRef } from 'react';

/**
 * 3D Mouse-Follow Tilt Hover Effect Component
 * - Tilts card in 3D space following mouse position
 * - Does NOT move card from its current position
 * - Smoothly resets tilt and glow on mouse leave
 */
export default function Tilt3DCard({ children, className = '', style = {}, onClick }) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glow, setShadow]        = useState('0 4px 20px rgba(0,0,0,0.2)');

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = -((y - centerY) / centerY) * 10; // Max 10deg rotateX
    const rotateY = ((x - centerX) / centerX) * 10;  // Max 10deg rotateY

    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`);
    setShadow(`${-rotateY * 1.2}px ${rotateX * 1.2}px 25px rgba(139, 92, 246, 0.25)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    setShadow('0 4px 20px rgba(0,0,0,0.2)');
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative cursor-pointer transition-transform duration-200 ease-out ${className}`}
      style={{
        ...style,
        transform,
        boxShadow: glow,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
