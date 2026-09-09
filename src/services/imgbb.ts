// Sube una imagen (en formato base64, como "data:image/png;base64,...") a ImgBB
// y regresa la URL pública donde queda guardada. Gratis para siempre, sin tarjeta.

const IMGBB_API_KEY = '5cd2ca86f2a03a910d6cf60ab5f2c860';

export async function uploadImageToImgBB(base64Data: string, filename?: string): Promise<string> {
  try {
    // ImgBB espera el base64 SIN el prefijo "data:image/...;base64,"
    const base64Only = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

    const formData = new FormData();
    formData.append('image', base64Only);
    if (filename) {
      formData.append('name', filename.replace(/\.[^/.]+$/, ''));
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success && result.data?.url) {
      return result.data.url as string;
    }

    console.error('Error de ImgBB:', result);
    throw new Error('ImgBB no pudo procesar la imagen');
  } catch (err) {
    console.error('Error subiendo imagen a ImgBB:', err);
    // Si falla la subida, regresamos la imagen tal cual (base64) para no romper el flujo,
    // aunque no es ideal guardar base64 en la base de datos a largo plazo.
    return base64Data;
  }
}
