import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon, Sparkles, Heart } from 'lucide-react';
import { GalleryPhoto, FloralTheme } from '../types';
import { WatercolorDivider, WatercolorCorner } from './WatercolorFlorals';
import { BotanicalRoseHeaderOrnament, BotanicalRoseFrameCorner } from './BotanicalRoseDecorations';

interface PhotoGalleryProps {
  photos: GalleryPhoto[];
  theme: FloralTheme;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, theme }) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const handleOpenLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPhotoIndex !== null) {
      setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
    }
  };

  return (
    <section id="gallery" className="relative py-16 px-4 sm:px-6 bg-[#FAF7F2]/90 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Section Header with reveal on scroll */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <span className="text-xs font-sans-body uppercase tracking-[0.25em] text-[#43657D] font-semibold">
            Captured Moments
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2E2420] mt-1">
            Our Gallery & Memories
          </h2>
          <BotanicalRoseHeaderOrnament theme={theme} className="my-2" />
          <p className="font-sans-body text-xs sm:text-sm text-[#5D6F7C] max-w-md mx-auto italic">
            "A photograph is the pause button of life, capturing fleeting moments of love forever."
          </p>
        </motion.div>

        {/* Gallery Grid with Ornate Picture Frames */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {(photos || []).map((photo, idx) => (
            <motion.div
              key={photo.id || idx}
              initial={{ opacity: 0, y: 35, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, delay: (idx % 6) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => handleOpenLightbox(idx)}
              className={`relative overflow-hidden rounded-2xl group cursor-pointer border-2 border-white shadow-md hover:shadow-xl bg-gradient-to-b from-[#DFC186]/30 via-white to-[#B69A5E]/20 p-2 sm:p-2.5 transition-all duration-300 ring-1 ring-[#DFC186]/60 hover:ring-[#DFC186] ${
                photo.featured ? 'col-span-2 row-span-2 aspect-4/3' : 'aspect-square'
              }`}
            >
              {/* Inner Picture Matting and Canvas */}
              <div className="w-full h-full relative overflow-hidden rounded-xl bg-[#F0F5F8] border border-[#DFC186]/50">
                <img
                  src={photo.url}
                  alt={photo.caption || `Wedding Photo ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />

                {/* Decorative Miniature Filigree Corner Accents */}
                <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#DFC186]/90 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#DFC186]/90 rounded-tr-sm pointer-events-none" />
                <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#DFC186]/90 rounded-bl-sm pointer-events-none" />
                <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#DFC186]/90 rounded-br-sm pointer-events-none" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-[#2C3E50]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs text-[10px] uppercase tracking-wider text-[#DFC186]">
                      <Sparkles className="w-3 h-3 text-[#DFC186]" />
                      <span>View</span>
                    </span>
                    <span className="p-2 rounded-full bg-black/40 backdrop-blur-xs text-[#DFC186]">
                      <Maximize2 className="w-4 h-4" />
                    </span>
                  </div>
                  {photo.caption && (
                    <div className="bg-black/30 backdrop-blur-xs p-2.5 rounded-lg border border-white/20">
                      <p className="text-xs sm:text-sm font-serif-display italic line-clamp-2 drop-shadow-sm text-white">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseLightbox}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            {/* Close Button */}
            <button
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={handlePrevPhoto}
              className="absolute left-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNextPhoto}
              className="absolute right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Lightbox Image Card */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-4xl max-h-[85vh] flex flex-col items-center"
            >
              <img
                src={photos[selectedPhotoIndex]?.url}
                alt="Enlarged gallery view"
                referrerPolicy="no-referrer"
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl border border-white/20"
              />
              {photos[selectedPhotoIndex]?.caption && (
                <p className="text-white text-sm sm:text-base font-serif-display italic mt-3 text-center px-4">
                  {photos[selectedPhotoIndex]?.caption}
                </p>
              )}
              <span className="text-white/60 text-xs mt-1 font-sans-body">
                {selectedPhotoIndex + 1} of {photos.length}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
