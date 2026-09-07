import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Check,
  Plus,
  Music,
  ExternalLink,
  BookOpen,
  Activity,
  Heart,
  Calendar,
  X,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BucketCategory } from '../types';
import { pixelAudio } from '../lib/sound';

export const TogetherView: React.FC = () => {
  const {
    currentUser,
    partnerName,
    bucketItems,
    toggleBucketItem,
    addBucketItem,
    songs,
    addSong,
    storyMilestones,
    addStoryMilestone,
    littleMoments,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'bucket' | 'soundtrack' | 'story' | 'moments'>('bucket');

  // Bucket category filter
  const [bucketFilter, setBucketFilter] = useState<BucketCategory | 'all'>('all');
  const [showAddBucket, setShowAddBucket] = useState(false);
  const [newBucketTitle, setNewBucketTitle] = useState('');
  const [newBucketCategory, setNewBucketCategory] = useState<BucketCategory>('Together');

  // Add Song Modal
  const [showAddSong, setShowAddSong] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [songNote, setSongNote] = useState('');

  // Add Milestone Modal
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneDate, setMilestoneDate] = useState(() => new Date().toISOString().split('T')[0]);

  const filteredBucket = bucketItems.filter((item) =>
    bucketFilter === 'all' ? true : item.category === bucketFilter
  );

  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketTitle.trim()) return;
    pixelAudio.playQuestComplete();
    addBucketItem(newBucketTitle.trim(), newBucketCategory);
    setNewBucketTitle('');
    setShowAddBucket(false);
  };

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle.trim() || !songArtist.trim()) return;
    pixelAudio.playQuestComplete();
    addSong(songTitle.trim(), songArtist.trim(), songUrl.trim() || undefined, songNote.trim() || undefined);
    setSongTitle('');
    setSongArtist('');
    setSongUrl('');
    setSongNote('');
    setShowAddSong(false);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !milestoneDesc.trim()) return;
    pixelAudio.playQuestComplete();
    addStoryMilestone(milestoneTitle.trim(), milestoneDesc.trim(), milestoneDate);
    setMilestoneTitle('');
    setMilestoneDesc('');
    setShowAddMilestone(false);
  };

  return (
    <div className="min-h-screen pb-28 pt-3 px-3 sm:px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Header */}
      <div className="pb-2 border-b-2 border-black">
        <span className="font-pixel text-[10px] text-[#FF3366] uppercase tracking-wider block">
          &gt; OUR TIME TOGETHER &lt;
        </span>
        <h2 className="font-pixel text-base text-black dark:text-white mt-0.5">
          TOGETHER
        </h2>
      </div>

      {/* Sub-Section Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-white dark:bg-[#1A1A2E] border-2 border-black shadow-[2px_2px_0px_#000]">
        {(
          [
            { id: 'bucket', label: 'OUR PLANS', icon: Compass },
            { id: 'soundtrack', label: 'MUSIC', icon: Music },
            { id: 'story', label: 'OUR STORY', icon: BookOpen },
            { id: 'moments', label: 'MOMENTS', icon: Activity },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                pixelAudio.playBlip();
                setActiveSection(item.id);
              }}
              className={`flex flex-col items-center justify-center py-2 px-1 border transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FFD166] text-black border-black font-pixel shadow-[1px_1px_0px_#000]'
                  : 'text-[#666] dark:text-[#AAA] border-transparent hover:text-black dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5 stroke-[2.5]" />
              <span className="font-pixel text-[9px] truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: PLANS & WISHES */}
      {activeSection === 'bucket' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-xs text-black dark:text-white uppercase">
              OUR PLANS & WISHES
            </h3>
            <button
              onClick={() => {
                pixelAudio.playBlip();
                setShowAddBucket(true);
              }}
              className="pixel-btn bg-[#FF3366] text-white font-pixel text-[10px] px-2 py-1 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>ADD PLAN</span>
            </button>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
            {(['all', 'Together', 'Tunisia', 'Poland', 'Travel', 'Food', 'Movies', 'Random'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  pixelAudio.playBlip();
                  setBucketFilter(cat);
                }}
                className={`px-2 py-0.5 border-2 border-black font-pixel text-[9px] uppercase whitespace-nowrap cursor-pointer transition-all ${
                  bucketFilter === cat
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-[1px_1px_0px_#000]'
                    : 'bg-white dark:bg-[#1A1A2E] text-black dark:text-white hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Bucket Items */}
          <div className="space-y-2">
            {filteredBucket.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-black/30 dark:border-white/30 bg-white dark:bg-[#1A1A2E]">
                <div className="font-pixel text-xs text-black dark:text-white mb-1">
                  ★ NO PLANS IN THIS CATEGORY ★
                </div>
                <p className="font-pixel-ui text-xs text-[#666] dark:text-[#AAA]">
                  Add things you and your partner dream of doing together!
                </p>
              </div>
            ) : (
              filteredBucket.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    pixelAudio.playBlip();
                    toggleBucketItem(item.id);
                  }}
                  className={`p-3 border-2 border-black flex items-center justify-between cursor-pointer transition-all shadow-[2px_2px_0px_#000] hover:translate-x-0.5 ${
                    item.completed
                      ? 'bg-[#FAF8F5] dark:bg-[#121224] opacity-70'
                      : 'bg-white dark:bg-[#1A1A2E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-5 h-5 border-2 border-black flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000] ${
                        item.completed ? 'bg-[#06D6A0] text-black' : 'bg-white dark:bg-black'
                      }`}
                    >
                      {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div className="min-w-0">
                      <span
                        className={`font-pixel-ui text-xs block font-bold ${
                          item.completed
                            ? 'line-through text-[#888]'
                            : 'text-black dark:text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="font-pixel text-[9px] text-[#FF3366] uppercase">
                        [{item.category}]
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: OUR SOUNDTRACK */}
      {activeSection === 'soundtrack' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-xs text-black dark:text-white uppercase">
              OUR SOUNDTRACK PLAYLIST
            </h3>
            <button
              onClick={() => {
                pixelAudio.playBlip();
                setShowAddSong(true);
              }}
              className="pixel-btn bg-[#FF3366] text-white font-pixel text-[10px] px-2 py-1 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>ADD TRACK</span>
            </button>
          </div>

          <div className="space-y-2">
            {songs.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-black/30 dark:border-white/30 bg-white dark:bg-[#1A1A2E]">
                <div className="font-pixel text-xs text-black dark:text-white mb-1">
                  ★ PLAYLIST EMPTY ★
                </div>
                <p className="font-pixel-ui text-xs text-[#666] dark:text-[#AAA]">
                  Add real songs that define Moez and Eliza's story.
                </p>
              </div>
            ) : (
              songs.map((song) => (
                <div
                  key={song.id}
                  className="p-3 border-2 border-black bg-white dark:bg-[#1A1A2E] shadow-[2px_2px_0px_#000] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 border-2 border-black bg-[#118AB2] text-white flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#000]">
                      <Music className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-pixel text-xs text-black dark:text-white truncate">
                        {song.title}
                      </h4>
                      <p className="font-pixel-ui text-xs text-[#555] dark:text-[#AAA] truncate">
                        {song.artist}
                      </p>
                      {song.note && (
                        <p className="font-pixel-ui text-[11px] text-[#FF3366] italic mt-0.5 truncate">
                          "{song.note}"
                        </p>
                      )}
                    </div>
                  </div>

                  {song.url && (
                    <a
                      href={song.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 border-2 border-black bg-[#FFD166] text-black shadow-[1px_1px_0px_#000] hover:translate-x-0.5 cursor-pointer shrink-0"
                      title="Listen to track"
                    >
                      <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: OUR STORY */}
      {activeSection === 'story' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-xs text-black dark:text-white uppercase">
              OUR STORY & MILESTONES
            </h3>
            <button
              onClick={() => {
                pixelAudio.playBlip();
                setShowAddMilestone(true);
              }}
              className="pixel-btn bg-[#FF3366] text-white font-pixel text-[10px] px-2 py-1 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
                <span>ADD MILESTONE</span>
            </button>
          </div>

          <div className="space-y-3">
            {storyMilestones.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-black/30 dark:border-white/30 bg-white dark:bg-[#1A1A2E]">
                <div className="font-pixel text-xs text-black dark:text-white mb-1">
                  ★ NO REAL MILESTONES SAVED ★
                </div>
                <p className="font-pixel-ui text-xs text-[#666] dark:text-[#AAA]">
                  Document when you first met, your first trip, or memorable dates.
                </p>
              </div>
            ) : (
              storyMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="p-3 border-2 border-black bg-white dark:bg-[#1A1A2E] shadow-[3px_3px_0px_#000]"
                >
                  <div className="flex items-center justify-between pb-1 mb-1 border-b border-black/20 dark:border-white/20">
                    <span className="font-pixel text-[10px] text-[#FF3366]">
                      {new Date(milestone.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="font-pixel text-[9px] bg-black text-[#FFD166] px-1 py-0.5 border border-black">
                      MILESTONE
                    </span>
                  </div>
                  <h4 className="font-pixel text-xs text-black dark:text-white mb-1">
                    {milestone.title}
                  </h4>
                  <p className="font-pixel-ui text-xs text-[#444] dark:text-[#CCC] leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: LITTLE MOMENTS */}
      {activeSection === 'moments' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-xs text-black dark:text-white uppercase">
              RECENT MOMENTS
            </h3>
            <span className="font-pixel text-[9px] text-[#06D6A0]">● UP TO DATE</span>
          </div>

          <div className="space-y-2">
            {littleMoments.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-black/30 dark:border-white/30 bg-white dark:bg-[#1A1A2E]">
                <div className="font-pixel text-xs text-black dark:text-white mb-1">
                  ★ NO INTERACTIONS LOGGED YET ★
                </div>
                <p className="font-pixel-ui text-xs text-[#666] dark:text-[#AAA]">
                  Every virtual hug, status update, or love message you send will appear here.
                </p>
              </div>
            ) : (
              littleMoments.map((moment) => (
                <div
                  key={moment.id}
                  className="p-2.5 border-2 border-black bg-white dark:bg-[#1A1A2E] shadow-[2px_2px_0px_#000] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 border border-black bg-[#FF3366] text-white flex items-center justify-center shrink-0">
                      <Heart className="w-3.5 h-3.5 fill-white" />
                    </div>
                    <span className="font-pixel text-xs text-black dark:text-white">
                      {moment.actor_name.toUpperCase()}{' '}
                      <span className="font-pixel-ui font-normal text-[#555] dark:text-[#AAA]">
                        {moment.action_text}
                      </span>
                    </span>
                  </div>
                  <span className="font-pixel text-[9px] text-[#888]">
                    {new Date(moment.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Bucket Modal */}
      <AnimatePresence>
        {showAddBucket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-[#1A1A2E] border-4 border-black shadow-[6px_6px_0px_#000] p-4"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-black">
                <h3 className="font-pixel text-xs text-black dark:text-white uppercase">
                  &gt; ADD A SHARED PLAN &lt;
                </h3>
                <button
                  onClick={() => setShowAddBucket(false)}
                  className="w-6 h-6 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#000]"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              <form onSubmit={handleAddBucket} className="space-y-3 font-pixel-ui text-xs">
                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Plan Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Watch sunset at Sidi Bou Said..."
                    value={newBucketTitle}
                    onChange={(e) => setNewBucketTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Plan Category
                  </label>
                  <select
                    value={newBucketCategory}
                    onChange={(e) => setNewBucketCategory(e.target.value as BucketCategory)}
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none"
                  >
                    <option value="Together">Together</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Poland">Poland</option>
                    <option value="Travel">Travel</option>
                    <option value="Food">Food</option>
                    <option value="Movies">Movies</option>
                    <option value="Random">Random</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBucket(false)}
                    className="px-3 py-1.5 border-2 border-black bg-gray-200 dark:bg-gray-800 font-pixel text-xs cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="pixel-btn bg-[#06D6A0] text-black font-pixel text-xs px-4 py-1.5 cursor-pointer"
                  >
                    ADD PLAN
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Song Modal */}
      <AnimatePresence>
        {showAddSong && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-[#1A1A2E] border-4 border-black shadow-[6px_6px_0px_#000] p-4"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-black">
                <h3 className="font-pixel text-xs text-black dark:text-white uppercase">
                  &gt; ADD CHIPTUNE TRACK &lt;
                </h3>
                <button
                  onClick={() => setShowAddSong(false)}
                  className="w-6 h-6 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#000]"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              <form onSubmit={handleAddSong} className="space-y-3 font-pixel-ui text-xs">
                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Song Title
                  </label>
                  <input
                    type="text"
                    placeholder="Track Title"
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Artist / Band
                  </label>
                  <input
                    type="text"
                    placeholder="Artist name"
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                    required
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Audio Link (Spotify/YouTube)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={songUrl}
                    onChange={(e) => setSongUrl(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Memory Note
                  </label>
                  <input
                    type="text"
                    placeholder="Reminds me of when we..."
                    value={songNote}
                    onChange={(e) => setSongNote(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSong(false)}
                    className="px-3 py-1.5 border-2 border-black bg-gray-200 dark:bg-gray-800 font-pixel text-xs cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="pixel-btn bg-[#06D6A0] text-black font-pixel text-xs px-4 py-1.5 cursor-pointer"
                  >
                    SAVE TRACK
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Milestone Modal */}
      <AnimatePresence>
        {showAddMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-white dark:bg-[#1A1A2E] border-4 border-black shadow-[6px_6px_0px_#000] p-4"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-black">
                <h3 className="font-pixel text-xs text-black dark:text-white uppercase">
                  &gt; ADD STORY MILESTONE &lt;
                </h3>
                <button
                  onClick={() => setShowAddMilestone(false)}
                  className="w-6 h-6 border-2 border-black bg-[#FF3366] text-white flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_#000]"
                >
                  <X className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>

              <form onSubmit={handleAddMilestone} className="space-y-3 font-pixel-ui text-xs">
                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. When we first met in person"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={milestoneDate}
                    onChange={(e) => setMilestoneDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black dark:text-[#AAA] uppercase mb-1">
                    Chronicle Story
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What made this moment unforgettable?..."
                    value={milestoneDesc}
                    onChange={(e) => setMilestoneDesc(e.target.value)}
                    required
                    className="w-full p-2.5 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none resize-none shadow-[2px_2px_0px_#000]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMilestone(false)}
                    className="px-3 py-1.5 border-2 border-black bg-gray-200 dark:bg-gray-800 font-pixel text-xs cursor-pointer shadow-[2px_2px_0px_#000]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="pixel-btn bg-[#06D6A0] text-black font-pixel text-xs px-4 py-1.5 cursor-pointer"
                  >
                    SAVE MILESTONE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
