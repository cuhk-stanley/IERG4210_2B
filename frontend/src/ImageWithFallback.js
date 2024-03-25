import React, { useState, useEffect } from 'react';

const ImageWithFallback = ({ imageName, altText }) => {
  const [src, setSrc] = useState('');
  const [error, setError] = useState(false);

  // List of fallback image formats to try if the exact match doesn't work
  const fallbackFormats = ['jpg', 'gif', 'png'];

  useEffect(() => {
    // Start by attempting to load the image with its original name and extension
    const formattedImageName = imageName.replace(/ /g, '_');
    const imagePath = `/image/${formattedImageName}`;
    loadExactImage(imagePath, formattedImageName, fallbackFormats, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageName]);

  const loadExactImage = (imagePath, formattedImageName, formats, attempt) => {
    const testImage = new Image();
    testImage.onload = () => setSrc(testImage.src); // Image loaded successfully
    testImage.onerror = () => {
      if (attempt < formats.length) {
        // Try the next format if the exact match fails
        loadImageInFormats(formattedImageName, formats, attempt);
      } else {
        // Set error if the exact match and all fallback formats have been tried and failed
        setError(true);
      }
    };
    testImage.src = imagePath;
  };

  const loadImageInFormats = (formattedImageName, formats, attempt) => {
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
