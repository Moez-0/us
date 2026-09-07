import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { X, Upload, Calendar, Sparkles } from 'lucide-react';
import { pixelAudio } from '../lib/sound';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMemory: (caption: string, date: string, imagePath: string) => Promise<void>;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  onClose,
  onAddMemory,
}) => {
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    pixelAudio.playBlip();
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() || !previewUrl) return;
    setIsSubmitting(true);
    pixelAudio.playQuestComplete();
    await onAddMemory(caption.trim(), date, previewUrl);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white dark:bg-[#1A1A2E] border-4 border-black shadow-[6px_6px_0px_#000] p-4 flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-black">
          <div>
            <span className="font-pixel text-[10px] text-[#FF3366] uppercase tracking-wider block">
              &gt; VAULT ENTRY &lt;
            </span>
            <h3 className="font-pixel text-sm text-black dark:text-white mt-0.5">
              RECORD REAL PHOTO
            </h3>
          </div>
          <button
            onClick={() => {
              pixelAudio.playBlip();
              onClose();
            }}
            className="w-7 h-7 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pt-3 space-y-3 font-pixel-ui text-xs">
          {/* Image Upload Area */}
          <div>
            <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
              Select Real Photo
            </label>

            {previewUrl ? (
              <div className="relative border-2 border-black overflow-hidden aspect-4/3 bg-black">
                <img
                  src={previewUrl}
                  alt="Memory preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    pixelAudio.playBlip();
                    setPreviewUrl(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 p-1 border-2 border-black bg-[#FF3366] text-white cursor-pointer shadow-[1px_1px_0px_#000]"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => {
                  pixelAudio.playBlip();
                  fileInputRef.current?.click();
                }}
                className="w-full aspect-4/3 border-2 border-dashed border-black bg-[#FAF8F5] dark:bg-[#121224] flex flex-col items-center justify-center cursor-pointer p-4 text-center hover:bg-[#FFD166]/10"
              >
                <div className="w-10 h-10 border-2 border-black bg-[#FFD166] text-black flex items-center justify-center mb-2 shadow-[2px_2px_0px_#000]">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-pixel text-xs text-black dark:text-white">
                  [CLICK TO UPLOAD / SNAP PHOTO]
                </span>
                <span className="font-pixel-ui text-[10px] text-[#777] mt-1">
                  Supports Camera, JPG, PNG
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div>
            <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
              Memory Date
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
              Memory Log Caption
            </label>
            <textarea
              rows={3}
              placeholder="What made this moment unforgettable?..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              required
              className="w-full p-2.5 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none resize-none shadow-[2px_2px_0px_#000]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                pixelAudio.playBlip();
                onClose();
              }}
              className="px-3 py-2 border-2 border-black bg-gray-200 dark:bg-gray-800 font-pixel text-xs cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !caption.trim() || !previewUrl}
              className="pixel-btn bg-[#06D6A0] text-black font-pixel text-xs px-4 py-2 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              RECORD PHOTO
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
