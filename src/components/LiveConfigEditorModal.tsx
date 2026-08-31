import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  X,
  Palette,
  Music,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  Smartphone,
  Monitor,
  Eye,
} from 'lucide-react';
import { WeddingConfig } from '../types';

interface LiveConfigEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WeddingConfig;
  onUpdateConfig: (newConfig: WeddingConfig) => void;
  onResetToDefaults: () => void;
  onReopenInvitation: () => void;
  isMobilePreview: boolean;
  onToggleMobilePreview: () => void;
  showFallingPetals: boolean;
  onToggleFallingPetals: () => void;
}

export const LiveConfigEditorModal: React.FC<LiveConfigEditorModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onResetToDefaults,
  onReopenInvitation,
  isMobilePreview,
  onToggleMobilePreview,
  showFallingPetals,
  onToggleFallingPetals,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'couple' | 'events' | 'music' | 'theme' | 'export'>('general');
  const [copiedCode, setCopiedCode] = useState(false);
  const [customAudioInput, setCustomAudioInput] = useState('');

  const handleUpdate = (updater: (prev: WeddingConfig) => WeddingConfig) => {
    onUpdateConfig(updater(config));
  };

  const handleCopyTS = () => {
    const tsContent = `export const weddingConfig = ${JSON.stringify(config, null, 2)};`;
    navigator.clipboard.writeText(tsContent);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'wedding-config.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleAddCustomTrack = () => {
    if (!customAudioInput.trim()) return;
    const newTrack = {
      id: `custom-${Date.now()}`,
      title: 'Custom Wedding Song',
      artist: 'Custom Music URL',
      audioUrl: customAudioInput.trim(),
    };
    handleUpdate((prev) => ({
      ...prev,
      musicTracks: [newTrack, ...prev.musicTracks],
      defaultTrackIndex: 0,
    }));
    setCustomAudioInput('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-lg h-full bg-[#FAF7F2] border-l border-[#E6DCce] shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8DECf] bg-[#FCFAF6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#F2EADB] text-[#8C6D3B]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-display text-lg font-bold text-[#2E2420]">
                  Wedding Customizer
                </h3>
                <p className="text-[11px] text-[#8C7A6B] font-sans-body">
                  Edit names, dates, music & live theme instantly
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#8C7A6B] hover:bg-[#F2EADB] hover:text-[#2E2420] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick View Controls Bar */}
          <div className="px-4 py-2.5 bg-[#F5EFE6] border-b border-[#E8DECf] flex items-center justify-between text-xs font-sans-body">
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMobilePreview}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                  isMobilePreview
                    ? 'bg-[#3D2B24] text-white border-[#3D2B24]'
                    : 'bg-white text-[#63554B] border-[#DCD0C0]'
                }`}
                title="Toggle Mobile Mockup Frame"
              >
                {isMobilePreview ? <Smartphone className="w-3.5 h-3.5" /> : <Monitor className="w-3.5 h-3.5" />}
                <span>{isMobilePreview ? 'Mobile Frame: ON' : 'Fluid PC View'}</span>
              </button>

              <button
                onClick={onToggleFallingPetals}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors ${
                  showFallingPetals
                    ? 'bg-[#C38D9E] text-white border-[#C38D9E]'
                    : 'bg-white text-[#63554B] border-[#DCD0C0]'
                }`}
                title="Toggle Floating Petals Animation"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{showFallingPetals ? 'Petals: ON' : 'Petals: OFF'}</span>
              </button>
            </div>

            <button
              onClick={onReopenInvitation}
              className="flex items-center gap-1 text-[#8C6D3B] hover:underline font-medium"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Test Envelope</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#E8DECf] bg-[#FAF7F2] overflow-x-auto text-xs font-sans-body">
            {[
              { id: 'theme', label: 'Theme & Colors', icon: Palette },
              { id: 'couple', label: 'Couple Names', icon: Users },
              { id: 'events', label: 'Dates & Venue', icon: Calendar },
              { id: 'music', label: 'Music Songs', icon: Music },
              { id: 'export', label: 'Export Code', icon: Download },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 whitespace-nowrap border-b-2 font-medium transition-colors ${
                    isActive
                      ? 'border-[#C5A059] text-[#2E2420] bg-white'
                      : 'border-transparent text-[#8C7A6B] hover:text-[#2E2420]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 1. THEME SELECTION */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                <p className="text-xs text-[#7A6B60] font-sans-body leading-relaxed">
                  Choose your watercolor floral tone and luxury palette. The entire UI will re-skin dynamically:
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {(config.themes || []).map((theme) => {
                    const isSelected = config.activeThemeId === theme.id;
                    return (
                      <div
                        key={theme.id}
                        onClick={() =>
                          handleUpdate((prev) => ({ ...prev, activeThemeId: theme.id }))
                        }
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-[#C5A059] bg-white shadow-md ring-2 ring-[#C5A059]/20'
                            : 'border-[#E6DCce] bg-white hover:border-[#D4C3B2]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full shadow-inner border border-white flex items-center justify-center text-white"
                            style={{ backgroundColor: theme.primaryColor }}
                          >
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                          <div>
                            <h4 className="font-serif-display font-bold text-sm text-[#2E2420]">
                              {theme.name}
                            </h4>
                            <p className="text-[11px] text-[#8C7A6B] uppercase font-sans-body">
                              Tone: {theme.floralTone}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <span
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: theme.accentColor }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: theme.accentBorder }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. COUPLE NAMES */}
            {activeTab === 'couple' && (
              <div className="space-y-4 text-xs font-sans-body">
                <div className="p-3 bg-white rounded-xl border border-[#E6DCce]">
                  <h4 className="font-serif-display font-bold text-sm text-[#2E2420] mb-2">
                    Groom Info
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[#8C7A6B] mb-0.5">Short / Display Name</label>
                      <input
                        type="text"
                        value={config.couple.groom.shortName}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            couple: {
                              ...prev.couple,
                              groom: { ...prev.couple.groom, shortName: e.target.value, name: e.target.value },
                            },
                          }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8C7A6B] mb-0.5">Full Name with Title</label>
                      <input
                        type="text"
                        value={config.couple.groom.fullNameWithTitle}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            couple: {
                              ...prev.couple,
                              groom: { ...prev.couple.groom, fullNameWithTitle: e.target.value },
                            },
                          }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-[#FAF7F2]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#E6DCce]">
                  <h4 className="font-serif-display font-bold text-sm text-[#2E2420] mb-2">
                    Bride Info
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[#8C7A6B] mb-0.5">Short / Display Name</label>
                      <input
                        type="text"
                        value={config.couple.bride.shortName}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            couple: {
                              ...prev.couple,
                              bride: { ...prev.couple.bride, shortName: e.target.value, name: e.target.value },
                            },
                          }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#8C7A6B] mb-0.5">Full Name with Title</label>
                      <input
                        type="text"
                        value={config.couple.bride.fullNameWithTitle}
                        onChange={(e) =>
                          handleUpdate((prev) => ({
                            ...prev,
                            couple: {
                              ...prev.couple,
                              bride: { ...prev.couple.bride, fullNameWithTitle: e.target.value },
                            },
                          }))
                        }
                        className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-[#FAF7F2]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[#8C7A6B] mb-0.5">Wedding Hashtag</label>
                  <input
                    type="text"
                    value={config.couple.hashtag}
                    onChange={(e) =>
                      handleUpdate((prev) => ({
                        ...prev,
                        couple: { ...prev.couple, hashtag: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-white"
                  />
                </div>
              </div>
            )}

            {/* 3. DATES & VENUES */}
            {activeTab === 'events' && (
              <div className="space-y-4 text-xs font-sans-body">
                <div>
                  <label className="block text-[#8C7A6B] mb-0.5">Countdown Target (ISO Format)</label>
                  <input
                    type="text"
                    value={config.weddingDate.targetIso}
                    onChange={(e) =>
                      handleUpdate((prev) => ({
                        ...prev,
                        weddingDate: { ...prev.weddingDate, targetIso: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-white"
                  />
                  <span className="text-[10px] text-gray-500">e.g. 2026-10-24T10:00:00</span>
                </div>

                <div>
                  <label className="block text-[#8C7A6B] mb-0.5">Display Date Text</label>
                  <input
                    type="text"
                    value={config.weddingDate.displayDate}
                    onChange={(e) =>
                      handleUpdate((prev) => ({
                        ...prev,
                        weddingDate: { ...prev.weddingDate, displayDate: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-white"
                  />
                </div>

                {(config.events || []).map((event, idx) => (
                  <div key={event.id} className="p-3 bg-white rounded-xl border border-[#E6DCce]">
                    <h4 className="font-serif-display font-bold text-sm text-[#2E2420] mb-2">
                      Event #{idx + 1}: {event.title}
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[#8C7A6B] mb-0.5">Event Title</label>
                        <input
                          type="text"
                          value={event.title}
                          onChange={(e) => {
                            const newEvents = (config.events || []).map((ev, i) =>
                              i === idx ? { ...ev, title: e.target.value } : ev
                            );
                            handleUpdate((prev) => ({ ...prev, events: newEvents }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-[#FAF7F2]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[#8C7A6B] mb-0.5">Start Time</label>
                          <input
                            type="text"
                            value={event.startTime}
                            onChange={(e) => {
                              const newEvents = (config.events || []).map((ev, i) =>
                                i === idx ? { ...ev, startTime: e.target.value } : ev
                              );
                              handleUpdate((prev) => ({ ...prev, events: newEvents }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-[#FAF7F2]"
                          />
                        </div>
                        <div>
                          <label className="block text-[#8C7A6B] mb-0.5">End Time</label>
                          <input
                            type="text"
                            value={event.endTime}
                            onChange={(e) => {
                              const newEvents = (config.events || []).map((ev, i) =>
                                i === idx ? { ...ev, endTime: e.target.value } : ev
                              );
                              handleUpdate((prev) => ({ ...prev, events: newEvents }));
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-[#FAF7F2]"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[#8C7A6B] mb-0.5">Venue Name</label>
                        <input
                          type="text"
                          value={event.venueName}
                          onChange={(e) => {
                            const newEvents = (config.events || []).map((ev, i) =>
                              i === idx ? { ...ev, venueName: e.target.value } : ev
                            );
                            handleUpdate((prev) => ({ ...prev, events: newEvents }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-[#FAF7F2]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#8C7A6B] mb-0.5">Venue Address</label>
                        <textarea
                          rows={2}
                          value={event.venueAddress}
                          onChange={(e) => {
                            const newEvents = (config.events || []).map((ev, i) =>
                              i === idx ? { ...ev, venueAddress: e.target.value } : ev
                            );
                            handleUpdate((prev) => ({ ...prev, events: newEvents }));
                          }}
                          className="w-full px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-[#FAF7F2]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. BACKGROUND MUSIC */}
            {activeTab === 'music' && (
              <div className="space-y-4 text-xs font-sans-body">
                <p className="text-[#7A6B60]">
                  Select the default background track or add your own direct audio link (.mp3):
                </p>

                <div className="space-y-2">
                  {(config.musicTracks || []).map((track, idx) => (
                    <div
                      key={track.id}
                      onClick={() =>
                        handleUpdate((prev) => ({ ...prev, defaultTrackIndex: idx }))
                      }
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        config.defaultTrackIndex === idx
                          ? 'border-[#C5A059] bg-white shadow-xs font-semibold'
                          : 'border-[#E6DCce] bg-[#FAF7F2]'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-serif-display text-[#2E2420]">{track.title}</p>
                        <p className="text-[11px] text-[#8C7A6B]">{track.artist}</p>
                      </div>
                      {config.defaultTrackIndex === idx && (
                        <span className="text-xs text-[#C5A059]">Active Track</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#E8DECf]">
                  <label className="block text-[#8C7A6B] mb-1 font-medium">
                    Add Custom Song MP3 URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/mysong.mp3"
                      value={customAudioInput}
                      onChange={(e) => setCustomAudioInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#DCD0C0] bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTrack}
                      className="px-3 py-1.5 bg-[#3D2B24] text-white rounded-lg hover:bg-black"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 5. EXPORT CODE */}
            {activeTab === 'export' && (
              <div className="space-y-4 text-xs font-sans-body">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900">
                  <p className="font-semibold text-sm">Deployment Ready!</p>
                  <p className="text-[11px] mt-1">
                    You can copy this configuration directly into <code className="bg-white/80 px-1 py-0.5 rounded">src/weddingConfig.ts</code> or download it as JSON to save your custom values permanently.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyTS}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#3D2B24] text-white font-medium flex items-center justify-center gap-1.5 hover:bg-black transition-colors"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
                  </button>

                  <button
                    onClick={handleDownloadJSON}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-[#C5A059] text-[#8C6D3B] font-medium flex items-center justify-center gap-1.5 hover:bg-[#FAF7F2] transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON</span>
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-[#8C7A6B] mb-1 font-medium">Config Code Preview</label>
                  <pre className="p-3 bg-[#241F1C] text-amber-200 rounded-xl text-[10px] font-mono max-h-48 overflow-y-auto">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Footer Reset & Close */}
          <div className="p-4 bg-[#FCFAF6] border-t border-[#E8DECf] flex items-center justify-between">
            <button
              onClick={onResetToDefaults}
              className="flex items-center gap-1 text-xs text-[#8C7A6B] hover:text-red-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-[#3D2B24] text-white text-xs font-medium uppercase tracking-wider hover:bg-black transition-colors"
            >
              Apply & Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
