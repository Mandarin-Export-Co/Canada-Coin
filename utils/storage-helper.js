// utils/storage-helper.js
class StorageHelper {
  constructor() {
    this.storage = firebase.storage();
    this.db = firebase.firestore();
  }

  // Subir archivo a Firebase Storage
  async uploadFile(file, userId, depositId) {
    try {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten JPG, PNG y PDF.');
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB.');
      }

      // Crear referencia única para el archivo
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `deposits/${userId}/${depositId}_${timestamp}.${fileExtension}`;
      
      const storageRef = this.storage.ref().child(fileName);
      
      // Mostrar progreso de subida
      const uploadTask = storageRef.put(file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progreso de subida
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Progreso de subida: ${progress}%`);
            
            // Puedes emitir un evento personalizado para actualizar UI
            const event = new CustomEvent('uploadProgress', {
              detail: { progress, fileName: file.name }
            });
            document.dispatchEvent(event);
          },
          (error) => {
            console.error('Error en subida:', error);
            reject(error);
          },
          async () => {
            // Subida completada
            try {
              const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
              
              // Guardar metadata en Firestore
              const fileData = {
                fileName: file.name,
                fileURL: downloadURL,
                fileSize: file.size,
                fileType: file.type,
                uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId,
                depositId: depositId,
                status: 'pending_review'
              };
              
              await this.db.collection('depositFiles').add(fileData);
              
              resolve({
                success: true,
                downloadURL,
                fileName: file.name,
                fileData
              });
              
            } catch (dbError) {
              console.error('Error guardando metadata:', dbError);
              reject(dbError);
            }
          }
        );
      });
      
    } catch (error) {
      console.error('Error en uploadFile:', error);
      throw error;
    }
  }

  // Eliminar archivo
  async deleteFile(filePath) {
    try {
      const fileRef = this.storage.ref().child(filePath);
      await fileRef.delete();
      return { success: true };
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      throw error;
    }
  }

  // Obtener URL de descarga
  async getDownloadURL(filePath) {
    try {
      const fileRef = this.storage.ref().child(filePath);
      return await fileRef.getDownloadURL();
    } catch (error) {
      console.error('Error obteniendo URL:', error);
      throw error;
    }
  }

  // Listar archivos de un usuario
  async getUserFiles(userId) {
    try {
      const snapshot = await this.db.collection('depositFiles')
        .where('userId', '==', userId)
        .orderBy('uploadDate', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error obteniendo archivos:', error);
      throw error;
    }
  }

  // Validar archivo antes de subir
  validateFile(file) {
    const errors = [];
    
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      errors.push('Tipo de archivo no válido. Solo JPG, PNG y PDF.');
    }
    
    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('El archivo debe ser menor a 5MB.');
    }
    
    // Validar nombre (evitar caracteres especiales)
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(file.name)) {
      errors.push('El nombre del archivo contiene caracteres inválidos.');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Instancia global del helper
const storageHelper = new StorageHelper();