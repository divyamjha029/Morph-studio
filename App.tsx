
import React, { useState, useRef, useEffect } from 'react';
import MinimalFrame from './components/MinimalFrame';
import ImageCropper from './components/ImageCropper';
import { MorphState, MorphStatus, ClothingCategory } from './types';
import { processOutfitSwap } from './services/geminiService';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [state, setState] = useState<MorphState>({
    baseImage: null,
    clothingImage: null,
    rawClothingImage: null,
    prompt: "Modern tailored aesthetic",
    category: ClothingCategory.FULL,
    resultImage: null,
    isProcessing: false,
    status: MorphStatus.IDLE,
    error: null,
  });

  const [tempCropImage, setTempCropImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const clothInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (type: 'base' | 'clothing') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'clothing') {
          setState(prev => ({ ...prev, rawClothingImage: result }));
          setTempCropImage(result);
        } else {
          setState(prev => ({
            ...prev,
            baseImage: result,
            status: MorphStatus.UPLOADING,
            error: null
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setState(prev => ({
      ...prev,
      clothingImage: croppedImage,
      status: MorphStatus.UPLOADING,
      error: null
    }));
    setTempCropImage(null);
  };

  const startSynthesis = async () => {
    if (!state.baseImage) {
      setState(prev => ({ ...prev, error: "Please upload a subject image." }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isProcessing: true, 
      status: MorphStatus.PROCESSING,
      error: null 
    }));

    try {
      const result = await processOutfitSwap(
        state.baseImage,
        state.clothingImage,
        state.prompt,
        state.category
      );
      setState(prev => ({
        ...prev,
        resultImage: result,
        isProcessing: false,
        status: MorphStatus.COMPLETED
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        status: MorphStatus.FAILED,
        error: "Synthesis failed. Please ensure images are clear."
      }));
    }
  };

  const resetState = () => {
    setState({
      baseImage: null,
      clothingImage: null,
      rawClothingImage: null,
      prompt: "Modern tailored aesthetic",
      category: ClothingCategory.FULL,
      resultImage: null,
      isProcessing: false,
      status: MorphStatus.IDLE,
      error: null,
    });
  };

  const toggleTheme = () => setIsDark(!isDark);

  const setCategory = (category: ClothingCategory) => {
    setState(prev => ({ ...prev, category }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-700 ease-in-out ${isDark ? 'bg-[#0a0a0a] text-white/80' : 'bg-[#fafafa] text-black'}`}>
      
      {/* CROPPER OVERLAY */}
      {tempCropImage && (
        <ImageCropper 
          image={tempCropImage} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setTempCropImage(null)}
          isDark={isDark}
        />
      )}

      {/* STARK HEADER - Black in both modes for maximum clarity as requested */}
      <header className={`w-full py-8 mb-16 transition-colors duration-500 border-b ${isDark ? 'bg-[#0d0d0d] border-white/5' : 'bg-black border-black shadow-lg'}`}>
        <div className="max-w-6xl mx-auto px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-1 text-white">
              MORPH <span className="font-thin italic opacity-40">STUDIO</span>
            </h1>
            <p className="text-[9px] tracking-[0.4em] uppercase opacity-40 text-white">Neural Fabric Synthesis // GDG TechSprint</p>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className={`text-[9px] tracking-[0.4em] uppercase font-bold px-5 py-2 border rounded-full transition-all duration-300 border-white/20 text-white/60 hover:text-white hover:bg-white/5`}
            >
              {isDark ? 'Light' : 'Dark'} Mode
            </button>
            <div className="hidden md:block text-[9px] tracking-widest uppercase font-semibold opacity-20 text-white">
              STABLE_BUILD_v3.1.0
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 pb-32 flex flex-col font-light selection:bg-gray-500 selection:text-white">
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* CONFIGURATION SIDE */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-8">
              <MinimalFrame label="01. Identity Source" isDark={isDark}>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative aspect-square w-full border rounded-2xl cursor-pointer overflow-hidden transition-all duration-700 ease-in-out ${isDark ? 'bg-[#121212] border-white/5 hover:border-white/10' : 'bg-white border-black hover:border-black/80'}`}
                >
                  {state.baseImage ? (
                    <img src={state.baseImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Subject" />
                  ) : (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity ${isDark ? 'opacity-20 group-hover:opacity-40' : 'opacity-60 group-hover:opacity-80'}`}>
                      <div className={`w-8 h-8 flex items-center justify-center border rounded-full mb-4 ${isDark ? 'border-white' : 'border-black'}`}>
                        <span className="text-xl font-thin">+</span>
                      </div>
                      <span className="text-[10px] tracking-widest uppercase font-bold">Select Subject</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload('base')} />
                </div>
              </MinimalFrame>

              <div className="space-y-4">
                <span className={`text-[9px] font-bold tracking-[0.3em] uppercase opacity-40 ${isDark ? 'text-white' : 'text-black'}`}>02. Target Category</span>
                <div className="flex gap-2">
                  {[
                    { id: ClothingCategory.TOP, label: 'Top' },
                    { id: ClothingCategory.BOTTOM, label: 'Bottom' },
                    { id: ClothingCategory.FULL, label: 'Full' },
                    { id: ClothingCategory.SHOES, label: 'Shoes' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex-1 py-2 text-[9px] tracking-widest uppercase border rounded-full transition-all duration-300 ${
                        state.category === cat.id 
                          ? (isDark ? 'border-white text-white bg-white/5' : 'border-black bg-black text-white font-bold')
                          : (isDark ? 'border-white/5 text-white/20 hover:text-white/40' : 'border-black/30 text-black/50 hover:text-black hover:border-black')
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <MinimalFrame label="03. Garment Texture" isDark={isDark}>
                <div className="space-y-4">
                  <div className={`group relative h-48 w-full border rounded-2xl overflow-hidden transition-all duration-700 ease-in-out ${isDark ? 'bg-[#121212] border-white/5 hover:border-white/10' : 'bg-white border-black hover:border-black/80'}`}>
                    {state.clothingImage ? (
                      <>
                        <img src={state.clothingImage} className="w-full h-full object-cover" alt="Outfit" />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button 
                            onClick={() => setTempCropImage(state.rawClothingImage)}
                            className={`px-3 py-1.5 text-[8px] tracking-widest uppercase font-bold border rounded-full backdrop-blur-md transition-all ${isDark ? 'bg-black/60 border-white/20 text-white/60 hover:text-white' : 'bg-white/80 border-black text-black hover:bg-black hover:text-white'}`}
                          >
                            Recrop
                          </button>
                          <button 
                            onClick={() => clothInputRef.current?.click()}
                            className={`px-3 py-1.5 text-[8px] tracking-widest uppercase font-bold border rounded-full backdrop-blur-md transition-all ${isDark ? 'bg-black/60 border-white/20 text-white/60 hover:text-white' : 'bg-white/80 border-black text-black hover:bg-black hover:text-white'}`}
                          >
                            New
                          </button>
                        </div>
                      </>
                    ) : (
                      <div 
                        onClick={() => clothInputRef.current?.click()}
                        className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer transition-opacity text-center px-4 ${isDark ? 'opacity-20 group-hover:opacity-40' : 'opacity-60 group-hover:opacity-80'}`}
                      >
                        <span className="text-[10px] tracking-widest uppercase font-bold">Extract Fabric<br/><span className="opacity-40 lowercase italic font-normal">(Free cropping)</span></span>
                      </div>
                    )}
                    <input type="file" ref={clothInputRef} className="hidden" accept="image/*" onChange={handleFileUpload('clothing')} />
                  </div>
                  <div className="pt-2">
                    <input 
                      type="text"
                      className={`w-full bg-transparent text-sm border-b py-3 focus:outline-none transition-all duration-500 font-medium ${isDark ? 'border-white/5 focus:border-white/30 text-white placeholder:opacity-20' : 'border-black/30 focus:border-black text-black placeholder:text-black/30'}`}
                      value={state.prompt}
                      onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="Refine style (e.g. oversized fit)..."
                    />
                  </div>
                </div>
              </MinimalFrame>
              
              <div className="flex items-center gap-3 py-2 px-1 opacity-80">
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]' : 'bg-green-600'}`}></div>
                <span className={`text-[8px] tracking-[0.3em] font-bold uppercase italic ${isDark ? 'text-white' : 'text-black'}`}>Anatomical Stability Engine Active</span>
              </div>
            </div>

            <button 
              onClick={startSynthesis}
              disabled={state.isProcessing || !state.baseImage}
              className={`w-full py-5 rounded-2xl text-[10px] tracking-[0.5em] font-bold uppercase transition-all duration-700 ease-in-out ${
                state.isProcessing 
                ? (isDark ? 'bg-white/5 text-white/10' : 'bg-black/5 text-black/20') + ' cursor-not-allowed border-0'
                : (isDark ? 'bg-white text-black hover:bg-white/90 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.05)]' : 'bg-black text-white hover:bg-black/90 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)]')
              }`}
            >
              {state.isProcessing ? 'SYNTHESIZING...' : 'EXECUTE TRANSLATION'}
            </button>
            
            {state.error && <p className="text-[10px] text-center uppercase tracking-widest text-red-500 font-bold fade-in">{state.error}</p>}
          </div>

          {/* OUTPUT SIDE */}
          <div className="lg:col-span-7 h-full">
            <div className="sticky top-16 h-full min-h-[500px] lg:min-h-[700px]">
              <MinimalFrame label="Synthesis Result" className="h-full flex flex-col relative overflow-hidden shadow-sm" isDark={isDark}>
                <div className={`flex-1 flex items-center justify-center border relative overflow-hidden min-h-[400px] rounded-xl ${isDark ? 'bg-[#0f0f0f] border-white/5' : 'bg-[#f5f5f5] border-black/20'}`}>
                  {state.isProcessing ? (
                    <div className="flex flex-col items-center gap-8">
                      <div className={`relative w-48 h-[1px] rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                        <div className={`absolute inset-0 animate-[smooth-load_2.5s_infinite_ease-in-out] ${isDark ? 'bg-white/60' : 'bg-black/80'}`}></div>
                      </div>
                      <span className={`text-[9px] tracking-[0.5em] font-bold uppercase animate-pulse ${isDark ? 'opacity-30' : 'opacity-80'}`}>Mapping Molecular Patterns</span>
                    </div>
                  ) : state.resultImage ? (
                    <div className="w-full h-full flex items-center justify-center fade-in p-6">
                      <img 
                        src={state.resultImage} 
                        className={`max-w-full max-h-full object-contain rounded-lg transition-all duration-1000 ease-out scale-100 hover:scale-[1.02] ${isDark ? 'shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]' : 'shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]'}`} 
                        alt="Synthesized result" 
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center opacity-20 grayscale">
                      <div className={`w-20 h-20 border-2 rounded-full flex items-center justify-center mb-6 ${isDark ? 'border-white' : 'border-black'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}></div>
                      </div>
                      <span className="text-[10px] tracking-[0.6em] uppercase font-bold">Void</span>
                    </div>
                  )}
                </div>

                <style>{`
                  @keyframes smooth-load {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                  }
                `}</style>

                {state.resultImage && !state.isProcessing && (
                  <div className="mt-10 flex gap-6 fade-in">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = state.resultImage!;
                        link.download = `morph_asset_${Date.now()}.png`;
                        link.click();
                      }}
                      className={`flex-1 py-4 border-2 rounded-full text-[10px] tracking-widest font-bold uppercase transition-all duration-500 ease-in-out ${isDark ? 'border-white/10 text-white/60 hover:bg-white hover:text-black' : 'border-black text-black hover:bg-black hover:text-white shadow-md'}`}
                    >
                      Export Artifact
                    </button>
                    <button 
                      onClick={resetState}
                      className={`flex-1 py-4 border-2 rounded-full text-[10px] tracking-widest font-bold uppercase transition-all duration-500 ease-in-out ${isDark ? 'border-white/5 text-white/20 hover:border-white/20 hover:text-white' : 'border-black/20 text-black/40 hover:border-black hover:text-black'}`}
                    >
                      Reset
                    </button>
                  </div>
                )}
              </MinimalFrame>
            </div>
          </div>
        </main>

        <footer className={`mt-32 pt-16 border-t-2 flex flex-col md:flex-row justify-between items-center text-[9px] tracking-[0.4em] uppercase font-bold opacity-40 gap-8 ${isDark ? 'border-white/5' : 'border-black'}`}>
          <div className="flex gap-12">
            <span>Neural Engine v3.1</span>
            <span>Zero-Anatomy Distortion</span>
          </div>
          <div className="text-right">
            © {new Date().getFullYear()} MORPH_SYSTEMS_GLOBAL
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
