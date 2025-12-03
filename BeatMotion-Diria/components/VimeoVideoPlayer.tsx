import type { ComponentType } from "react";
import React from "react";
import { View } from "react-native";
import * as VimeoImport from "react-native-vimeo-iframe";

const VimeoVideoPlayer = ({ videoId }: { videoId: string }) => {
  const VimeoComponent = ((VimeoImport as any).default ||
    VimeoImport) as ComponentType<any>;

  return (
    <View style={{ flex: 1 }}>
      <VimeoComponent
        videoId={videoId}
        autoplay={false}
        loop={false}
        controls={true}
        style={{ height: 200 }}
      />
    </View>
  );
};

export default VimeoVideoPlayer;
