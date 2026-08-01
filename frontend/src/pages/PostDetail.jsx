import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';
import { FiEye, FiMessageSquare, FiSend, FiTrash2, FiEdit2, FiCheckCircle } from 'react-icons/fi';
import api, { extractError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { Textarea } from '../components/ui/Field';
import VoteButtons from '../components/forum/VoteButtons';
import { timeAgo, cn } from '../utils/format';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editBody, setEditBody] = useState('');
  const replyRef = useRef(null);

  const load = () => {
    api
      .get(`/forum/posts/${id}`)
      .then((d) => {
        setPost(d.post);
        setComments(d.comments);
      })
      .catch((err) => {
        toast.error(extractError(err, 'Post not found.'));
        navigate('/forum');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/forum/posts/${id}/comments`, { body: reply.trim() });
      setReply('');
      toast.success('Reply posted!');
      load();
    } catch (err) {
      toast.error(extractError(err));
    } finally {
      setSending(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post and all its replies?')) return;
    try {
      await api.del(`/forum/posts/${id}`);
      toast.success('Post deleted.');
      navigate('/forum');
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this reply?')) return;
    try {
      await api.del(`/forum/comments/${commentId}`);
      toast.success('Reply deleted.');
      load();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleSaveEdit = async (commentId) => {
    try {
      await api.put(`/forum/comments/${commentId}`, { body: editBody });
      setEditing(null);
      toast.success('Reply updated.');
      load();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  const handleToggleAnswer = async (commentId) => {
    try {
      await api.put(`/forum/comments/${commentId}/answer`);
      load();
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  if (loading) return <PageLoader label="Loading discussion…" />;
  if (!post) return null;

  const isAuthor = user && (user._id === post.author?._id || user.role === 'admin');
  const isCommentAuthor = (authorId) => user && (user._id === authorId || user.role === 'admin');

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {(post.tags || []).map((t) => (
            <Badge key={t} tone="indigo">#{t}</Badge>
          ))}
          {post.pinned && <Badge tone="amber">📌 Pinned</Badge>}
        </div>

        <h1 className="font-display mt-4 text-2xl font-extrabold leading-snug text-slate-800 sm:text-3xl">
          {post.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <Avatar name={post.author?.name} src={post.author?.avatar} size="sm" />
            <span className="font-semibold text-slate-600">{post.author?.name || 'Deleted user'}</span>
            {post.author?.role === 'instructor' && <Badge tone="teal" className="!px-2 !py-0.5 text-[10px]">Instructor</Badge>}
          </span>
          <span>{timeAgo(post.createdAt)}</span>
          <span className="flex items-center gap-1"><FiEye className="h-3.5 w-3.5" /> {post.views} views</span>
        </div>

        <div className="mt-5 flex gap-4">
          <VoteButtons
            item={post}
            onVote={(d) => setPost((p) => ({ ...p, score: d.score, userVote: d.userVote }))}
          />
          <div className="min-w-0 flex-1">
            <div
              className="rich-content text-[15px]"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.body) }}
            />
            {isAuthor && (
              <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                <Button variant="secondary" size="sm" onClick={() => navigate('/forum')}>
                  <FiEdit2 className="h-3.5 w-3.5" /> Edit post
                </Button>
                <Button variant="danger" size="sm" onClick={handleDeletePost}>
                  <FiTrash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-800">
          <FiMessageSquare className="h-5 w-5 text-brand-600" />
          {comments.length} repl{comments.length === 1 ? 'y' : 'ies'}
        </h2>

        {comments.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
            No replies yet — share your knowledge!
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {comments.map((c) => (
              <div
                key={c._id}
                className={cn(
                  'rounded-2xl border bg-white p-5 shadow-card',
                  c.isAnswer ? 'border-teal-200 ring-1 ring-teal-100' : 'border-slate-100'
                )}
              >
                <div className="flex gap-4">
                  <VoteButtons
                    item={c}
                    onVote={(d) =>
                      setComments((prev) => prev.map((x) => (x._id === c._id ? { ...x, score: d.score, userVote: d.userVote } : x)))
                    }
                    showAnswer
                    isAnswer={c.isAnswer}
                    isAuthor={isAuthor}
                    onToggleAnswer={() => handleToggleAnswer(c._id)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Avatar name={c.author?.name} src={c.author?.avatar} size="xs" />
                      <span className="text-sm font-bold text-slate-700">{c.author?.name || 'Deleted user'}</span>
                      <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                      {c.isAnswer && (
                        <Badge tone="teal" className="!px-2 !py-0.5 text-[10px]">
                          <FiCheckCircle className="mr-1 h-3 w-3" /> Accepted answer
                        </Badge>
                      )}
                    </div>
                    {editing === c._id ? (
                      <div className="mt-3">
                        <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} />
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" onClick={() => handleSaveEdit(c._id)}>Save</Button>
                          <Button variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="rich-content mt-2 !text-sm"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(c.body) }}
                      />
                    )}
                    {isCommentAuthor(c.author?._id) && editing !== c._id && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => {
                            setEditing(c._id);
                            setEditBody(c.body);
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors hover:text-brand-600"
                        >
                          <FiEdit2 className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors hover:text-rose-500"
                        >
                          <FiTrash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {user ? (
          <form onSubmit={handleReply} className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2.5">
              <Avatar name={user.name} src={user.avatar} size="sm" />
              <p className="text-sm font-bold text-slate-700">Reply as {user.name}</p>
            </div>
            <Textarea
              className="mt-3"
              placeholder="Share your answer or follow-up question…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              ref={replyRef}
            />
            <Button type="submit" size="md" className="mt-3" loading={sending}>
              <FiSend className="h-4 w-4" /> Post reply
            </Button>
          </form>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-card">
            <p className="text-sm text-slate-500">
              <Button to="/login" state={{ from: `/forum/post/${id}` }} size="sm" className="mr-1">
                Sign in
              </Button>
              to join the discussion.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetail;
