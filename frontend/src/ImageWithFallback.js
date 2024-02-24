import React, { useState, useEffect } from 'react';

const ImageWithFallback = ({ imageName, altText }) => {
  const [src, setSrc] = useState('');
  const [error, setError] = useState(false);

  // List of image formats to try
  const formats = ['jpg', 'gif', 'png'];

  useEffect(() => {
    if (!error) {
      // Convert spaces to underscores in the imageName to match the server's file naming convention
      const formattedImageName = imageName.replace(/ /g, '_');
      // Attempt to load the image in different formats
      loadImageInFormats(formattedImageName, formats, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, imageName]); // Added imageName as a dependency

  const loadImageInFormats = (formattedImageName, formats, attempt) => {
    if (attempt >= formats.length) {
      setError(true); // Set error if all formats have been tried and failed
      return;
    }

    const testImage = new Image();
    testImage.onload = () => setSrc(testImage.src); // Image loaded successfully
    testImage.onerror = () => loadImageInFormats(formattedImageName, formats, attempt + 1); // Try next format on error
    testImage.src = `/image/${formattedImageName}.${formats[attempt]}`;
  };

  return (
    <>
      {!error ? (
        <img src={src} alt={altText} />
      ) : (
        <p>Image not available</p> // Display fallback text when image can't be loaded
      )}
    </>
  );
};

export default ImageWithFallback;
