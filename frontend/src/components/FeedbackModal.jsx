import { useState } from 'react';
import { Star, MessageSquareHeart, X, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function FeedbackModal({ isOpen, onClose, toolType = 'general', toolName = 'AI Tool' }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/tools/feedback', {
        tool_type: toolType,
        rating,
        comment: comment.trim() || null
      });
      setSubmitted(true);
      toast.success('Thank you for your feedback! ❤️');
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Feedback submit error:", err);
      toast.error('Failed to submit feedback. Thank you anyway!');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-md rounded-2xl border border-purple-500/30 p-6 relative shadow-2xl animate-fade-in-up" style={{ background: 'rgba(13, 13, 26, 0.98)' }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto text-green-400">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-xl font-bold font-display text-white">Thank You!</h3>
            <p className="text-gray-400 text-sm">Your feedback helps us make {toolName} even better.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header Icon */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <MessageSquareHeart size={22} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">How was your experience?</h3>
                <p className="text-gray-400 text-xs">Help us improve {toolName}</p>
              </div>
            </div>

            {/* Star Rating */}
            <div className="py-2 text-center bg-white/5 rounded-xl border border-white/5">
              <p className="text-xs text-gray-400 mb-2 font-medium">Rate your result</p>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      size={28}
                      className={
                        (hoverRating || rating) >= star
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]'
                          : 'text-gray-600'
                      }
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold text-yellow-400 mt-2">
                {rating === 5 ? '⭐ Excellent!' : rating === 4 ? '👍 Great' : rating === 3 ? '😐 Good' : rating === 2 ? '👎 Fair' : '🙁 Poor'}
              </p>
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Any comments or suggestions? (Optional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you liked or how we can improve..."
                className="input-field text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 py-2.5 text-xs text-gray-400 hover:text-white"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
