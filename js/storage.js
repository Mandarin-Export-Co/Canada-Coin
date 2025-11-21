// js/storage.js
// Helpers para Firebase Storage - Canada Coin
// Gestión segura de subida y manejo de archivos

import { storage } from '../firebase-config.js';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js';

class StorageManager {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'application/pdf'
        ];
        this.allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
    }

    // Subida de archivo con progreso
    async uploadFile(file, path, metadata = {}) {
        return new Promise((resolve, reject) => {
            // Validar archivo antes de subir
            const validation = this.validateFile(file);
            if (!validation.isValid) {
                reject(new Error(validation.message));
                return;
            }

            // Crear referencia única
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop();
            const fileName = `${path}/${timestamp}.${fileExtension}`;
            const storageRef = ref(storage, fileName);

            // Metadata adicional
            const uploadMetadata = {
                contentType: file.type,
                customMetadata: {
                    originalName: file.name,
                    uploadDate: new Date().toISOString(),
                    size: file.size.toString(),
                    ...metadata
                }
            };

            // Iniciar subida
            const uploadTask = uploadBytesResumable(storageRef, file, uploadMetadata);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Progreso de subida
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    this.dispatchProgressEvent(progress, snapshot);
                },
                (error) => {
                    console.error('Error en subida:', error);
                    reject(this.handleStorageError(error));
                },
                async () => {
                    try {
                        // Obtener URL de descarga
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        
                        resolve({
                            success: true,
                            downloadURL,
                            fileName,
                            metadata: uploadTask.snapshot.metadata,
                            size: file.size,
                            originalName: file.name
                        });
                    } catch (error) {
                        reject(this.handleStorageError(error));
                    }
                }
            );
        });
    }

    // Subida múltiple de archivos
    async uploadMultipleFiles(files, path, metadata = {}) {
        const uploadPromises = files.map(file => 
            this.uploadFile(file, path, metadata)
        );

        try {
            const results = await Promise.allSettled(uploadPromises);
            
            const successful = [];
            const failed = [];

            results.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    successful.push(result.value);
                } else {
                    failed.push({
                        file: files[index].name,
                        error: result.reason.message
                    });
                }
            });

            return {
                successful,
                failed,
                total: files.length,
                successfulCount: successful.length,
                failedCount: failed.length
            };
        } catch (error) {
            throw this.handleStorageError(error);
        }
    }

    // Obtener URL de descarga
    async getDownloadURL(filePath) {
        try {
            const fileRef = ref(storage, filePath);
            return await getDownloadURL(fileRef);
        } catch (error) {
            throw this.handleStorageError(error);
        }
    }

    // Eliminar archivo
    async deleteFile(filePath) {
        try {
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
            return { success: true, message: 'Archivo eliminado' };
        } catch (error) {
            throw this.handleStorageError(error);
        }
    }

    // Listar archivos en un directorio
    async listFiles(path, maxResults = 100) {
        try {
            const listRef = ref(storage, path);
            const result = await listAll(listRef);
            
            const files = await Promise.all(
                result.items.map(async (itemRef) => {
                    try {
                        const url = await getDownloadURL(itemRef);
                        return {
                            name: itemRef.name,
                            fullPath: itemRef.fullPath,
                            downloadURL: url
                        };
                    } catch (error) {
                        console.warn('Error obteniendo URL para:', itemRef.name, error);
                        return {
                            name: itemRef.name,
                            fullPath: itemRef.fullPath,
                            downloadURL: null,
                            error: error.message
                        };
                    }
                })
            );

            return {
                files,
                prefixes: result.prefixes,
                totalCount: result.items.length
            };
        } catch (error) {
            throw this.handleStorageError(error);
        }
    }

    // Validación de archivos
    validateFile(file) {
        if (!file) {
            return { isValid: false, message: 'Archivo requerido' };
        }

        // Validar tipo MIME
        if (!this.allowedTypes.includes(file.type)) {
            return { 
                isValid: false, 
                message: `Tipo de archivo no permitido. Use: ${this.allowedExtensions.join(', ')}` 
            };
        }

        // Validar tamaño
        if (file.size > this.maxFileSize) {
            const maxSizeMB = (this.maxFileSize / (1024 * 1024)).toFixed(1);
            return { 
                isValid: false, 
                message: `Archivo demasiado grande. Máximo: ${maxSizeMB}MB` 
            };
        }

        // Validar extensión por nombre
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.allowedExtensions.includes(fileExtension)) {
            return { 
                isValid: false, 
                message: `Extensión no permitida. Use: ${this.allowedExtensions.join(', ')}` 
            };
        }

        // Validar nombre seguro
        if (!this.isSafeFileName(file.name)) {
            return { 
                isValid: false, 
                message: 'Nombre de archivo contiene caracteres no permitidos' 
            };
        }

        return { isValid: true, message: 'Archivo válido' };
    }

    // Verificar nombre de archivo seguro
    isSafeFileName(fileName) {
        const unsafeChars = /[<>:"/\\|?*\x00-\x1F]/g;
        const reservedNames = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i;
        
        if (unsafeChars.test(fileName)) return false;
        if (reservedNames.test(fileName.split('.')[0])) return false;
        if (fileName.length > 255) return false;
        
        return true;
    }

    // Manejo de errores de Storage
    handleStorageError(error) {
        console.error('Storage Error:', error);
        
        const errorMap = {
            'storage/unknown': 'Error desconocido en el almacenamiento',
            'storage/object-not-found': 'Archivo no encontrado',
            'storage/bucket-not-found': 'Bucket de almacenamiento no encontrado',
            'storage/project-not-found': 'Proyecto no encontrado',
            'storage/quota-exceeded': 'Límite de almacenamiento excedido',
            'storage/unauthenticated': 'Usuario no autenticado',
            'storage/unauthorized': 'Usuario no autorizado',
            'storage/retry-limit-exceeded': 'Límite de reintentos excedido',
            'storage/invalid-checksum': 'Checksum inválido',
            'storage/canceled': 'Operación cancelada',
            'storage/invalid-event-name': 'Nombre de evento inválido',
            'storage/invalid-url': 'URL inválida',
            'storage/invalid-argument': 'Argumento inválido',
            'storage/no-default-bucket': 'No hay bucket por defecto',
            'storage/cannot-slice-blob': 'No se puede dividir el blob',
            'storage/server-wrong-file-size': 'Tamaño de archivo incorrecto en servidor'
        };

        return new Error(errorMap[error.code] || error.message || 'Error en el almacenamiento');
    }

    // Eventos de progreso
    dispatchProgressEvent(progress, snapshot) {
        const event = new CustomEvent('storageUploadProgress', {
            detail: {
                progress: Math.round(progress),
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                state: snapshot.state
            }
        });
        document.dispatchEvent(event);
    }

    // Generar nombres de archivo seguros
    generateSafeFileName(originalName, prefix = '') {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop().toLowerCase();
        
        // Limpiar nombre original
        const cleanName = originalName
            .replace(/\.[^/.]+$/, '') // Remover extensión
            .replace(/[^a-zA-Z0-9-_]/g, '_') // Reemplazar caracteres especiales
            .substring(0, 50); // Limitar longitud
        
        return `${prefix}${cleanName}_${timestamp}_${randomString}.${extension}`;
    }

    // Comprimir imagen antes de subir
    async compressImage(file, maxWidth = 1920, quality = 0.8) {
        return new Promise((resolve) => {
            if (!file.type.startsWith('image/')) {
                resolve(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Calcular nuevas dimensiones
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    // Dibujar imagen comprimida
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convertir a blob
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(file);
                            return;
                        }

                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });

                        resolve(compressedFile);
                    }, 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Previsualización de archivos
    async getFilePreview(file) {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    resolve({
                        type: 'image',
                        url: e.target.result,
                        name: file.name,
                        size: file.size
                    });
                };
                reader.readAsDataURL(file);
            } else if (file.type === 'application/pdf') {
                resolve({
                    type: 'pdf',
                    url: URL.createObjectURL(file),
                    name: file.name,
                    size: file.size
                });
            } else {
                resolve({
                    type: 'unknown',
                    name: file.name,
                    size: file.size
                });
            }
        });
    }

    // Limpiar previsualizaciones
    cleanupPreviews(previews) {
        previews.forEach(preview => {
            if (preview.url && preview.url.startsWith('blob:')) {
                URL.revokeObjectURL(preview.url);
            }
        });
    }

    // Verificar existencia de archivo
    async fileExists(filePath) {
        try {
            const fileRef = ref(storage, filePath);
            await getDownloadURL(fileRef);
            return true;
        } catch (error) {
            if (error.code === 'storage/object-not-found') {
                return false;
            }
            throw this.handleStorageError(error);
        }
    }

    // Obtener metadatos del archivo
    async getFileMetadata(filePath) {
        try {
            // En una implementación real, esto usaría getMetadata de Firebase
            // Por ahora, simulamos con la información que tenemos
            const downloadURL = await this.getDownloadURL(filePath);
            return {
                exists: true,
                downloadURL,
                path: filePath
            };
        } catch (error) {
            if (error.code === 'storage/object-not-found') {
                return { exists: false };
            }
            throw this.handleStorageError(error);
        }
    }

    // Gestión de cuota de almacenamiento
    async getStorageUsage(userId) {
        try {
            // Listar archivos del usuario para calcular uso
            const userFiles = await this.listFiles(`users/${userId}`);
            let totalSize = 0;

            // En una implementación real, necesitaríamos obtener los metadatos de cada archivo
            // Por ahora, retornamos un estimado
            userFiles.files.forEach(file => {
                // Estimación basada en tipo de archivo
                totalSize += 1024 * 1024; // 1MB por archivo como estimación
            });

            const maxQuota = 100 * 1024 * 1024; // 100MB
            const usagePercentage = (totalSize / maxQuota) * 100;

            return {
                used: totalSize,
                total: maxQuota,
                percentage: usagePercentage,
                filesCount: userFiles.totalCount
            };
        } catch (error) {
            console.error('Error calculando uso de almacenamiento:', error);
            return {
                used: 0,
                total: 100 * 1024 * 1024,
                percentage: 0,
                filesCount: 0
            };
        }
    }
}

// Inicializar y exportar
window.storageManager = new StorageManager();
export default StorageManager;