import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import Modal from 'react-modal';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (croppedImageFile: File) => void;
  imageFile: File;
}

// Set the app element for accessibility
if (typeof window !== 'undefined') {
  Modal.setAppElement(document.getElementById('root') || document.body);
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  isOpen,
  onClose,
  onSave,
  imageFile,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const [saving, setSaving] = useState(false);

  // Load image when modal opens
  React.useEffect(() => {
    if (isOpen && imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [isOpen, imageFile]);

  // Set initial crop when image loads
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // Create a square crop in the center
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 80,
        },
        1, // aspect ratio 1:1 for square
        width,
        height
      ),
      width,
      height
    );
    
    setCrop(crop);
  }, []);

  // Convert canvas to file
  const canvasToFile = (canvas: HTMLCanvasElement, fileName: string): Promise<File> => {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(file);
        }
      }, 'image/jpeg', 0.9);
    });
  };

  // Generate cropped image
  const getCroppedImg = useCallback(
    async (crop: PixelCrop): Promise<File | null> => {
      if (!imgRef.current || !crop.width || !crop.height) {
        return null;
      }

      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return null;
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Set canvas size to crop size (square for profile picture)
      const cropSize = Math.min(crop.width, crop.height);
      canvas.width = cropSize * scaleX;
      canvas.height = cropSize * scaleY;

      // Apply transformations
      ctx.setTransform(scale, 0, 0, scale, 0, 0);

      if (rotate) {
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotate * Math.PI) / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
      }

      // Draw the cropped image
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      return canvasToFile(canvas, 'profile-picture.jpg');
    },
    [scale, rotate]
  );

  const handleSave = async () => {
    if (!completedCrop) return;

    setSaving(true);
    try {
      const croppedFile = await getCroppedImg(completedCrop);
      if (croppedFile) {
        onSave(croppedFile);
        onClose();
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setSaving(false);
    }
  };

  const modalStyles = {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '0',
      border: 'none',
      borderRadius: '12px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      overflow: 'hidden',
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={modalStyles}
      contentLabel="Edit Profile Picture"
    >
      <div className="bg-white dark:bg-gray-800 w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Profile Picture
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Editor */}
        <div className="p-4">
          {imageSrc && (
            <div className="space-y-4">
              {/* Crop Area */}
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={imageSrc}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxWidth: '400px',
                      maxHeight: '400px',
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Zoom: {Math.round(scale * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rotate: {rotate}°
                  </label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    value={rotate}
                    onChange={(e) => setRotate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!completedCrop || saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Picture'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}; 