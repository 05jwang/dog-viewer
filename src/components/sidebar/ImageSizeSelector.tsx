import React from "react";
import { Slider, Card, Label } from "@blueprintjs/core";

import { useRecoilState } from "recoil";
import { imageSizeState } from "../../recoil/atoms";

const ImageSizeSelector: React.FC = () => {
  const [imageSize, setImageSize] = useRecoilState<number>(imageSizeState);

  /**
   * Handles the change of the image size.
   * @param value - The new image size value.
   */
  const handleImageSizeChange = (value: number) => {
    setImageSize(value);
  };
  return (
    <Card style={{ marginTop: "20px" }}>
      <Label>
        Image Size
        <Slider
          min={50}
          max={300}
          stepSize={10}
          labelStepSize={50}
          onChange={handleImageSizeChange}
          value={imageSize}
        />
      </Label>
    </Card>
  );
};

export default ImageSizeSelector;
