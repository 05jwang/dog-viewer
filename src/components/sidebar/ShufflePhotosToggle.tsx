import React from "react";

import { Card, Switch } from "@blueprintjs/core";

import { useRecoilState } from "recoil";
import { shufflePhotoState } from "../../recoil/atoms";

const ShufflePhotosToggle: React.FC = () => {
  const [shufflePhotos, setShufflePhotos] = useRecoilState<boolean>(shufflePhotoState);

  const handleShuffleToggle = () => {
    setShufflePhotos(!shufflePhotos);
  };

  return (
    <Card style={{ marginTop: "20px" }}>
      <Switch checked={shufflePhotos} label="Shuffle Photos" alignIndicator="right" onChange={handleShuffleToggle} />
    </Card>
  );
};

export default ShufflePhotosToggle;
