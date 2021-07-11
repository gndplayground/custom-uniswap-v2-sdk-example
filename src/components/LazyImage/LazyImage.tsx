import React from "react";
import {
  LazyLoadImage,
  LazyLoadImageProps,
} from "react-lazy-load-image-component";

export interface LazyImageProps extends LazyLoadImageProps {
  src: string;
  alt: string;
}

function LazyImage(props: LazyImageProps) {
  const { src, alt, placeholder, ...other } = props;

  const [loadError, setLoadError] = React.useState(false);

  function handleImageError() {
    setLoadError(true);
  }

  if (placeholder && loadError) {
    return <React.Fragment>{placeholder}</React.Fragment>;
  }

  return (
    <LazyLoadImage
      onError={handleImageError}
      src={src}
      alt={alt}
      placeholder={placeholder}
      {...other}
    />
  );
}

export default LazyImage;
