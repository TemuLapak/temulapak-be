import { supabase } from '../config/supabase.js';
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        email_confirm:true,
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
        {
          user: data.user,
          session: data.session
        },
        'Registrasi berhasil',
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw createHttpError(401, error.message);
      }

      return sendSuccess(res, {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        user: data.user
      }, 'Login berhasil');
    } catch (err) {
      next(err);
    }
  }
};