import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Send,
  CheckCircle2,
  UserCheck,
  Users,
  Sparkles,
  Heart,
  FileSpreadsheet,
  Download,
  Search,
  Table as TableIcon,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { WeddingConfig, RsvpData, FloralTheme } from '../types';
import { WatercolorDivider } from './WatercolorFlorals';
import { getAccessToken, initAuth, getCurrentUser } from '../services/googleAuth';
import { appendRsvpRow } from '../services/googleSheets';
import {
  submitRsvpToFirestore,
  subscribeToRsvps,
  RsvpResponseRecord,
} from '../services/firebase';

interface RsvpSectionProps {
  config: WeddingConfig;
  defaultGuestName?: string;
  onRsvpSubmit: (data: RsvpData) => void;
  theme: FloralTheme;
  onOpenGoogleSheets?: () => void;
}

const DEMO_RESPONSES: RsvpResponseRecord[] = [
  {
    id: 'demo-1',
    fullName: 'Eleanor Vance',
    attendance: 'attending',
    numberOfGuests: 2,
    createdAt: 'Today, 11:30 AM',
  },
  {
    id: 'demo-2',
    fullName: 'Dr. Tariq Al-Mansoor',
    attendance: 'attending',
    numberOfGuests: 3,
    createdAt: 'Today, 09:15 AM',
  },
  {
    id: 'demo-3',
    fullName: 'Claire & Marcus Sterling',
    attendance: 'attending',
    numberOfGuests: 2,
    createdAt: 'Yesterday, 4:45 PM',
  },
  {
    id: 'demo-4',
    fullName: 'Amira Benali',
    attendance: 'declined',
    numberOfGuests: 0,
    createdAt: 'Oct 7, 2026',
  },
];

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  config,
  defaultGuestName = '',
  onRsvpSubmit,
  theme,
  onOpenGoogleSheets,
}) => {
  // Form state strictly focused on the 3 required fields
  const [formData, setFormData] = useState<{
    fullName: string;
    attendance: 'attending' | 'declined';
    numberOfGuests: number;
  }>({
    fullName: defaultGuestName,
    attendance: 'attending',
    numberOfGuests: 1,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Host authentication state (only the host sees the private RSVP sheet)
  const [currentUser, setCurrentUser] = useState<User | null>(() => getCurrentUser());

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Verification if viewer is authenticated as the host
  const isHost = Boolean(
    currentUser ||
    localStorage.getItem('wedding_is_admin') === 'true'
  );

  // Live Sheet state
  const [remoteRsvps, setRemoteRsvps] = useState<RsvpResponseRecord[]>([]);
  const [localRsvps, setLocalRsvps] = useState<RsvpResponseRecord[]>(() => {
    try {
      const stored = localStorage.getItem('wedding_rsvps');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any, idx: number) => ({
            id: item.id || `local-${idx}`,
            fullName: item.guestName || item.fullName || 'Guest',
            attendance: item.attendance === 'declined' || item.attendance === 'no' ? 'declined' : 'attending',
            numberOfGuests: Number(item.numberOfGuests || item.guestCount) || 1,
            createdAt: item.timestamp
              ? new Date(item.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recently',
          }));
        }
      }
    } catch {
      // fallback
    }
    return DEMO_RESPONSES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'attending' | 'declined'>('all');
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Real-time synchronization with Firestore
  useEffect(() => {
    try {
      const unsubscribe = subscribeToRsvps((records) => {
        if (records && records.length > 0) {
          setRemoteRsvps(records);
          setIsLiveConnected(true);
        }
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (err) {
      console.warn('Real-time RSVP subscription notice:', err);
    }
  }, []);

  // Merged and deduplicated responses list
  const allResponses = useMemo(() => {
    const list: RsvpResponseRecord[] = [];
    const seenNames = new Set<string>();

    // Priority to remote Firestore items
    remoteRsvps.forEach((item) => {
      const key = item.fullName.trim().toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        list.push(item);
      }
    });

    // Merge local responses
    localRsvps.forEach((item) => {
      const key = item.fullName.trim().toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        list.push(item);
      }
    });

    return list;
  }, [remoteRsvps, localRsvps]);

  // Filtered responses for display
  const filteredResponses = useMemo(() => {
    return allResponses.filter((item) => {
      const matchesSearch = item.fullName
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
      const matchesFilter =
        attendanceFilter === 'all' || item.attendance === attendanceFilter;
      return matchesSearch && matchesFilter;
    });
  }, [allResponses, searchQuery, attendanceFilter]);

  // Aggregate stats
  const totalResponsesCount = allResponses.length;
  const attendingGuestsCount = allResponses
    .filter((r) => r.attendance === 'attending')
    .reduce((sum, r) => sum + (r.numberOfGuests || 1), 0);
  const declinedResponsesCount = allResponses.filter(
    (r) => r.attendance === 'declined'
  ).length;

  const handleAttendanceChange = (attendance: 'attending' | 'declined') => {
    setFormData((prev) => ({
      ...prev,
      attendance,
      numberOfGuests: attendance === 'declined' ? 0 : Math.max(prev.numberOfGuests, 1),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    setIsSubmitting(true);

    const submissionRecord: RsvpResponseRecord = {
      id: `rsvp-${Date.now()}`,
      fullName: formData.fullName.trim(),
      attendance: formData.attendance,
      numberOfGuests: formData.attendance === 'attending' ? formData.numberOfGuests : 0,
      createdAt: 'Just now',
    };

    // Update local state immediately for zero-latency UI
    setLocalRsvps((prev) => [submissionRecord, ...prev]);

    // Save to Firestore
    try {
      await submitRsvpToFirestore({
        guestName: formData.fullName.trim(),
        attendance: formData.attendance === 'attending' ? 'yes' : 'no',
        guestCount: formData.attendance === 'attending' ? formData.numberOfGuests : 0,
        eventsAttending: (config?.events || []).map((ev) => ev.id),
      });
    } catch (firestoreErr) {
      console.warn('Firestore RSVP save note:', firestoreErr);
    }

    // Secondary Google Sheets sync if connected
    try {
      const accessToken = await getAccessToken();
      const sheetId = localStorage.getItem('wedding_google_sheet_id');
      const sheetTab = localStorage.getItem('wedding_google_sheet_tab') || 'RSVPs';

      if (accessToken && sheetId) {
        await appendRsvpRow(accessToken, sheetId, sheetTab, {
          guestName: formData.fullName.trim(),
          attendance: formData.attendance,
          numberOfGuests: formData.attendance === 'attending' ? formData.numberOfGuests : 0,
          eventIds: [],
        });
      }
    } catch (sheetErr) {
      console.warn('Google Sheets sync note:', sheetErr);
    }

    // Fire confetti for celebration
    if (formData.attendance === 'attending') {
      try {
        confetti({
          particleCount: 65,
          spread: 80,
          origin: { y: 0.7 },
          colors: [theme.primaryColor, theme.accentColor, '#F7D6D0', '#DFC186'],
        });
      } catch {
        // safe fallback
      }
    }

    // Propagate callback to App
    onRsvpSubmit({
      guestName: formData.fullName.trim(),
      attendance: formData.attendance,
      numberOfGuests: formData.attendance === 'attending' ? formData.numberOfGuests : 0,
      eventIds: [],
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  // CSV Exporter for hosts
  const handleExportCsv = () => {
    const headers = [
      'Full Name',
      'Attendance Confirmation',
      'Number of Persons Attending',
      'Date Recorded',
    ];
    const rows = allResponses.map((r) => [
      `"${r.fullName.replace(/"/g, '""')}"`,
      `"${r.attendance === 'attending' ? 'Joyfully Attending' : 'Regretfully Decline'}"`,
      r.attendance === 'attending' ? r.numberOfGuests : 0,
      `"${r.createdAt}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Wedding_RSVP_Sheet_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section id="rsvp" className="relative py-16 px-4 sm:px-6 bg-[#FCFAF6] overflow-hidden">
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Section Header */}
        <div className="mb-8">
          <span className="text-xs font-sans-body uppercase tracking-[0.25em] text-[#8C7A6B] font-semibold">
            Will You Join Us?
          </span>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#2E2420] mt-1">
            RSVP & Attendance
          </h2>
          <h3
            dir="rtl"
            className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2E2420] mt-1 mb-2"
            style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
          >
            تأكيد الحضور
          </h3>
          <p className="font-sans-body text-xs sm:text-sm text-[#736357] max-w-md mx-auto mt-2">
            Please kindly respond on or before{' '}
            <span className="font-semibold text-[#8C6D3B]">
              {config.rsvpConfig.deadlineDate}
            </span>{' '}
            to help us finalize arrangements.
          </p>
          <WatercolorDivider tone={theme.floralTone} className="my-4" />
        </div>

        {/* Form Card (Target Element) */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#FAF7F2] border border-[#E6DCce] rounded-3xl p-6 sm:p-10 shadow-lg text-left relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#EAF5E9] border-2 border-emerald-500 flex items-center justify-center text-emerald-600 mb-4 shadow-xs">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#2E2420]">
                    Thank You, {formData.fullName}!
                  </h3>
                  <p className="font-sans-body text-sm text-[#6E5E53] max-w-md mt-2">
                    {formData.attendance === 'attending'
                      ? `Your RSVP for ${formData.numberOfGuests} person(s) has been recorded. We look forward to celebrating together!`
                      : 'We regret that you cannot attend, but thank you warmly for letting us know.'}
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="px-5 py-2 rounded-full border border-[#DFC186] text-xs font-sans-body text-[#8C6D3B] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
                    >
                      Submit Another Response
                    </button>
                    {isHost ? (
                      <a
                        href="#rsvp-sheet"
                        className="px-5 py-2 rounded-full bg-[#3D2B24] text-white text-xs font-sans-body flex items-center gap-1.5 shadow-xs"
                      >
                        <TableIcon className="w-3.5 h-3.5 text-[#DFC186]" />
                        <span>View Private Sheet Below</span>
                      </a>
                    ) : (
                      <a
                        href="#wishes"
                        className="px-5 py-2 rounded-full bg-[#3D2B24] text-white text-xs font-sans-body flex items-center gap-1.5 shadow-xs"
                      >
                        <Heart className="w-3.5 h-3.5 text-[#E8B4B8] fill-current" />
                        <span>Leave a Wedding Wish</span>
                      </a>
                    )}
                  </div>
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-6">
                  {/* Field 1: Full Name */}
                  <div>
                    <label className="block text-xs font-serif-display font-bold uppercase tracking-wider text-[#3D2B24] mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah & David Jenkins"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCD0C0] text-[#2E2420] text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059] transition-all shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Field 2: Attendance Confirmation */}
                  <div>
                    <label className="block text-xs font-serif-display font-bold uppercase tracking-wider text-[#3D2B24] mb-2">
                      Attendance Confirmation <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange('attending')}
                        className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                          formData.attendance === 'attending'
                            ? 'border-emerald-600 bg-[#EEF7EE] shadow-xs ring-2 ring-emerald-500/30'
                            : 'border-[#DCD0C0] bg-white hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <UserCheck
                          className={`w-5 h-5 ${
                            formData.attendance === 'attending'
                              ? 'text-emerald-600'
                              : 'text-[#8C7A6B]'
                          }`}
                        />
                        <span
                          className={`text-xs font-sans-body font-bold ${
                            formData.attendance === 'attending'
                              ? 'text-emerald-900'
                              : 'text-[#63554B]'
                          }`}
                        >
                          Joyfully Attending
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAttendanceChange('declined')}
                        className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                          formData.attendance === 'declined'
                            ? 'border-amber-600 bg-[#FDF4EB] shadow-xs ring-2 ring-amber-500/30'
                            : 'border-[#DCD0C0] bg-white hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <Users
                          className={`w-5 h-5 ${
                            formData.attendance === 'declined'
                              ? 'text-amber-700'
                              : 'text-[#8C7A6B]'
                          }`}
                        />
                        <span
                          className={`text-xs font-sans-body font-bold ${
                            formData.attendance === 'declined'
                              ? 'text-amber-900'
                              : 'text-[#63554B]'
                          }`}
                        >
                          Regretfully Decline
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Field 3: Number of Persons Attending (Active when Attending) */}
                  {formData.attendance === 'attending' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 pt-2 border-t border-[#EAE0D2]"
                    >
                      <label className="block text-xs font-serif-display font-bold uppercase tracking-wider text-[#3D2B24] mb-1.5">
                        Number of Persons Attending <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.numberOfGuests}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            numberOfGuests: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-4 py-3 rounded-xl bg-white border border-[#DCD0C0] text-[#2E2420] text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A059] shadow-2xs"
                      >
                        {Array.from(
                          { length: config.rsvpConfig.maxGuestsPerInvite || 6 },
                          (_, i) => i + 1
                        ).map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? 'Person (Self)' : `Persons (${num} Attending)`}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-[#8C7A6B]">
                        Please select the total count of seats reserved for your party.
                      </p>
                    </motion.div>
                  )}

                  {/* Submit Action */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-full text-white font-sans-body font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting ? 'Recording RSVP...' : 'Submit RSVP Response'}
                    </span>
                    <Sparkles className="w-4 h-4 text-[#F3E5AB]" />
                  </motion.button>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Embedded Live RSVP Responses Sheet - HOST-ONLY PRIVATE VIEW */}
        {isHost && (
          <div id="rsvp-sheet" className="mt-14 text-left">
            {/* Host Privacy Banner */}
            <div className="mb-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-medium shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>
                Host-Only Private Ledger &middot; Visible exclusively to {currentUser?.email || 'Host'}
              </span>
            </div>

            {/* Sheet Header & Controls */}
            <div className="bg-[#FAF7F2] border border-[#E6DCce] rounded-3xl p-5 sm:p-7 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-[#EAE0D2]">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#3D2B24] text-white flex items-center justify-center shadow-xs">
                    <TableIcon className="w-4 h-4 text-[#DFC186]" />
                  </div>
                  <div>
                    <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#2E2420]">
                      RSVP Responses Sheet
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <p className="text-xs text-[#736357]">
                        Live attendee confirmation ledger synchronized in real time
                      </p>
                      {localStorage.getItem('wedding_google_sheet_id') && (
                        <a
                          href={`https://docs.google.com/spreadsheets/d/${localStorage.getItem('wedding_google_sheet_id')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                          <span>
                            Destination Sheet: {localStorage.getItem('wedding_google_sheet_id')?.slice(0, 8)}...
                          </span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & CSV Export */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DCD0C0] hover:bg-[#F5EFE6] text-[#3D2B24] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#8C6D3B]" />
                  <span>Export CSV</span>
                </button>

                {onOpenGoogleSheets && (
                  <button
                    type="button"
                    onClick={onOpenGoogleSheets}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DCD0C0] hover:bg-[#F5EFE6] text-[#3D2B24] text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Google Sheets Sync</span>
                  </button>
                )}
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 py-4 border-b border-[#EAE0D2] text-center">
              <div className="p-3 bg-white rounded-xl border border-[#EDE4D8]">
                <span className="block text-[11px] font-sans-body uppercase tracking-wider text-[#8C7A6B]">
                  Total Responses
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-[#2E2420]">
                  {totalResponsesCount}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#EDE4D8]">
                <span className="block text-[11px] font-sans-body uppercase tracking-wider text-emerald-700">
                  Confirmed Attending
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-800">
                  {attendingGuestsCount} <span className="text-xs font-sans font-normal text-[#8C7A6B]">persons</span>
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#EDE4D8]">
                <span className="block text-[11px] font-sans-body uppercase tracking-wider text-amber-700">
                  Declined
                </span>
                <span className="text-lg sm:text-xl font-bold font-mono tabular-nums text-amber-800">
                  {declinedResponsesCount}
                </span>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 pb-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by guest name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-[#DCD0C0] text-[#2E2420] focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-white/70 rounded-xl border border-[#E0D5C7]">
                <button
                  type="button"
                  onClick={() => setAttendanceFilter('all')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    attendanceFilter === 'all'
                      ? 'bg-[#3D2B24] text-white shadow-2xs'
                      : 'text-[#6E5E53] hover:text-[#2E2420]'
                  }`}
                >
                  All ({totalResponsesCount})
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceFilter('attending')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    attendanceFilter === 'attending'
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'text-[#6E5E53] hover:text-[#2E2420]'
                  }`}
                >
                  Attending
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceFilter('declined')}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                    attendanceFilter === 'declined'
                      ? 'bg-amber-700 text-white shadow-2xs'
                      : 'text-[#6E5E53] hover:text-[#2E2420]'
                  }`}
                >
                  Declined
                </button>
              </div>
            </div>

            {/* The Sheet Table */}
            <div className="mt-3 overflow-x-auto rounded-2xl border border-[#E0D5C7] bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E0D5C7] text-[#3D2B24] font-serif-display uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 font-bold">Full Name</th>
                    <th className="py-3 px-4 font-bold">Attendance Confirmation</th>
                    <th className="py-3 px-4 font-bold text-center">Number of Persons Attending</th>
                    <th className="py-3 px-4 font-bold text-right">Date Recorded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0E8DD]">
                  {filteredResponses.length > 0 ? (
                    filteredResponses.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-[#FAF7F2]/80 transition-colors"
                      >
                        {/* 1. Full Name */}
                        <td className="py-3.5 px-4 font-medium text-[#2E2420]">
                          {item.fullName}
                        </td>

                        {/* 2. Attendance Confirmation */}
                        <td className="py-3.5 px-4">
                          {item.attendance === 'attending' ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-800 font-medium">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                              <span>Joyfully Attending</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-stone-600 font-medium">
                              <span className="w-2 h-2 rounded-full bg-stone-400 ring-4 ring-stone-100" />
                              <span>Regretfully Decline</span>
                            </span>
                          )}
                        </td>

                        {/* 3. Number of Persons Attending */}
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums font-semibold text-[#2E2420]">
                          {item.attendance === 'attending' ? (
                            <span>
                              {item.numberOfGuests}{' '}
                              <span className="text-[11px] font-sans text-[#8C7A6B] font-normal">
                                {item.numberOfGuests === 1 ? 'person' : 'persons'}
                              </span>
                            </span>
                          ) : (
                            <span className="text-[#8C7A6B] font-normal">—</span>
                          )}
                        </td>

                        {/* 4. Date Recorded */}
                        <td className="py-3.5 px-4 text-right text-[#8C7A6B] font-mono tabular-nums text-[11px]">
                          {item.createdAt}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 px-4 text-center text-[#8C7A6B]">
                        No matching RSVP records found in sheet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer note */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#8C7A6B] px-1">
              <span>
                Showing {filteredResponses.length} of {allResponses.length} responses
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live sync active</span>
              </span>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
};