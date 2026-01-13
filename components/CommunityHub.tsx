
import React, { useState } from 'react';
import { useRecoveryStore } from '../store';
import { screenCommunityContent } from '../geminiService';
import { CommunityPost, PostComment } from '../types';

const CommunityHub: React.FC = () => {
  const { communityPosts, addCommunityPost, reactToPost, addComment, user, sobriety } = useRecoveryStore();
  const [showCreate, setShowCreate] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<CommunityPost['type']>('glimmer');
  const [isAnon, setIsAnon] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [safetyFeedback, setSafetyFeedback] = useState<string | null>(null);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleCreatePost = async () => {
    if (!postContent.trim() || isValidating) return;
    
    setIsValidating(true);
    setSafetyFeedback(null);

    // AI Safety Pre-screening
    const safety = await screenCommunityContent(postContent);
    
    if (!safety.isSafe) {
      setSafetyFeedback(safety.feedback);
      setIsValidating(false);
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
      return;
    }

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: isAnon ? 'Anonymous Traveller' : user?.name || 'Brave Traveller',
      authorTotem: isAnon ? undefined : sobriety.trueSelfTotem,
      isAnonymous: isAnon,
      content: postContent,
      type: postType,
      reactions: { footstep: 0, love: 0, celebrate: 0 },
      comments: [],
      date: new Date().toISOString()
    };

    addCommunityPost(newPost);
    setPostContent('');
    setIsValidating(false);
    setShowCreate(false);
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim()) return;
    const newComment: PostComment = {
      id: Date.now().toString(),
      author: 'Anonymous Traveller',
      text: commentText,
      date: new Date().toISOString()
    };
    addComment(postId, newComment);
    setCommentText('');
    setCommentingOn(null);
  };

  return (
    <div className="space-y-10 pb-32 animate-in fade-in duration-700">
      {/* Header & Create Trigger */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg">👥</span>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em]">Collective Strength</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Community Glimmers</h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Celebrate small wins and share the light of your True-Self path.</p>
        </div>
        <button 
          onClick={() => { setShowCreate(true); setSafetyFeedback(null); }}
          className="bg-indigo-600 text-white px-10 py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-3"
        >
          <span>✨</span> Share a Glimmer
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-12 max-w-xl w-full shadow-2xl space-y-8 animate-in zoom-in-95">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Share your progress</h3>
                <button onClick={() => setShowCreate(false)} className="text-slate-400 font-bold p-2">✕</button>
             </div>

             <div className="flex gap-2">
                {(['glimmer', 'milestone', 'reflection'] as const).map(t => (
                  <button 
                    key={t}
                    onClick={() => { setPostType(t); setSafetyFeedback(null); }}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${postType === t ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}
                  >
                    {t}
                  </button>
                ))}
             </div>

             {safetyFeedback && (
               <div className="p-6 bg-rose-50 dark:bg-rose-950/40 rounded-3xl border-2 border-rose-100 dark:border-rose-900/50 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="text-xl">🛡️</span>
                     <h4 className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Sanctuary Shield</h4>
                  </div>
                  <p className="text-sm font-bold text-rose-800 dark:text-rose-200 italic leading-relaxed">"{safetyFeedback}"</p>
               </div>
             )}

             <div className="relative">
                <textarea 
                  autoFocus
                  value={postContent}
                  onChange={(e) => { setPostContent(e.target.value); setSafetyFeedback(null); }}
                  placeholder="What's your success today? No win is too small."
                  className={`w-full bg-slate-50 dark:bg-slate-800 border-2 rounded-[32px] p-8 h-48 focus:ring-4 focus:ring-indigo-500/10 text-slate-800 dark:text-white text-lg font-medium leading-relaxed resize-none shadow-inner transition-all ${safetyFeedback ? 'border-rose-300' : 'border-transparent'}`}
                />
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => setIsAnon(!isAnon)}
                    className={`w-12 h-6 rounded-full transition-all relative ${isAnon ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                   >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAnon ? 'left-7' : 'left-1'}`} />
                   </button>
                   <span className="text-[10px] font-black uppercase text-slate-400">Post Anonymously</span>
                </div>
                <button 
                  onClick={handleCreatePost}
                  disabled={!postContent.trim() || isValidating}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 flex items-center justify-center gap-3"
                >
                  {isValidating ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Scanning...
                    </>
                  ) : "Broadcast Glimmer"}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-3xl mx-auto space-y-8">
        {communityPosts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
             <div className="p-8 md:p-10 space-y-6">
                {/* Author Info */}
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      {post.isAnonymous ? (
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl grayscale opacity-50">👤</div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md">
                           <img src={post.authorTotem || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + post.author} className="w-full h-full object-cover" alt="Totem" />
                        </div>
                      )}
                      <div>
                         <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{post.author}</h4>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                   </div>
                   <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${post.type === 'milestone' ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-900' : 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-900'}`}>
                      {post.milestoneTag || post.type}
                   </span>
                </div>

                {/* Content */}
                <p className="text-lg md:text-xl text-slate-700 dark:text-slate-200 font-medium leading-relaxed italic px-2">
                  "{post.content}"
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4">
                   <button 
                    onClick={() => reactToPost(post.id, 'footstep')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 transition-all active:scale-90"
                   >
                      <span className="text-lg">👣</span>
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{post.reactions.footstep}</span>
                   </button>
                   <button 
                    onClick={() => reactToPost(post.id, 'love')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-300 transition-all active:scale-90"
                   >
                      <span className="text-lg">❤️</span>
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{post.reactions.love}</span>
                   </button>
                   <button 
                    onClick={() => reactToPost(post.id, 'celebrate')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-300 transition-all active:scale-90"
                   >
                      <span className="text-lg">🌟</span>
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{post.reactions.celebrate}</span>
                   </button>
                   <button 
                    onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                    className={`ml-auto px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${commentingOn === post.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
                   >
                      {post.comments.length} Comments
                   </button>
                </div>

                {/* Comment Section */}
                {commentingOn === post.id && (
                  <div className="space-y-6 animate-in slide-in-from-top-4 duration-300 pt-6 border-t border-slate-50 dark:border-slate-800">
                     <div className="space-y-4">
                        {post.comments.map(c => (
                          <div key={c.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400">{c.author}</span>
                                <span className="text-[8px] font-black text-slate-400 uppercase">{new Date(c.date).toLocaleDateString()}</span>
                             </div>
                             <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.text}</p>
                          </div>
                        ))}
                     </div>
                     <div className="relative">
                        <input 
                          autoFocus
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Offer a kind word..."
                          className="w-full bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 pr-16 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all dark:text-white"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentText.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-xl shadow-md disabled:bg-slate-100 disabled:text-slate-300 active:scale-90 transition-all"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                           </svg>
                        </button>
                     </div>
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>
      
      {/* Collective Glimmer Summary */}
      <div className="bg-indigo-900 rounded-[50px] p-12 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5 animate-pulse opacity-10" />
        <span className="text-5xl block animate-bounce">🌊</span>
        <h3 className="text-2xl font-black tracking-tight">The Collective Wave</h3>
        <p className="text-indigo-100 max-w-2xl mx-auto leading-relaxed font-medium italic">
          "When you share your success, you give someone else the map to reach theirs. We are all walking each other home."
        </p>
      </div>
    </div>
  );
};

export default CommunityHub;
