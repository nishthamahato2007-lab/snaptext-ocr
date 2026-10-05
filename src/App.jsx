import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Upload, Copy, Check, RefreshCw, FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0] || e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setExtractedText('');
      setErrorMessage('');
    }
  };

  const scanImage = async () => {
    if (!image) return;
    setLoading(true);
    setErrorMessage('');
    setStatusText('Warming up...');

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status) {
            setStatusText(`${m.status} (${Math.round(m.progress * 100)}%)`);
          }
        },
      });
      
      setStatusText('Reading image...');
      const ret = await worker.recognize(image);
      
      setExtractedText(ret.data.text || 'No text found in this image.');
      await worker.terminate();
    } catch (error) {
      console.error("OCR Error Details:", error);
      setErrorMessage(error.message || 'Failed to process image. Please try another picture.');
    } finally {
      setLoading(false);
      setStatusText('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetApp = () => {
    setImage(null);
    setImagePreview('');
    setExtractedText('');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#5C5346] flex flex-col items-center py-12 px-4 selection:bg-[#E3C5B9] selection:text-[#3D342B]">
      
      {/* Header */}
      <div className="text-center mb-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3EFEA] text-[#8C7A6B] text-xs font-medium mb-3 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" /> Browser-Powered OCR
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif tracking-tight text-[#3D342B]">
          SnapText
        </h1>
        <p className="text-[#8C7A6B] mt-2 text-sm sm:text-base font-light">
          Transform your images into editable words with a soft touch.
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Upload & Preview */}
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div>
            <h2 className="text-base font-medium mb-4 flex items-center gap-2 text-[#4A4033]">
              <Upload className="w-4 h-4 text-[#D4A373]" /> Upload Image
            </h2>

            {!imagePreview ? (
              <label 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleImageUpload(e); }}
                className="border-2 border-dashed border-[#E5E0D8] hover:border-[#D4A373] transition-all rounded-2xl h-64 flex flex-col items-center justify-center cursor-pointer bg-[#FAFAF8] group"
              >
                <div className="w-12 h-12 rounded-full bg-[#F3EFEA] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5 text-[#8C7A6B]" />
                </div>
                <p className="text-sm font-medium text-[#5C5346]">Click or drag image here</p>
                <p className="text-xs text-[#A89887] mt-1">PNG, JPG, or WEBP</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            ) : (
              <div className="relative h-64 rounded-2xl overflow-hidden border border-[#EFECE6] bg-[#F3EFEA] flex items-center justify-center">
                <img src={imagePreview} alt="Preview" className="max-h-full object-contain" />
                <button 
                  onClick={resetApp}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-[#E3C5B9] text-[#5C5346] p-2 rounded-full transition shadow-sm cursor-pointer"
                  title="Remove image"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 bg-[#FDF0EE] border border-[#FADCD8] rounded-xl flex items-start gap-2 text-[#A75D5D] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={scanImage}
            disabled={!image || loading}
            className={`mt-6 w-full py-3.5 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
              !image || loading 
                ? 'bg-[#F3EFEA] text-[#B5A89B] cursor-not-allowed' 
                : 'bg-[#D4A373] hover:bg-[#C29262] text-white shadow-[#D4A373]/20 cursor-pointer hover:shadow-md'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {statusText}
              </>
            ) : (
              'Extract Text'
            )}
          </button>
        </div>

        {/* Right Column: Output Result */}
        <div className="bg-white border border-[#EFECE6] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-medium flex items-center gap-2 text-[#4A4033]">
                <FileText className="w-4 h-4 text-[#A3B18A]" /> Result
              </h2>
              {extractedText && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 text-xs bg-[#F3EFEA] hover:bg-[#E9E3DD] text-[#5C5346] px-3 py-1.5 rounded-xl transition cursor-pointer font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#588157]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            <textarea
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Your extracted words will blossom here..."
              className="w-full h-64 bg-[#FAFAF8] border border-[#EFECE6] rounded-2xl p-4 text-sm text-[#4A4033] resize-none focus:outline-none focus:border-[#D4A373] transition font-sans leading-relaxed"
            />
          </div>

          <div className="mt-6 flex items-center justify-between text-xs text-[#A89887] border-t border-[#F3EFEA] pt-4 font-light">
            <span>Characters: {extractedText.length}</span>
            <span>Words: {extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0}</span>
          </div>
        </div>

      </div>
    </div>
  );
}