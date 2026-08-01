import { Link } from 'react-router-dom';
import { FiEye, FiMessageSquare } from 'react-icons/fi';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import { timeAgo, truncate } from '../../utils/format';

const PostCard = ({ post }) => (
  <Link
    to={`/forum/post/${post._id}`}
    className="card-hover flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card"
  >
    <div className="flex shrink-0 flex-col items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-2">
      <span className={`text-lg font-extrabold ${post.score > 0 ? 'text-brand-600' : 'text-slate-400'}`}>
        {post.score}
      </span>
      <span className="text-[10px] font-semibold uppercase text-slate-400">votes</span>
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-bold text-slate-800 transition-colors hover:text-brand-700 line-clamp-2">
          {post.title}
        </h3>
        {post.pinned && <Badge tone="amber" className="shrink-0">📌 Pinned</Badge>}
      </div>

      <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
        {truncate(post.body?.replace(/<[^>]*>/g, ''), 160)}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {(post.tags || []).map((t) => (
          <span key={t} className="chip bg-brand-50 text-brand-600">#{t}</span>
        ))}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <Avatar name={post.author?.name} src={post.author?.avatar} size="xs" />
          <span className="font-semibold text-slate-600">{post.author?.name || 'Deleted user'}</span>
          {post.author?.role === 'instructor' && <Badge tone="teal" className="!px-2 !py-0.5 text-[10px]">Instructor</Badge>}
        </span>
        <span>{timeAgo(post.createdAt)}</span>
        <span className="flex items-center gap-1"><FiMessageSquare className="h-3.5 w-3.5" /> {post.commentCount} replies</span>
        <span className="flex items-center gap-1"><FiEye className="h-3.5 w-3.5" /> {post.views}</span>
      </div>
    </div>
  </Link>
);

export default PostCard;
