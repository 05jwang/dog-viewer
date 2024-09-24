import React from "react";
import BreedSelectorTree from "./BreedSelectorTree";
import ShufflePhotosToggle from "./ShufflePhotosToggle";
import ImageSizeSelector from "./ImageSizeSelector";

const Sidebar: React.FC = () => {
  return (
    <div className="sidebar">
      <BreedSelectorTree />
      <ShufflePhotosToggle />
      <ImageSizeSelector />
    </div>
  );
};

export default Sidebar;
