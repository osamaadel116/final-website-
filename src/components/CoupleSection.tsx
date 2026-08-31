import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { CoupleDetails, FloralTheme } from '../types';
import { WatercolorCorner, WatercolorDivider } from './WatercolorFlorals';
import { BotanicalRoseHeaderOrnament, BotanicalRoseFrameCorner } from './BotanicalRoseDecorations';

interface CoupleSectionProps {
  couple: CoupleDetails;
  theme: FloralTheme;
}

export const CoupleSection: React.FC<CoupleSectionProps> = ({ couple, theme }) => {
  return (
    <section id="couple" className="relative py-16 px-4 sm:px-6 bg-[#FAF7F2]/60 overflow-hidden">
      {/* Decorative Floral Accents */}
      <WatercolorCorner
        tone={theme.floralTone}
        position="top-left"
        className="absolute top-0 left-0 w-32 sm:w-44 h-32 sm:h-44 opacity-75"
      />
      <WatercolorCorner
        tone={theme.floralTone}
        position="top-right"
        className="absolute top-0 right-0 w-32 sm:w-44 h-32 sm:h-44 opacity-75"
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Section Header */}
        <div className="mb-8">
          <span className="text-xs font-sans-body uppercase tracking-[0.25em] text-[#43657D] font-semibold">
            The Beloved Couple
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2E2420] mt-1">
            Groom & Bride
          </h2>
          <BotanicalRoseHeaderOrnament theme={theme} className="my-2" />
          <p className="font-sans-body text-xs sm:text-sm text-[#5D6F7C] max-w-md mx-auto italic">
            "Two souls with but a single thought, two hearts that beat as one."
          </p>
        </div>

        {/* Groom & Bride Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center relative">
          
          {/* THE GROOM CARD */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-[#FCFAF6] border border-[#DFC186]/60 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Arch Groom Photo with Ornate Golden and Rose Frame */}
            <div className="relative mb-4 group">
              <BotanicalRoseFrameCorner
                theme={theme}
                variant="top-left"
                className="absolute -top-3 -left-3 w-12 h-12 z-20"
              />
              <BotanicalRoseFrameCorner
                theme={theme}
                variant="top-right"
                className="absolute -top-3 -right-3 w-12 h-12 z-20"
              />
              <div className="w-36 h-48 sm:w-44 sm:h-56 rounded-t-full rounded-b-2xl overflow-hidden border-2 border-[#DFC186] p-1 bg-gradient-to-b from-[#DFC186]/40 to-white shadow-md">
                <img
                  src={couple.groom.photoUrl}
                  alt={couple.groom.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-t-full rounded-b-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <span className="text-[11px] font-sans-body uppercase tracking-[0.2em] font-semibold text-[#43657D] bg-[#E9F1F6] px-3 py-1 rounded-full border border-[#8CAEC7]/50 mb-2">
              The Groom
            </span>

            <h3 className="font-serif-display text-2xl font-bold text-[#2E2420]">
              {couple.groom.name}
            </h3>
            <p className="text-xs font-serif-display text-[#5D6F7C] italic mb-3">
              {couple.groom.fullNameWithTitle}
            </p>

            <p className="text-xs font-sans-body text-[#63554B] leading-relaxed mb-4 max-w-xs">
              {couple.groom.bio}
            </p>

            <div className="w-full pt-3 border-t border-[#EAE1D3] text-xs text-[#7A6A5E] font-serif-display">
              <p className="font-semibold text-[#4A3D35]">Son of:</p>
              <p>{couple.groom.fatherName}</p>
              <p>& {couple.groom.motherName}</p>
            </div>
          </motion.div>

          {/* Center Heart Emblem Connector */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#FAF7F2] border-2 border-[#DFC186] shadow-lg items-center justify-center text-[#43657D]">
            <Heart className="w-6 h-6 fill-[#DFC186] text-[#43657D] animate-pulse" />
          </div>

          {/* THE BRIDE CARD */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="bg-[#FCFAF6] border border-[#DFC186]/60 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col items-center text-center relative overflow-hidden"
          >
            {/* Arch Bride Photo with Ornate Golden and Rose Frame */}
            <div className="relative mb-4 group">
              <BotanicalRoseFrameCorner
                theme={theme}
                variant="top-left"
                className="absolute -top-3 -left-3 w-12 h-12 z-20"
              />
              <BotanicalRoseFrameCorner
                theme={theme}
                variant="top-right"
                className="absolute -top-3 -right-3 w-12 h-12 z-20"
              />
              <div className="w-36 h-48 sm:w-44 sm:h-56 rounded-t-full rounded-b-2xl overflow-hidden border-2 border-[#DFC186] p-1 bg-gradient-to-b from-[#DFC186]/40 to-white shadow-md">
                <img
                  src={couple.bride.photoUrl}
                  alt={couple.bride.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-t-full rounded-b-xl group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            <span className="text-[11px] font-sans-body uppercase tracking-[0.2em] font-semibold text-[#43657D] bg-[#E9F1F6] px-3 py-1 rounded-full border border-[#8CAEC7]/50 mb-2">
              The Bride
            </span>

            <h3 className="font-serif-display text-2xl font-bold text-[#2E2420]">
              {couple.bride.name}
            </h3>
            <p className="text-xs font-serif-display text-[#5D6F7C] italic mb-3">
              {couple.bride.fullNameWithTitle}
            </p>

            <p className="text-xs font-sans-body text-[#63554B] leading-relaxed mb-4 max-w-xs">
              {couple.bride.bio}
            </p>

            <div className="w-full pt-3 border-t border-[#EAE1D3] text-xs text-[#7A6A5E] font-serif-display">
              <p className="font-semibold text-[#4A3D35]">Daughter of:</p>
              <p>{couple.bride.fatherName}</p>
              <p>& {couple.bride.motherName}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
