export const blobToFormData = (blob: Blob) => {
    const formData = new FormData();
    formData.append("audio", blob, "input.webm");
    return formData;
};
