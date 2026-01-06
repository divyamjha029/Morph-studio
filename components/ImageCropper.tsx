
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  isDark?: boolean;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel, isDark = false }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(1); 
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (crop: any) => setCrop(crop);
  const onZoomChange = (zoom: number) => setZoom(zoom);

  const onCropCompleteInternal = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/png');
  };

  const handleConfirm = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const aspectPresets = [
    { label: 'Square', value: 1 },
    { label: 'Portrait', value: 3/4 },
    { label: 'Tall', value: 9/16 },
    { label: 'Wide', value: 16/9 },
    { label: 'Full', value: undefined }
  ];

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center p-8 fade-in transition-colors duration-700 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'}`}>
      <div className={`relative w-full max-w-5xl h-[55vh] border mb-6 shadow-2xl overflow-hidden transition-colors duration-500 rounded-3xl ${isDark ? 'bg-[#111] border-white/5' : 'bg-white border-black'}`}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={onZoomChange}
          classes={{
            containerClassName: "custom-cropper-container",
            mediaClassName: "custom-cropper-media",
            cropAreaClassName: isDark ? "custom-cropper-area-dark" : "custom-cropper-area"
          }}
        />
      </div>
      
      <div className="w-full max-w-xl flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <span className={`text-[9px] tracking-[0.4em] uppercase font-bold opacity-60 ${isDark ? 'text-white' : 'text-black'}`}>Aspect Ratio</span>
          <div className="flex justify-between items-center gap-2">
            {aspectPresets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setAspect(preset.value)}
                className={`flex-1 py-2 text-[10px] tracking-widest uppercase transition-all duration-300 border rounded-full ${
                  aspect === preset.value 
                    ? (isDark ? 'border-white text-white font-bold bg-white/5' : 'border-black bg-black text-white font-bold shadow-sm') 
                    : (isDark ? 'border-white/5 text-white/20 hover:text-white/40' : 'border-black/30 text-black/50 hover:text-black hover:border-black')
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className={`text-[9px] tracking-[0.4em] uppercase font-bold opacity-60 ${isDark ? 'text-white' : 'text-black'}`}>Scaling</span>
            <span className={`text-[9px] font-mono opacity-60 tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>{Math.round(zoom * 100)}%</span>
          </div>
          <input
            type="range"
            value={zoom}
            min={1}
            max={4}
            step={0.01}
            aria-labelledby="Zoom"
            onChange={(e: any) => setZoom(parseFloat(e.target.value))}
            className={`w-full h-[1px] appearance-none cursor-pointer transition-colors ${isDark ? 'accent-white bg-white/5 hover:bg-white/10' : 'accent-black bg-black/20 hover:bg-black'}`}
          />
        </div>
        
        <div className="flex gap-4 mt-2">
          <button
            onClick={onCancel}
            className={`flex-1 py-4 border-2 rounded-full text-[10px] tracking-[0.4em] font-bold uppercase transition-all duration-500 ${isDark ? 'border-white/5 text-white/20 hover:text-white hover:border-white/20' : 'border-black/30 text-black/50 hover:text-black hover:border-black'}`}
          >
            Discard
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-4 rounded-full text-[10px] tracking-[0.4em] font-bold uppercase transition-all duration-700 shadow-2xl ${isDark ? 'bg-white text-black hover:tracking-[0.5em]' : 'bg-black text-white hover:tracking-[0.5em]'}`}
          >
            Confirm Selection
          </button>
        </div>
      </div>

      <style>{`
        .custom-cropper-area {
          border: 2px solid rgba(0,0,0,0.5) !important;
          box-shadow: 0 0 0 9999px rgba(255,255,255,0.85) !important;
          border-radius: 20px !important;
        }
        .custom-cropper-area-dark {
          border: 1px solid rgba(255,255,255,0.1) !important;
          box-shadow: 0 0 0 9999px rgba(0,0,0,0.8) !important;
          border-radius: 20px !important;
        }
      `}</style>
    </div>
  );
};

export default ImageCropper;
