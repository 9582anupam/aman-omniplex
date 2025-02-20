import React, { useState } from 'react';
import Image from 'next/image';
import styles from './Bgremover.module.css';
import SpinnerWhite from '../SpinnerWhite/SpinnerWhite';

const BackgroundRemover = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }
      
      setSelectedImage(file);
      setProcessedImage(null); // Clear any previous processed image
      setError(null);
    }
  };

  const removeBackground = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64 = base64String.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedImage);
      });

      const response = await fetch('/api/Bgremover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_base64: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process image');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setProcessedImage(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove background. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Background Remover</h1>
      </div>
      
      <div className={styles.uploadSection}>
        <div className={styles.inputGroup}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className={styles.fileInput}
          />
          
          <button
            onClick={removeBackground}
            disabled={!selectedImage || loading}
            className={styles.button}
          >
            {loading ? (
              <>
                <SpinnerWhite />
                Processing...
              </>
            ) : (
              'Remove Background'
            )}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
      </div>

      {(selectedImage || processedImage) && (
        <div className={styles.imageContainer}>
          {selectedImage && (
            <div className={styles.imageWrapper}>
              <h3>Original Image</h3>
              <div className={styles.imageContent}>
                <Image
                  src={URL.createObjectURL(selectedImage)}
                  alt="Original"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          {processedImage && (
            <div className={styles.imageWrapper}>
              <h3>Processed Image</h3>
              <div className={styles.imageContent}>
                <Image
                  src={processedImage}
                  alt="Processed"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <a
                href={processedImage}
                download="processed-image.png"
                className={styles.downloadButton}
              >
                Download Image
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BackgroundRemover;