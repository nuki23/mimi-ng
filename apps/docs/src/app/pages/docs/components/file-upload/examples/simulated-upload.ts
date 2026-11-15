import type { MimiFileStatus } from '@/components/ui/file-upload';

/** El estado de una subida, el que la app pasa a cada `<mimi-file-item>`. */
export interface Upload {
  status: MimiFileStatus;
  progress: number;
  error?: string;
}

/**
 * Subida simulada: avanza de a 20 % cada 400 ms. Los nombres con «error» fallan la primera vez
 * (`failed` guarda los que ya fallaron, para que Reintentar funcione). Devuelve cómo detenerla.
 * En tu app, aquí va tu petición HTTP con su progreso.
 */
export function simulateUpload(
  file: File,
  failed: Set<File>,
  onChange: (upload: Upload) => void,
): () => void {
  let progress = 0;
  onChange({ status: 'uploading', progress });
  const timer = setInterval(() => {
    progress += 20;
    if (file.name.includes('error') && !failed.has(file) && progress >= 60) {
      failed.add(file);
      clearInterval(timer);
      onChange({ status: 'error', progress, error: 'Se cortó la conexión.' });
      return;
    }
    if (progress >= 100) clearInterval(timer);
    onChange({ status: progress >= 100 ? 'done' : 'uploading', progress });
  }, 400);
  return () => clearInterval(timer);
}
