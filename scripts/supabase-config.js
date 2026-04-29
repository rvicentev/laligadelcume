/**
 * @fileoverview Configuración e inicialización del cliente de Supabase.
 * * ATENCIÓN: En entornos de producción reales con *bundlers* (Vite, Webpack),
 * estas credenciales deben inyectarse mediante variables de entorno (.env).
 * Si este proyecto es estático (HTML/JS puro) y se aloja en un repositorio público,
 * asegúrate de tener unas políticas RLS (Row Level Security) muy estrictas en Supabase,
 * ya que estas claves serán visibles en el código fuente del navegador del cliente.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'TU_SUPABASE_URL_AQUI'
const supabaseKey = 'TU_SUPABASE_ANON_KEY_AQUI'

export const supabase = createClient(supabaseUrl, supabaseKey)