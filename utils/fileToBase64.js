

function convertirArchivoAURLBase64ConID(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader(); 
      reader.onload = function() {
        const id = getNombreAlbum(file.name);
        resolve({ clave: id, url: reader.result });
      };
      reader.onerror = function(error) {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }



const getNombreAlbum = (albumNameRoute) => {
    const albumName = albumNameRoute.replace(/\.[^/.]+$/, "");
    return albumName;
  }
  