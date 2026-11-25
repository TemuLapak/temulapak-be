export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Terjadi kesalahan pada server';

  if (err?.code === '23505') {
    statusCode = 409;
    message = 'Data duplikat atau sudah terdaftar';
  }

  if (err?.code === '23503') {
    statusCode = 400;
    message = 'Data referensi terkait tidak ditemukan';
  }

  if (err?.code === '23514') {
    statusCode = 400;
    message = 'Nilai input melanggar aturan validasi database';
  }

  if (err?.code === '22P02') {
    statusCode = 400;
    message = 'Format UUID tidak valid atau nilai pilihan (enum) tidak sesuai';
  }

  if (err?.code === 'PGRST116') {
    statusCode = 404;
    message = 'Data tidak ditemukan';
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorHandler]:', err);
  }

  const responseBody = {
    success: false,
    message
  };

  if (process.env.NODE_ENV !== 'production' && err?.details) {
    responseBody.details = err.details;
  }

  return res.status(statusCode).json(responseBody);
}