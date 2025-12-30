import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface DrawingPadProps {
  disabled: boolean;
  strokeColor?: string;
  showHint?: boolean;
  highlightBackground?: boolean; // New prop for persistent background color
  hintText?: string;
  tool: 'pen' | 'eraser';
}

export interface DrawingPadRef {
  clear: () => void;
  getImageData: () => string | null;
  isEmpty: () => boolean;
}

const DrawingPad = forwardRef<DrawingPadRef, DrawingPadProps>(({ 
  disabled, 
  strokeColor = '#2563EB',
  showHint = false,
  highlightBackground = false,
  hintText = '',
  tool
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Ensure we are in normal drawing mode to clear properly
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath(); // Reset any existing paths

      // Robust clear: Reset transform to ensure we clear the full physical canvas
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      
      setHasDrawn(false);
    },
    getImageData: () => {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return null;
      
      // Composite over white background to handle transparency (eraser) correctly
      // This prevents "erased" transparent areas from being interpreted as black by the AI/JPEG conversion
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return null;

      // 1. Fill with white
      tempCtx.fillStyle = '#FFFFFF';
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // 2. Draw the actual drawing on top
      tempCtx.drawImage(canvas, 0, 0);
      
      // 3. Export as JPEG (which drops alpha, preserving the white background)
      return tempCanvas.toDataURL('image/jpeg', 0.9);
    },
    isEmpty: () => !hasDrawn
  }));

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    setHasDrawn(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ensure line properties are set every time we start
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Configure tool
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 40; // Eraser is bigger
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 8;
      ctx.strokeStyle = strokeColor;
    }

    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.closePath();
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Setup Canvas Resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      // Only update if dimensions actually changed to avoid clearing on mobile browser chrome show/hide
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          }
      }
    };

    setCanvasSize();
    const resizeObserver = new ResizeObserver(() => setCanvasSize());
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, []);

  // Use highlightBackground for bg color logic instead of showHint
  return (
    <div className={`w-full h-full relative touch-none rounded-2xl shadow-inner border-4 border-dashed overflow-hidden transition-colors duration-300 ${highlightBackground ? 'bg-indigo-50' : 'bg-white'} ${tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'} ${disabled ? 'border-gray-200' : 'border-indigo-200'}`}>
        {/* Background lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ 
               backgroundImage: 'linear-gradient(#000 1px, transparent 1px)', 
               backgroundSize: '100% 3rem',
               marginTop: '2rem',
               zIndex: 0
             }}>
        </div>

        {/* Optional Hint Text */}
        {showHint && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0 select-none">
              <span className="text-9xl font-sans font-black text-gray-500">{hintText}</span>
           </div>
        )}
        
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none relative z-10"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
});

DrawingPad.displayName = 'DrawingPad';

export default DrawingPad;