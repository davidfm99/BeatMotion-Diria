import React, { useCallback, useState } from "react";
import { View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

function YouTubeVideoPlayer({ videoURL }: { videoURL: string }) {
  const [playing, setPlaying] = useState(false);
  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  return (
    <View>
      <YoutubePlayer
        height={200}
        play={playing}
        videoId={"wOOzajNBQ-M"}
        onChangeState={onStateChange}
      />
    </View>
  );
}

export default YouTubeVideoPlayer;
