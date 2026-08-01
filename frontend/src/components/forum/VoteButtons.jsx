import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiArrowUp, FiArrowDown, FiMessageSquare, FiCheckCircle } from 'react-icons/fi';
import api, { extractError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/format';

const VoteButtons = ({ item, onVote, showAnswer, isAnswer, onToggleAnswer, isAuthor }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [voting, setVoting] = useState(false);

  const vote = async (value) => {
    if (!user) {
      toast.error('Please sign in to vote.');
      navigate('/login');
      return;
    }
    if (voting) return;
    setVoting(true);
    try {
      const data = await api.put(`/forum/posts/${item._id}/vote`, { value });
      onVote?.(data);
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button
        onClick={() => vote(1)}
        className={cn(
          'rounded-lg p-1.5 transition-all active:scale-90',
          item.userVote === 1 ? 'bg-brand-50 text-brand-600' : 'text-slate-300 hover:text-brand-500'
        )}
        aria-label="Upvote"
      >
        <FiArrowUp className="h-5 w-5" />
      </button>
      <span className={cn('min-w-6 text-center text-sm font-bold', item.score > 0 ? 'text-brand-600' : item.score < 0 ? 'text-rose-500' : 'text-slate-400')}>
        {item.score}
      </span>
      <button
        onClick={() => vote(-1)}
        className={cn(
          'rounded-lg p-1.5 transition-all active:scale-90',
          item.userVote === -1 ? 'bg-rose-50 text-rose-500' : 'text-slate-300 hover:text-rose-500'
        )}
        aria-label="Downvote"
      >
        <FiArrowDown className="h-5 w-5" />
      </button>
      {showAnswer && (
        <button
          onClick={onToggleAnswer}
          disabled={!isAuthor}
          className={cn(
            'mt-1.5 rounded-lg p-1.5 transition-all',
            isAnswer ? 'text-teal-500' : 'text-slate-300',
            isAuthor ? 'hover:text-teal-600' : 'cursor-default opacity-50'
          )}
          title={isAuthor ? 'Toggle accepted answer' : 'Only the post author can mark answers'}
          aria-label="Toggle accepted answer"
        >
          <FiCheckCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default VoteButtons;
