import React, { useState, useEffect } from "react";
import { Spinner, NonIdealState } from "@blueprintjs/core";
import { useRecoilState } from "recoil";
import { breedsState, shufflePhotoState, imageSizeState } from "../recoil/atoms";
import { Photo, RowsPhotoAlbum } from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";

import FullScreen from "yet-another-react-lightbox/plugins/fullscreen";
import Download from "yet-another-react-lightbox/plugins/download";
import Share from "yet-another-react-lightbox/plugins/share";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

const PhotoGallery: React.FC = () => {
  const [index, setIndex] = useState(-1);
  const [photoAlbum, setPhotoAlbum] = useState<Photo[]>([]);
  const [selectedBreeds] = useRecoilState(breedsState);
  const [shufflePhotos] = useRecoilState(shufflePhotoState);
  const [targetRowHeight] = useRecoilState(imageSizeState);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch images for selected breeds and update the photo album state whenever the selected breeds change.
   */
  useEffect(() => {
    setPhotoAlbum([]);
    selectedBreeds.map((breed) => {
      if (breed == null) {
        return;
      }
      if (breed.indexOf("/") !== -1) {
        const parentBreed = breed.split("/")[0];
        if (selectedBreeds.includes(parentBreed)) {
          return;
        }
      }
      setLoading(true);
      fetch(`https://dog.ceo/api/breed/${breed}/images`)
        .then((response) => response.json())
        .then((data) => {
          const photoPromises = data.message.map((url: string) => {
            return new Promise<Photo>((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = () => {
                resolve({
                  src: url,
                  alt: breed,
                  width: img.naturalWidth, // Get the actual width of the image
                  height: img.naturalHeight, // Get the actual height of the image
                  title: breed,
                });
              };
            });
          });

          // Wait for all images to load and then update the photo album state
          Promise.all(photoPromises).then((photos) => {
            photos.map((photo, index) => {
              photo.label = `${breed}-${index}`;
            });
            setPhotoAlbum((prev) => [...prev, ...photos].sort((a, b) => a.label.localeCompare(b.label)));
            setLoading(false);
          });
        })
        .catch((error) => {
          setLoading(false);
          console.error(error);
        });
    });
  }, [selectedBreeds]);

  useEffect(() => {
    console.log(photoAlbum);
  }, [photoAlbum]);

  /**
   * Shuffle the photo album whenever the shufflePhotos state changes, otherwise sort the photo album by
   * breed, then by original index.
   */
  useEffect(() => {
    if (shufflePhotos) {
      setPhotoAlbum((prev) => {
        return [...prev].sort(() => Math.random() - 0.5);
      });
    } else {
      setPhotoAlbum((prev) => {
        return [...prev].sort((a, b) => {
          const labelA = a.label || "";
          const labelB = b.label || "";
          return labelA.localeCompare(labelB);
        });
      });
    }
  }, [shufflePhotos]);
  return (
    <div className="photo-gallery">
      {loading && (
        <Spinner
          size={100}
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />
      )}
      {!loading && photoAlbum.length === 0 && (
        <NonIdealState icon="search" title="No images found" description="Please select a breed from the sidebar" />
      )}
      <div style={{}}>
        <RowsPhotoAlbum
          photos={photoAlbum}
          targetRowHeight={targetRowHeight}
          onClick={({ index }) => setIndex(index)}
          spacing={5}
        />
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)} // Close lightbox
        slides={photoAlbum}
        index={index}
        plugins={[FullScreen, Download, Share, Slideshow, Thumbnails, Zoom]}
      />
    </div>
  );
};

export default PhotoGallery;
