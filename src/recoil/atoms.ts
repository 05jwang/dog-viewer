import { atom } from "recoil";

/**
 * Represents the state of selected breeds.
 */
const breedsState = atom({
  key: "breedsState",
  default: [] as string[],
});

/**
 * Represents the state of the shuffle photos toggle.
 */
const shufflePhotoState = atom({
  key: "shufflePhotoState",
  default: false,
});

/**
 * Represents the state of the image size selector.
 */
const imageSizeState = atom({
  key: "imageSizeState",
  default: 150,
});

/**
 * Represents the state of the theme.
 */
const themeState = atom({
  key: "themeState",
  default: true,
});

export { breedsState, shufflePhotoState, imageSizeState, themeState };
