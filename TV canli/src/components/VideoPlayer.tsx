import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture2,
  Scaling,
  Heart,
  AlertTriangle,
  RotateCcw,
  Trash2,
  X,
  Tv,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Channel, AspectRatioMode } from '../types';

interface VideoPlayerProps {
  channel: Channel | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleFavorite: (id: string) => void;
  onMarkBroken: (id: string, isWorking: boolean) => void;
  onDeleteChannel: (id: string) => void;
  isFloating?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  onClose,
  onNext,
  onPrev,
  onToggleFavorite,
  onMarkBroken,
  onDeleteChannel,
  isFloating = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>('fit');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showControls, setShowControls] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Clear timeout utility
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3500);
  }, []);

  // Handle stream loading with Hls.js
  useEffect(() => {
    if (!channel) return;

    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');

    const video = videoRef.current;
    if (!video) return;

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = channel.streamUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        setHasError(false);
        onMarkBroken(channel.id, true);
        video.play().then(() => setIsPlaying(true)).catch(() => {
          // Autoplay blocked without user interaction or muted
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network error, attempting recovery...', data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media error, attempting recovery...', data);
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal unrecoverable HLS error:', data);
              hls.destroy();
              setHasError(true);
              setIsLoading(false);
              setErrorMessage('Yayım mənbəyinə qoşulmaq mümkün olmadı və ya server offline vəziyyətdədir.');
              onMarkBroken(channel.id, false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari/iOS support
      video.src = streamUrl;
      video.load();
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        setHasError(false);
        onMarkBroken(channel.id, true);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setHasError(true);
        setIsLoading(false);
        setErrorMessage('Video faylı açıla bilmədi.');
        onMarkBroken(channel.id, false);
      });
    } else {
      setHasError(true);
      setIsLoading(false);
      setErrorMessage('Brauzeriniz HLS canlı yayım texnologiyasını dəstəkləmir.');
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, retryCount, onMarkBroken]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
      setIsLoading(false);
      setHasError(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  // Track Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    setVolume(val);
    if (val === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not allowed:', err);
    }
  };

  const cycleAspectRatio = () => {
    if (aspectRatio === 'fit') {
      setAspectRatio('fill');
    } else if (aspectRatio === 'fill') {
      setAspectRatio('zoom');
    } else {
      setAspectRatio('fit');
    }
  };

  const retryPlayback = () => {
    setRetryCount((c) => c + 1);
  };

  if (!channel) return null;

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'fill':
        return 'object-fill w-full h-full';
      case 'zoom':
        return 'object-cover w-full h-full';
      case 'fit':
      default:
        return 'object-contain w-full h-full';
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => setShowControls(false)}
      className={`relative w-full overflow-hidden bg-black transition-all duration-300 ${
        isFloating
          ? 'fixed bottom-4 right-4 z-50 w-80 md:w-96 rounded-2xl shadow-2xl ring-2 ring-cyan-500/50'
          : 'rounded-2xl border border-white/10 shadow-2xl aspect-video max-h-[72vh]'
      }`}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        playsInline
        webkit-playsinline="true"
        className={`bg-black cursor-pointer transition-all duration-300 ${getAspectClass()}`}
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none z-20">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
            <Tv className="w-6 h-6 text-cyan-400 absolute animate-pulse" />
          </div>
          <p className="mt-4 text-sm font-medium text-cyan-300 animate-pulse tracking-wide">
            Yayım yüklənir...
          </p>
        </div>
      )}

      {/* In-Player Error State */}
      {hasError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-3 border border-red-500/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Kanal Açılmır</h3>
          <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
            {errorMessage || 'Bu kanal hazırda yayımlanmır və ya yayım ünvanı aktiv deyil.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={retryPlayback}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition cursor-pointer border border-white/10 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              Təkrar Yoxla
            </button>
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-sm transition cursor-pointer shadow-lg shadow-cyan-500/25"
            >
              <SkipForward className="w-4 h-4" />
              Növbəti Kanal
            </button>
            <button
              onClick={() => onDeleteChannel(channel.id)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-sm font-medium transition cursor-pointer border border-red-500/30"
            >
              <Trash2 className="w-4 h-4" />
              Kanalı Sil
            </button>
          </div>
        </div>
      )}

      {/* Overlay Header and Controls */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-4 pointer-events-none transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/80 via-black/40 to-transparent p-2 rounded-xl backdrop-blur-xs">
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              CANLI
            </div>

            {/* Channel Logo / Avatar */}
            {channel.logoUrl ? (
              <img
                src={channel.logoUrl}
                alt={channel.name}
                className="w-7 h-7 object-contain rounded-md bg-white/10 p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : null}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-base md:text-lg tracking-wide drop-shadow-md">
                  {channel.name}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                  {channel.quality || 'HD'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{channel.country}</span>
                <span>•</span>
                <span className="text-cyan-400">{channel.category}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Aspect, PiP, Favorite, Fullscreen, Close) */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {/* Favorite button */}
            <button
              onClick={() => onToggleFavorite(channel.id)}
              title={channel.isFavorite ? 'Sevimlilərdən çıxar' : 'Sevimlilərə əlavə et'}
              className={`p-2 rounded-xl transition cursor-pointer backdrop-blur-md ${
                channel.isFavorite
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Heart
                className="w-4 h-4 md:w-5 md:h-5"
                fill={channel.isFavorite ? 'currentColor' : 'none'}
              />
            </button>

            {/* Aspect Ratio Mode */}
            <button
              onClick={cycleAspectRatio}
              title={`Format: ${
                aspectRatio === 'fit' ? 'Orijinal' : aspectRatio === 'fill' ? 'Tam Ekran' : 'Zoom'
              }`}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer backdrop-blur-md flex items-center gap-1 text-xs"
            >
              <Scaling className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline uppercase text-[10px] font-bold">
                {aspectRatio}
              </span>
            </button>

            {/* PiP */}
            <button
              onClick={togglePiP}
              title="Pəncərədə izlə (Picture-in-Picture)"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer backdrop-blur-md"
            >
              <PictureInPicture2 className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              title="Tam Ekran"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer backdrop-blur-md"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 md:w-5 md:h-5" />
              ) : (
                <Maximize className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </button>

            {/* Close Player */}
            <button
              onClick={onClose}
              title="Pleyeri bağla"
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 transition cursor-pointer backdrop-blur-md"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>

        {/* Center Play/Pause & Channel Switch Controls */}
        <div className="flex items-center justify-center gap-6 pointer-events-auto my-auto">
          <button
            onClick={onPrev}
            title="Əvvəlki kanal (Sol ox)"
            className="p-3 md:p-4 rounded-full bg-black/60 hover:bg-cyan-500/20 hover:text-cyan-400 text-white/90 border border-white/15 transition transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md shadow-lg"
          >
            <SkipBack className="w-6 h-6 md:w-7 md:h-7" />
          </button>

          <button
            onClick={togglePlay}
            title={isPlaying ? 'Dayandır (Boşluq)' : 'Oynat (Boşluq)'}
            className="p-4 md:p-5 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition transform hover:scale-110 active:scale-95 cursor-pointer shadow-xl shadow-cyan-500/30"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 md:w-9 md:h-9 fill-current" />
            ) : (
              <Play className="w-7 h-7 md:w-9 md:h-9 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            title="Növbəti kanal (Sağ ox)"
            className="p-3 md:p-4 rounded-full bg-black/60 hover:bg-cyan-500/20 hover:text-cyan-400 text-white/90 border border-white/15 transition transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md shadow-lg"
          >
            <SkipForward className="w-6 h-6 md:w-7 md:h-7" />
          </button>
        </div>

        {/* Bottom Control Bar */}
        <div className="flex items-center justify-between pointer-events-auto bg-gradient-to-t from-black/85 via-black/50 to-transparent p-2.5 rounded-xl backdrop-blur-xs">
          {/* Volume Control */}
          <div className="flex items-center gap-2 group">
            <button
              onClick={toggleMute}
              title={isMuted ? 'Səsi aç' : 'Səsi bağla'}
              className="p-1.5 rounded-lg text-white/90 hover:text-cyan-400 transition cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-red-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 md:w-24 accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-white/20"
            />
            <span className="text-xs text-slate-400 font-mono w-8">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Status info & Keyboard hint */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>Stabil Bağlantı</span>
            </div>
            <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-3">
              <span className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">Space</span>
              <span>Oynat</span>
              <span className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-[10px]">F</span>
              <span>Tam Ekran</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
