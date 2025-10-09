import axiosInstance from "./axiosConfig";

// Función helper para convertir base64 a File
const base64ToFile = (base64String: string, filename: string): File => {
  const arr = base64String.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// Función helper para actualizar la firma de un gasto (ruta autenticada)
export const updateGastoSignature = async (gastoId: number, signature: string) => {
  try {
    const formData = new FormData();
    
    // Convertir base64 a File
    const signatureFile = base64ToFile(signature, `signature_${gastoId}_${Date.now()}.png`);
    formData.append('signature', signatureFile);

    const response = await axiosInstance.post(`/gastos/${gastoId}/signature`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating signature:', error);
    throw error;
  }
};

// Función helper para firmar externamente (ruta pública, sin autenticación)
export const signGastoExternally = async (gastoId: number, signature: string) => {
  try {
    const formData = new FormData();
    
    // Convertir base64 a File
    const signatureFile = base64ToFile(signature, `signature_external_${gastoId}_${Date.now()}.png`);
    formData.append('signature', signatureFile);

    const response = await axiosInstance.post(`/public/gastos/${gastoId}/sign`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error signing externally:', error);
    throw error;
  }
};

// Función helper para obtener la información de un gasto por ID (autenticada)
export const getGastoById = async (gastoId: number) => {
  try {
    const response = await axiosInstance.get(`/gastos/${gastoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gasto:', error);
    throw error;
  }
};

// Función helper para obtener información pública de un gasto (sin autenticación)
export const getPublicGastoInfo = async (gastoId: number) => {
  try {
    const response = await axiosInstance.get(`/public/gastos/${gastoId}/info`);

    return response.data;
  } catch (error) {
    console.error('Error fetching public gasto info:', error);
    throw error;
  }
};

// Función helper para verificar el estado de firma de un gasto (autenticada)
export const checkSignatureStatus = async (gastoId: number) => {
  try {
    const response = await axiosInstance.get(`/gastos/${gastoId}/signature-status`);
    return response.data;
  } catch (error) {
    console.error('Error checking signature status:', error);
    throw error;
  }
};

// Función helper para verificar el estado de firma públicamente (sin autenticación)
export const checkPublicSignatureStatus = async (gastoId: number) => {
  try {
    const response = await axiosInstance.get(`/public/gastos/${gastoId}/signature-status`);
    return response.data;
  } catch (error) {
    console.error('Error checking public signature status:', error);
    throw error;
  }
};