// lib/cloudinary.js — single place for Cloudinary config + buffer uploads
import { v2 as cloudinary } from 'cloudinary';
import { HttpError } from './asyncHandler.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

/** Uploads a buffer and resolves to Cloudinary's secure_url. */
export const uploadBuffer = (buffer, options) => {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(new HttpError(503, 'UploadsUnavailable', 'File uploads are not configured on this server.'));
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
    stream.end(buffer);
  });
};

/** True only for https URLs on *our* Cloudinary account (optionally within a folder). */
export const isOwnCloudinaryUrl = (url, folder = '') => {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud || typeof url !== 'string') return false;
  const prefix = `https://res.cloudinary.com/${cloud}/`;
  if (!url.startsWith(prefix)) return false;
  return folder ? url.includes(`/${folder}/`) : true;
};

// Raster images only — SVG can carry script and is rejected everywhere.
export const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
export const imageFileFilter = (req, file, cb) => {
  if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
  else cb(new HttpError(400, 'InvalidFile', 'Only JPG, PNG or WebP images are allowed.'));
};
