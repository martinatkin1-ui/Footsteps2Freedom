
import React, { useState } from 'react';

interface SocialShareProps {
  title: string;
  text: string;
  url?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onShareSuccess?: () => void;
}

const SocialShare: React.FC<SocialShareProps> = ({ title, text, url, variant = 'secondary', onShareSuccess }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Determine the URL to share
    const rawUrl = url || window.location.href;
    let validUrl: string | undefined = undefined;

    /**
     * The Web Share API (navigator.share) requires the 'url' field to be a valid absolute URL.
     * In some environments (development, local previews, or certain PWA states), 
     * window.location.href might contain non-standard schemes or characters that trigger an 'Invalid URL' error.
     */
    try {
      const urlObj = new URL(rawUrl);
      // We strictly check for http/https to ensure broad compatibility with mobile share sheets
      if (urlObj.protocol.startsWith('http')) {
        validUrl = urlObj.toString();
      }
    } catch (e) {
      // Fallback: If URL construction fails, we proceed without a 'url' property to avoid crashing the share sheet
      validUrl = undefined;
    }

    const shareData: ShareData = {
      title,
      text,
      ...(validUrl ? { url: validUrl } : {}),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        if (onShareSuccess) onShareSuccess();
      } catch (err) {
        // AbortError happens when a user cancels the share - we ignore this gracefully.
        if ((err as Error).name !== 'AbortError') {
          console.error('Web Share failed, reverting to clipboard:', err);
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      const shareUrl = url || window.location.href;
      const fullText = `${title}\n\n${text}\n\nShared via Footpath Guide: ${shareUrl}`;
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (onShareSuccess) onShareSuccess();
    } catch (err) {
      console.error('Failed to copy text to clipboard:', err);
    }
  };

  const getBtnStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20';
      case 'ghost':
        return 'bg-transparent text-slate-400 hover:text-teal-600';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700';
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`group flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-teal-500/30 ${getBtnStyles()}`}
      aria-label="Share this achievement"
    >
      {copied ? (
        <>
          <span className="text-emerald-500">✓</span>
          <span className="text-emerald-600 dark:text-emerald-400">Copied to Clipboard</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span>Share via...</span>
        </>
      )}
    </button>
  );
};

export default SocialShare;
