let albumName = "";
let pagina = 1;
let cantidadSeleccionada = 10;
let array_imagenes = [];
let array_videos = [];
let nextAlbumE;
let previousAlbum;

const dbManager = new IndexedDBManager("ListaAlbums", 4);

document.addEventListener("DOMContentLoaded", async function () {
  const params = new URLSearchParams(window.location.search);
  albumName = params.get("album");
  document.getElementById("albumName").textContent = albumName;
  document.querySelector(".loader").style.display = "block";
  renderPreviews();
  document.querySelector(".loader").style.display = "none";
  nextAlbumE = await dbManager.getNextAlbumByActualId(albumName);
  previousAlbum = await dbManager.getPreviousAlbumByActualId(albumName);
});

recargarPagina.addEventListener("click", () => {
  const url = `index.html`;
  window.location.href = url;
});

const renderPreviews = async () => {
  array_imagenes = await dbManager.getImagesByAlbumId(albumName);
  array_videos = await dbManager.getVideosByAlbumId(albumName);

  galleryVideos.innerHTML = array_videos
    .map((item) => {
      return `
        <div>
          <video  muted  controls>
            <source src="data:video/mp4;base64,${item.url}">
            Tu navegador no soporta la etiqueta de video.
          </video>
          <button onclick="handleDeleteClick('${item.clave}')">Borrar</button>
        </div>
      `;
    })
    .join("");

  gallery.innerHTML = array_imagenes
    .map((item) => {
      return `<img src="${item.url}" alt="" onclick= "handleZoomItemClick('${item.url}','${item.clave}')" />`;
    })
    .join("");
};

const handleDeleteClick = (clave) => {
  if (confirm("Seguro?")) {
    dbManager.deleteVideoById(clave);
    renderPreviews();
  }
};
// COMPORTAMIENTO ZOOM AL HACER CLICK IMAGEN

let idSelected;
let positionActual;
const handleZoomItemClick = (image, id) => {
  idSelected = id;
  imagen_zoom.classList.toggle("visible");
  imagenZoom.src = image;
  positionActual = getPosition(idSelected);
};

imagenZoom.addEventListener("click", () => {
  imagen_zoom.classList.toggle("visible");
});

imageClose.addEventListener("click", () => {
  imagen_zoom.classList.toggle("visible");
});

//Funcion para obtener posicion mediante el id

const getPosition = (id) => {
  let position = -1;
  array_imagenes.forEach((e, index) => {
    if (e.clave == id) {
      position = index;
    }
  });

  return position;
};

//Funcion obtener imagen por posicion

const getImagenByPosRight = () => {
  if (positionActual < array_imagenes.length - 1) {
    positionActual = positionActual + 1;
  } else {
    positionActual = 0;
  }

  return array_imagenes.filter((e, index) => {
    if (index == positionActual) {
      nextImage(e.url, e.clave);
    }
  });
};

const getImagenByPosLeft = () => {
  if (positionActual > 0) {
    positionActual = positionActual - 1;
  } else {
    positionActual = array_imagenes.length - 1;
  }

  return array_imagenes.filter((e, index) => {
    if (index == positionActual) {
      nextImage(e.url, e.clave);
    }
  });
};

//Funcion para mostrar siguiente imagen

const nextImage = (image, id) => {
  idSelected = id;
  imagenZoom.src = image;
  positionActual = getPosition(idSelected);
};

showZoomForm = () => {
  imagen_zoom.classList.toggle("visible");
};

//GUARDAR IMAGENES AL CARGARLOS
const addPictures = () => {
  uploadForm.classList.toggle("visible");
};

