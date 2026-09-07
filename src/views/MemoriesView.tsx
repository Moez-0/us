import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Plus, Heart, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Memory } from '../types';
import { AddMemoryModal } from '../components/AddMemoryModal';
import { MemoryDetailModal } from '../components/MemoryDetailModal';
import { pixelAudio } from '../lib/sound';

export const MemoriesView: React.FC = () => {
  const { memories, currentUser, addMemory, reactToMemory } = useApp();
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="min-h-screen pb-28 pt-3 px-3 sm:px-4 max-w-md mx-auto space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-black">
        <div>
          <span className="font-pixel text-[10px] text-[#FF3366] uppercase tracking-wider block">
            &gt; VISUAL MEMORY VAULT &lt;
          </span>
          <h2 className="font-pixel text-base text-black dark:text-white mt-0.5">
            OUR MEMORIES
          </h2>
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            pixelAudio.playBlip();
            setShowAddModal(true);
          }}
          className="pixel-btn bg-[#FF3366] text-white font-pixel text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>ADD</span>
        </motion.button>
      </div>

      {/* Memories Grid */}
      {memories.length === 0 ? (
        <div className="text-center py-12 px-4 pixel-card bg-white dark:bg-[#1A1A2E]">
          <div className="w-12 h-12 border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] text-black dark:text-white flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_#000]">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h4 className="font-pixel text-xs text-black dark:text-white uppercase">
            ★ NO REAL MEMORIES SAVED YET ★
          </h4>
          <p className="font-pixel-ui text-xs text-[#666] dark:text-[#AAA] mt-1 max-w-xs mx-auto">
            Take or upload real photos together or snapshots from your day. Only real photos belong in your private vault!
          </p>
          <button
            onClick={() => {
              pixelAudio.playBlip();
              setShowAddModal(true);
            }}
            className="mt-3 pixel-btn bg-[#06D6A0] text-black font-pixel text-xs px-4 py-1.5 inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>SAVE REAL PHOTO</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {memories.map((mem) => {
            const reactionCount = (mem.reactions || []).length;

            return (
              <motion.div
                key={mem.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  pixelAudio.playBlip();
                  setSelectedMemory(mem);
                }}
                className="group relative border-2 border-black bg-white dark:bg-[#1A1A2E] shadow-[3px_3px_0px_#000] cursor-pointer flex flex-col hover:translate-x-0.5"
              >
                {/* Photo Thumbnail */}
                <div className="aspect-square w-full overflow-hidden bg-black relative border-b-2 border-black">
                  <img
                    src={mem.image_path}
                    alt={mem.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Reaction Pill Overlay if reacted */}
                  {reactionCount > 0 && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 border border-black bg-[#FF3366] text-white font-pixel text-[9px] flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                      <Heart className="w-2.5 h-2.5 fill-white" />
                      <span>{reactionCount}</span>
                    </div>
                  )}
                </div>

                {/* Caption & Date */}
                <div className="p-2">
                  <p className="font-pixel-ui text-xs font-bold text-black dark:text-white line-clamp-2 leading-tight">
                    {mem.caption}
                  </p>
                  <span className="font-pixel-ui text-[10px] text-[#777] block mt-1">
                    {new Date(mem.memory_date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddMemory={addMemory}
      />

      {/* Memory Detail & Reaction Modal */}
      <MemoryDetailModal
        memory={selectedMemory}
        isOpen={!!selectedMemory}
        onClose={() => setSelectedMemory(null)}
        currentUser={currentUser || 'Moez'}
        onReact={reactToMemory}
      />
    </div>
  );
};
