import { VideoView, useVideoPlayer } from 'expo-video';
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { getYouTubeId } from '@/lib/video';

type Props = {
  url: string;
  paused?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onPause?: () => void;
  enableTimeTracking?: boolean;
};

export function LessonVideo({ url, paused, onTimeUpdate, onPause, enableTimeTracking }: Props) {
  const youtubeId = getYouTubeId(url);

  if (youtubeId) {
    return (
      <YouTubeVideo
        videoId={youtubeId}
        paused={paused}
        onTimeUpdate={onTimeUpdate}
        onPause={onPause}
        enableTimeTracking={enableTimeTracking}
      />
    );
  }

  return (
    <NativeVideo
      url={url}
      paused={paused}
      onTimeUpdate={onTimeUpdate}
      onPause={onPause}
      enableTimeTracking={enableTimeTracking}
    />
  );
}

function YouTubeVideo({
  videoId,
  paused,
  onTimeUpdate,
  onPause,
  enableTimeTracking,
}: {
  videoId: string;
  paused?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onPause?: () => void;
  enableTimeTracking?: boolean;
}) {
  const ref = useRef<WebView>(null);
  const html = useMemo(() => makeYouTubeHtml(videoId, Boolean(enableTimeTracking)), [videoId, enableTimeTracking]);

  useEffect(() => {
    ref.current?.injectJavaScript(
      `if (window.player) { window.player.${paused ? 'pauseVideo' : 'playVideo'}(); } true;`
    );
  }, [paused]);

  return (
    <WebView
      ref={ref}
      source={{ html, baseUrl: 'https://www.youtube.com' }}
      style={styles.video}
      allowsFullscreenVideo
      javaScriptEnabled
      mediaPlaybackRequiresUserAction={false}
      onMessage={(event) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data);
          if (msg.type === 'time') onTimeUpdate?.(Number(msg.currentTime) || 0);
          if (msg.type === 'pause') onPause?.();
        } catch {
          // Ignore non-JSON messages from the WebView.
        }
      }}
    />
  );
}

function NativeVideo({ url, paused, onTimeUpdate, onPause, enableTimeTracking }: Props) {
  const player = useVideoPlayer(url, (p) => {
    p.timeUpdateEventInterval = 0.5;
  });

  useEffect(() => {
    if (paused) player.pause();
    else if (paused === false) player.play();
  }, [paused, player]);

  useEffect(() => {
    if (!enableTimeTracking) return;
    const timeSub = player.addListener('timeUpdate', ({ currentTime }) => onTimeUpdate?.(currentTime));
    const playSub = player.addListener('playingChange', ({ isPlaying }) => {
      if (!isPlaying) onPause?.();
    });
    return () => {
      timeSub.remove();
      playSub.remove();
    };
  }, [enableTimeTracking, onPause, onTimeUpdate, player]);

  return <VideoView player={player} style={styles.video} contentFit="contain" nativeControls />;
}

export function VideoFrame({ children }: { children: React.ReactNode }) {
  return <View style={styles.frame}>{children}</View>;
}

function makeYouTubeHtml(videoId: string, trackTime: boolean) {
  return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      html, body, #player { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script>
      var player;
      function send(data) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          videoId: '${videoId}',
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
          events: {
            onStateChange: function(event) {
              if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) send({ type: 'pause' });
            }
          }
        });
        ${
          trackTime
            ? `setInterval(function() {
                if (player && player.getCurrentTime) send({ type: 'time', currentTime: player.getCurrentTime() });
              }, 500);`
            : ''
        }
      }
    </script>
  </body>
</html>`;
}

const styles = StyleSheet.create({
  frame: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000000' },
  video: { width: '100%', height: '100%' },
});