function convertirArchivoAURLBase64ConID(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      const id = generateSecureRandomId();
      resolve({ clave: id, url: reader.result, id_album: albumName });
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

async function convertirVideoAURLBase64ConID(file) {
  let arrayBuffer = "";
  let base64String = "";

  arrayBuffer = await readFileAsArrayBuffer(file);
  base64String = arrayBufferToBase64(arrayBuffer);
  const id = generateSecureRandomId();
  return (data = {
    clave: id,
    url: base64String,
    id_album: albumName,
  });
}

let convertedImages = [];
let convertedVideos = [];
let data;
fileInput.addEventListener("change", async function (event) {
  const files = event.target.files;
  const maxSize = 15 * 1024 * 1024; // 2MB

  for (let file of files) {
    if (file.size > maxSize) {
      alert(`El archivo ${file.name} es demasiado grande (máximo 15MB).`);
      fileInput.value = ""; // Borra la selección
      return; // Salir del evento
    }
  }

  if (!files) return;

  try {
    for (const file of files) {
      if (file.type.includes("video")) {
        const { clave, url, id_album } = await convertirVideoAURLBase64ConID(
          file
        );
        convertedVideos.push({ clave, url, id_album });
        //  console.log(convertedVideos);
      } else if (file.type.includes("image")) {
        const { clave, url, id_album } = await convertirArchivoAURLBase64ConID(
          file
        );
        convertedImages.push({ clave, url, id_album });
        //  console.log(convertedImages);
      } else {
        alert("Por favor, seleccione imagenes/videos");
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    fileInput.value = null;
  }
});

// FORMULARIO CONFIRMAR - CANCELAR SUBIR IMAGENES
uploadForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  try {
    document.querySelector(".loader").style.display = "block";
    dbManager.agregarImagenesAlbum(convertedImages);
    dbManager.agregarVideosAlbum(convertedVideos);
    renderPreviews();
    document.querySelector(".loader").style.display = "none";
  } catch (error) {
    console.error(error);
  } finally {
    convertedImages.length = 0; //ya no es necesario
    convertedVideos.length = 0;
    fileInput.value = null;
    uploadForm.classList.toggle("visible");
  }
});

//SALIR

btnSalir.addEventListener("click", () => {
  convertedImages.length = 0;
  convertedVideos.length = 0;
  fileInput.value = null;
  uploadForm.classList.toggle("visible");
});

//Borrar una imagen
imageBorrar.addEventListener("click", () => {
  if (confirm("¿Estás seguro de borrar la imagen?")) {
    dbManager.deleteImageById(idSelected);
  }
  imagen_zoom.classList.toggle("visible");
  renderPreviews();
});

// AGREGAR ELIMINAR IMAGENES CONTENEDOR

const deleteAll = () => {
  if (confirm("¿Estás seguro de borrar todas las imagenes?")) {
    array_imagenes.length = 0;
    dbManager.deleteImagesByAlbumId(albumName);
    renderPreviews();
  }
};

// CANVAS

document.getElementById("boton-capturar").addEventListener("click", () => {
  if (confirm("¿Desea sacar una captura de pantalla a la galera?")) {
    document.querySelector(".loader").style.display = "block";
    html2canvas(document.querySelector("#gallery")).then((canvas) => {
      const imagen = canvas.toDataURL("image/png");
      const enlaceDescarga = document.createElement("a");
      enlaceDescarga.href = imagen;
      enlaceDescarga.download = "captura_de_pantalla.png";
      enlaceDescarga.click();
      document.querySelector(".loader").style.display = "none";
    });
  }
});

// TECLAS MOVER IMAGEN

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowRight") {
    getImagenByPosRight();
  }
  if (event.key === "ArrowLeft") {
    getImagenByPosLeft();
  }

  if (event.key === "Escape") {
    imagen_zoom.classList.toggle("visible");
  }
});

// window.addEventListener('scroll', function() {
//     var header = document.querySelector('header');
//     if (window.scrollY > 100) {
//         header.classList.add('transparente');
//     } else {
//         header.classList.remove('transparente');
//     }
//   });

// COLORES Y COLUMNAS
columnas.addEventListener("input", () => {
  {
    const numColumnas = parseInt(columnas.value);
    gallery.style.gridTemplateColumns = `repeat(${numColumnas}, minmax(250px, 1fr))`;
  }
});

columnasVideos.addEventListener("input", () => {
  {
    const numColumnas = parseInt(columnasVideos.value);
    console.log(numColumnas);
    galleryVideos.style.gridTemplateColumns = `repeat(${numColumnas}, minmax(250px, 1fr))`;
  }
});

const getNombreAlbum = (albumNameRoute) => {
  const albumName = albumNameRoute.replace(/\.[^/.]+$/, "");
  return albumName;
};

const guardarAlbum = () => {
  if (confirm("¿Desea exportar las imagenes?")) {
    comprimirImagenesEnZIP(array_imagenes);
  }
};

// VIDEOS

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
}

// Función para convertir un ArrayBuffer en una cadena base64
function arrayBufferToBase64(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function generateSecureRandomId() {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0].toString(16);
}

// CAMBIAR ENTRE ALBUMES

function beforeAlbum() {
  try {
    const url = `album.html?album=${previousAlbum.clave}`;
    window.location.href = url;
  } catch (error) {
    console.log("It'the first one");
  }
}

function nextAlbum() {
  try {
    if (!nextAlbumE) return;

    const url = `album.html?album=${nextAlbumE.clave}`;
    window.location.href = url;
  } catch (error) {
    console.log("It'the last one");
  }

  // console.log(nextId);
  // console.log(previousAlbum);
}
