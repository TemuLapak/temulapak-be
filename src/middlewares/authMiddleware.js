import { supabase } from '../config/supabase.js';
import { ProfileModel } from '../models/profileModel.js';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi tidak ditemukan (format: Bearer <token>)'
      });
    }

    const token = authHeader.split(' ')[1]?.trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi kosong'
      });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authData?.user) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak valid atau sudah kedaluwarsa'
      });
    }

    const authUser = authData.user;

    const profile = await ProfileModel.findById(authUser.id).catch(() => null);

    req.user = {
      id: authUser.id,
      email: authUser.email,
      name: profile?.name ?? authUser.user_metadata?.name ?? null,
      phone: profile?.phone ?? null,
      role: profile?.role ?? 'msme', 
      profile
    };

    next();
  } catch (err) {
    next(err);
  }
}