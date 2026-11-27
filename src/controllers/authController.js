import { supabase, supabaseAuth } from '../config/supabase.js';
import { sendSuccess } from '../utils/responHelper.js';
import { createHttpError } from '../utils/httpError.js';
import { ROLES, ROLE_VALUES } from '../utils/enum.js';

export const AuthController = {
  async register(req, res, next) {
    try {
      const { email, password, name, phone, role } = req.body;

      if (!email || !password || !name) {
        throw createHttpError(400, 'email, password, dan name wajib diisi');
      }

      const selectedRole = role || ROLES.MSME;
      if (!ROLE_VALUES.includes(selectedRole)) {
        throw createHttpError(400, 'Role tidak valid');
      }

      // Pakai admin.createUser agar email_confirm: true & user_metadata terbaca oleh trigger
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          phone: phone || null,
          role: selectedRole
        }
      });

      if (error) {
        throw createHttpError(400, error.message);
      }

      if (data?.user?.id) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
          phone: phone || null,
          role: selectedRole
        });
      }

      return sendSuccess(
        res,
        'Registrasi berhasil',
        { user: data.user },
        201
      );
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw createHttpError(400, 'email dan password wajib diisi');
      }

      const { data, error } = await supabaseAuth.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw createHttpError(401, error.message);
      }

      return sendSuccess(res, 'Login berhasil', {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user: data.user
      });
    } catch (err) {
      next(err);
    }
  }
};