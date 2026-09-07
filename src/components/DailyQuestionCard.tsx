import React, { useState } from 'react';
import { motion } from 'motion/react';
import { HelpCircle, Lock, RefreshCw, Sparkles, Check, Send } from 'lucide-react';
import { Question, QuestionAnswer, PartnerName } from '../types';
import { pixelAudio } from '../lib/sound';

interface DailyQuestionCardProps {
  question: Question;
  currentUser: PartnerName;
  partnerName: PartnerName;
  myAnswer?: QuestionAnswer;
  partnerAnswer?: QuestionAnswer;
  canReveal: boolean;
  onSubmitAnswer: (answer: string) => void;
  onRotateQuestion: () => void;
}

export const DailyQuestionCard: React.FC<DailyQuestionCardProps> = ({
  question,
  currentUser,
  partnerName,
  myAnswer,
  partnerAnswer,
  canReveal,
  onSubmitAnswer,
  onRotateQuestion,
}) => {
  const [draftAnswer, setDraftAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftAnswer.trim()) return;
    setIsSubmitting(true);
    pixelAudio.playQuestComplete();
    onSubmitAnswer(draftAnswer.trim());
    setDraftAnswer('');
    setIsSubmitting(false);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'romantic':
        return 'bg-[#FF3366] text-white';
      case 'deep':
        return 'bg-[#8338EC] text-white';
      case 'funny':
        return 'bg-[#FFBE0B] text-black';
      case 'future':
        return 'bg-[#06D6A0] text-black';
      case 'memories':
        return 'bg-[#3A86FF] text-white';
      default:
        return 'bg-black text-white';
    }
  };

  return (
    <div className="w-full pixel-card bg-white dark:bg-[#1A1A2E] p-4 select-none">
      {/* Category header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-black">
        <div className="flex items-center gap-2">
          <span className={`font-pixel text-[10px] px-2 py-0.5 border border-black shadow-[1px_1px_0px_#000] uppercase ${getCategoryColor(question.category)}`}>
            {question.category}
          </span>
          <span className="font-pixel text-xs text-black dark:text-white uppercase tracking-wider">
            DAILY QUESTION
          </span>
        </div>

        <button
          onClick={() => {
            pixelAudio.playBlip();
            onRotateQuestion();
          }}
          className="font-pixel text-[10px] bg-white dark:bg-black px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] hover:translate-x-0.5 cursor-pointer flex items-center gap-1"
          title="Show another question"
        >
          <RefreshCw className="w-3 h-3" />
          <span>ANOTHER</span>
        </button>
      </div>

      {/* Question */}
      <div className="bg-[#FAF8F5] dark:bg-[#121224] border-2 border-black p-3 mb-3 shadow-[2px_2px_0px_#000]">
        <div className="font-pixel text-xs text-[#FF3366] mb-1">
          QUESTION:
        </div>
        <h3 className="font-pixel-ui text-sm font-bold text-black dark:text-white leading-snug">
          "{question.question}"
        </h3>
      </div>

      {/* Answer Flow */}
      {canReveal ? (
        // BOTH ANSWERED: REVEAL VIEW
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-2.5"
        >
          <div className="bg-[#06D6A0] text-black font-pixel text-xs px-2 py-1 border border-black shadow-[1px_1px_0px_#000] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>★ ANSWERS REVEALED ★</span>
          </div>

          {/* Partner's Answer */}
          <div className="p-3 border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] shadow-[2px_2px_0px_#000]">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-black/20 dark:border-white/20">
              <span className="font-pixel text-xs text-[#FF3366]">
                {partnerName.toUpperCase()}'S ANSWER:
              </span>
              <span className="font-pixel-ui text-[10px] text-[#777]">
                {partnerAnswer?.created_at ? new Date(partnerAnswer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <p className="font-pixel-ui text-xs text-black dark:text-white leading-relaxed">
              {partnerAnswer?.answer}
            </p>
          </div>

          {/* User's Answer */}
          <div className="p-3 border-2 border-black bg-white dark:bg-[#1A1A2E] shadow-[2px_2px_0px_#000]">
            <div className="flex items-center justify-between pb-1 mb-1 border-b border-black/20 dark:border-white/20">
              <span className="font-pixel text-xs text-[#118AB2]">
                YOUR ANSWER ({currentUser.toUpperCase()}):
              </span>
              <span className="font-pixel-ui text-[10px] text-[#777]">
                {myAnswer?.created_at ? new Date(myAnswer.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <p className="font-pixel-ui text-xs text-black dark:text-white leading-relaxed">
              {myAnswer?.answer}
            </p>
          </div>
        </motion.div>
      ) : myAnswer ? (
        // USER ANSWERED, PARTNER HAS NOT YET
        <div className="p-3 border-2 border-black bg-[#FAF8F5] dark:bg-[#121224] shadow-[2px_2px_0px_#000]">
          <div className="flex items-center gap-1.5 font-pixel text-xs text-[#06D6A0] mb-1">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>ANSWER SAVED</span>
          </div>
          <p className="font-pixel-ui text-xs text-black dark:text-white mb-2 italic">
            "{myAnswer.answer}"
          </p>

          <div className="pt-2 border-t-2 border-dashed border-black/20 dark:border-white/20 flex items-center gap-1.5 font-pixel text-[10px] text-[#FF5400]">
            <Lock className="w-3.5 h-3.5" />
            <span>AWAITING {partnerName.toUpperCase()}'S ANSWER TO REVEAL BOTH</span>
          </div>
        </div>
      ) : (
        // USER HAS NOT ANSWERED YET
        <form onSubmit={handleSubmit} className="space-y-2 font-pixel-ui text-xs">
          <div>
            <textarea
              rows={3}
              value={draftAnswer}
              onChange={(e) => setDraftAnswer(e.target.value)}
              placeholder={`Write your answer secretly... ${partnerName} cannot see until you both answer.`}
              className="w-full p-2.5 border-2 border-black bg-white dark:bg-[#121224] text-xs text-black dark:text-white focus:outline-none resize-none shadow-[2px_2px_0px_#000]"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 font-pixel text-[10px] text-[#666] dark:text-[#AAA]">
              <Lock className="w-3 h-3" />
              <span>PRIVATE UNTIL BOTH ANSWER</span>
            </span>

            <button
              type="submit"
              disabled={!draftAnswer.trim() || isSubmitting}
              className="pixel-btn bg-[#FF3366] disabled:opacity-50 text-white font-pixel text-xs px-3 py-1.5 flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              SUBMIT ANSWER
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
