import React, { useCallback, useState } from "react";
import { Button, View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

function YouTubeVideoPlayer({ videoURL }: { videoURL: string }) {
  const [playing, setPlaying] = useState(false);
  console.log(videoURL);
  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  return (
    <View>
      <YoutubePlayer
        height={200}
        play={playing}
        videoId={"wOOzajNBQ-M"}
        onChangeState={onStateChange}
      />
      <Button title={playing ? "Pause" : "Play"} onPress={togglePlaying} />
    </View>
  );
}

export default YouTubeVideoPlayer;
