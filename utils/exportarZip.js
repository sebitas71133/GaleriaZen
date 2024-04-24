function comprimirImagenesEnZIP(arrayImagenes) {
    const zip = new JSZip();
    const fetchPromises = [];

    // Iterar sobre cada objeto de imagen en el array
    arrayImagenes.forEach((imagen, index) => {
        // Obtener el nombre del archivo de imagen
        const nombreArchivo = `${imagen.clave}.jpg`;

        // Obtener los datos base64 de la URL de la imagen
        const base64Data = imagen.url.split(',')[1];
        const byteArray = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Agregar la imagen al archivo ZIP
        zip.file(nombreArchivo, byteArray);

        // Agregar la promesa de fetch a la lista
        fetchPromises.push(fetch(imagen.url));
    });

    // Esperar a que todas las imágenes se descarguen
    Promise.all(fetchPromises)
        .then(() => {
            // Generar el archivo ZIP y descargarlo
            zip.generateAsync({ type: 'blob' })
                .then(blob => {
                    // Crear un enlace para descargar el archivo ZIP
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = 'imagenes.zip';
                    // Simular clic en el enlace para iniciar la descarga
                    link.click();
                })
                .catch(error => {
                    console.error('Error al generar el archivo ZIP:', error);
                });
        })
        .catch(error => {
            console.error('Error al cargar imágenes:', error);
        });
}
