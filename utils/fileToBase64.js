

function convertirArchivoAURLBase64ConID(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); 
      reader.onload = function() {
        const id = getNombreAlbum(file.name);
        console.log(id);
        resolve({ clave: id, url: reader.result });
      };
      reader.onerror = function(error) {
        reject(error);
      };
      reader.readAsDataURL(file); //obtienes una cadena de texto que comienza con data: seguido opcionalmente por el tipo MIME y ;base64,
    });
  }



const getNombreAlbum = (albumNameRoute) => {
    const albumName = albumNameRoute.replace(/\.[^/.]+$/, "");
    return albumName;
  }
  