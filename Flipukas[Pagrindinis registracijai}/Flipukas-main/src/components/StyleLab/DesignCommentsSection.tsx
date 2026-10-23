import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Trash2,
  Clock,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  X,
  BookmarkPlus,
} from 'lucide-react';
import { WishlistItem, Product, CustomizationState, FabricMaterial } from '../../types/clothing';
import {
  WishlistComment,
  addDesignComment,
  deleteDesignComment,
  subscribeDesignComments,
  UserProfileData,
} from '../../services/firebase';

interface DesignCommentsSectionProps {
  currentWishlistItem: WishlistItem | null;
  currentUser: UserProfileData | null;
  onSaveCurrentDesignToWishlist?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const PRESET_TAGS = ['#Siuvimas', '#Audinys', '#Dydis', '#Derinys', '#Gamyba'];

export const DesignCommentsSection: React.FC<DesignCommentsSectionProps> = ({
  currentWishlistItem,
  currentUser,
  onSaveCurrentDesignToWishlist,
  isOpen = true,
  onClose,
  className = '',
}) => {
  const [comments, setComments] = useState<WishlistComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const wishlistId = currentWishlistItem?.id || null;
  const activeUserId = currentUser?.uid || 'guest-creator';
  const authorName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Dizaineris';

  // Real-time Firestore subscription
  useEffect(() => {
    if (!wishlistId) {
      setComments([]);
      return;
    }

    const unsubscribe = subscribeDesignComments(
      currentUser?.uid || null,
      wishlistId,
      (updatedList) => {
        setComments(updatedList);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [wishlistId, currentUser?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    // If design is not yet saved to wishlist, guide or prompt user to save
    if (!wishlistId) {
      if (onSaveCurrentDesignToWishlist) {
        onSaveCurrentDesignToWishlist();
        setSyncNotice('Pirmiausia modelis išsaugotas į Wishlist! Dabar galima pridėti pastabą.');
        setTimeout(() => setSyncNotice(null), 4000);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await addDesignComment(
        activeUserId,
        wishlistId,
        newCommentText.trim(),
        authorName,
        selectedTag || undefined
      );

      setNewCommentText('');
      setSelectedTag('');
      setSyncNotice('Pastaba išsaugota debesyje (Firestore)!');
      setTimeout(() => setSyncNotice(null), 3000);
    } catch (err) {
      console.warn('Failed to add comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!wishlistId) return;
    try {
      await deleteDesignComment(activeUserId, wishlistId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.warn('Failed to delete comment:', err);
    }
  };

  const formatTimestamp = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Ką tik';
    if (diff < 3600000) return `prieš ${Math.floor(diff / 60000)} min.`;
    if (diff < 86400000) return `prieš ${Math.floor(diff / 3600000)} val.`;
    return new Date(ts).toLocaleDateString('lt-LT', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`rounded-2xl border border-neutral-800 bg-neutral-950/90 backdrop-blur-md overflow-hidden flex flex-col shadow-xl ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800/80 bg-neutral-900/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display font-bold text-xs text-white">
                Dizaino Pastabos ir Komentarai
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-amber-400 border border-neutral-700">
                {comments.length}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400">
              {currentWishlistItem
                ? `Modeliui: ${currentWishlistItem.title}`
                : 'Išsaugok modelį, kad susietum pastabas su Firestore'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Firestore Sync</span>
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncNotice && (
        <div className="bg-amber-400/15 border-b border-amber-400/30 px-4 py-2 text-[11px] text-amber-300 font-medium flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Non-wishlisted prompt warning banner */}
      {!currentWishlistItem && (
        <div className="p-3 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-neutral-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Šis 3D derinys dar nėra išsaugotas tavo Wishlist sąraše.</span>
          </div>
          {onSaveCurrentDesignToWishlist && (
            <button
              type="button"
              onClick={onSaveCurrentDesignToWishlist}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-[11px] flex items-center gap-1 shrink-0 transition cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Įrašyti į Wishlist</span>
            </button>
          )}
        </div>
      )}

      {/* Comments List Area */}
      <div className="p-4 flex-1 overflow-y-auto max-h-64 flex flex-col gap-3">
        {comments.length === 0 ? (
          <div className="py-6 text-center flex flex-col items-center justify-center text-neutral-500">
            <FileText className="w-8 h-8 mb-2 opacity-40 text-neutral-400" />
            <p className="text-xs text-neutral-400 font-medium">Pastabų šiam modeliui dar nėra</p>
            <p className="text-[11px] text-neutral-500 max-w-xs mt-0.5">
              Užsirašyk mintis apie audinio pojūtį, siuvimo detales ar progą, kuriai kuri šį rūbą.
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800/90 hover:border-neutral-700/80 transition-all flex flex-col gap-1.5 text-xs group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold flex items-center justify-center font-mono">
                    {comment.authorName[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-semibold text-neutral-200 text-[11px]">
                    {comment.authorName}
                  </span>
                  {comment.tag && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400 border border-neutral-700/70">
                      {comment.tag}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-neutral-600" />
                    {formatTimestamp(comment.createdAt)}
                  </span>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    title="Ištrinti pastabą"
                    className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-rose-400 rounded transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-neutral-300 text-xs leading-relaxed whitespace-pre-wrap pl-7">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* New Comment Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-800 bg-neutral-900/70 flex flex-col gap-2">
        {/* Preset Tag Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[10px]">
          <span className="text-neutral-500 text-[10px] flex items-center gap-1 mr-1">
            <Tag className="w-3 h-3" /> Žyma:
          </span>
          {PRESET_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
              className={`px-2 py-0.5 rounded-full font-mono transition cursor-pointer ${
                selectedTag === tag
                  ? 'bg-amber-400 text-neutral-950 font-bold'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            placeholder={
              currentWishlistItem
                ? 'Pridėk pastabą apie šį modelį (pvz. suderinti siūles)...'
                : 'Pvz.: Užsakyti XL dydį, dera su šviesiu linu...'
            }
            className="flex-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
          />

          <button
            type="submit"
            disabled={!newCommentText.trim() || isSubmitting}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Išsaugoti</span>
          </button>
        </div>
      </form>
    </div>
  );
};
