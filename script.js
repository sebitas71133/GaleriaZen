const dbManager = new IndexedDBManager("ListaAlbums", 3);
let array_imagenes = [];

document.addEventListener("DOMContentLoaded", async function () {
  // Hacer una solicitud al servidor para obtener las rutas de las imágenes
  document.querySelector(".loader").style.display = "block";
  array_imagenes = await dbManager.obtenerParteAlbumPaginada(1);
  renderImages();
  document.querySelector(".loader").style.display = "none";
});

const renderImages = () => {
  gallery.innerHTML = array_imagenes
    .map((item) => {
      return `
               
                  <img id="zoom_01"  src="${item.url}" data-zoom-image="${item.url}" alt="" onclick= "handleZoomItemClick('${item.clave}','${item.url}')" />
               `;
    })
    .join("");
};

let pathSelected;
let positionActual;
const handleZoomItemClick = (id, url) => {
  //hacer visible el form
  pathSelected = id;
  imagen_zoom.classList.toggle("visible");
  imagenZoom.src = url;
  positionActual = getPosition(pathSelected);
  
};

// showZoomForm = () => {
//   console.log("cerrar");
//   imagen_zoom.classList.toggle("visible");
// };

imagenZoom.addEventListener("click", () => {
  imagen_zoom.classList.toggle("visible");
});

imageClose.addEventListener("click", () => {
  imagen_zoom.classList.toggle("visible");
});

imageEnter.addEventListener("click", () => {
  const url = `album.html?album=${pathSelected}`;
  window.location.href = url;
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

document.getElementById("imageNext").addEventListener("click", () => {
  if (positionActual < array_imagenes.length - 1) {
    positionActual = positionActual + 1;
  } else {
    positionActual = 0;
  }
  array_imagenes.forEach((e, index) => {
    if (index == positionActual) {
      idSelected = e.clave;
      imagenZoom.src = e.url;
      positionActual = index;
    }
  });
}) 

document.getElementById("imageLeft").addEventListener("click", () => {
  if (positionActual > 0) {
    positionActual = positionActual - 1;
  } else {
    positionActual = array_imagenes.length - 1;
    
  }
  array_imagenes.forEach((e, index) => {
    if (index == positionActual) {
      idSelected = e.clave;
      imagenZoom.src = e.url;
      positionActual = index;
    }
  });
}) 

//BORRAR UN ALBUM

imageBorrar.addEventListener("click", () => {
  if (confirm("¿Estás seguro de borrar la Preview?")) {
    if (confirm("¿Se borrara todos las imagenes asociadas?")) {
      dbManager.deleteAlbumById(pathSelected);
      dbManager.deleteImagesByAlbumId(pathSelected);
      array_imagenes = array_imagenes.filter((e) => e.clave != pathSelected);
    }
  }
  imagen_zoom.classList.toggle("visible");
  renderImages();
});

//GUARDAR IMAGENES AL CARGARLOS

document.getElementById("icon_add").addEventListener("click",()=>{
  uploadForm.classList.toggle("visible");
})

let convertedImages = [];
fileInput.addEventListener("change", async function () {
  const files = this.files;

  for (let i = 0; i < files.length; i++) {
    if (files[i].type.startsWith("image/")) {
      try {
        const { clave, url } = await convertirArchivoAURLBase64ConID(files[i]);
        convertedImages.push({ clave, url }); // Agregar la imagen convertida al array
      } catch (error) {
        console.error("Error al convertir el archivo:", error);
      }
    } else {
      fileInput.value = null;
      alert("Por favor, seleccione solo imágenes.");
    }
  }
});

// FORMULARIO CONFIRMAR - CANCELAR SUBIR IMAGENES
uploadForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  try {
    document.querySelector(".loader").style.display = "block";
    dbManager.addAlbumsArray(convertedImages);
    array_imagenes = await dbManager.obtenerParteAlbumPaginada(1);
    convertedImages.length = 0; // Vaciar convertedImages después de agregar las imágenes al array
    fileInput.value = null;
    uploadForm.classList.toggle("visible");
    renderImages();
    document.querySelector(".loader").style.display = "none";
  } catch (error) {
    console.log(error);
  }
});

//SALIR

btnSalir.addEventListener("click", () => {
  convertedImages.length = 0;
  fileInput.value = null;
  uploadForm.classList.toggle("visible");
});


window.addEventListener("scroll", function () {
  var header = document.querySelector("header");
  if (window.scrollY > 100) {
    header.classList.add("transparente");
  } else {
    header.classList.remove("transparente");
  }
});

const guardarAlbum = () => {
  dbManager.exportar();
};

const guardarPreviews = () => {
  comprimirImagenesEnZIP(array_imagenes);
};

// IMPORTAR

fileInputI.addEventListener("change", function (event) {
  if (
    confirm("Al importar se perderan todos los datos, procure exportar primero")
  ) {
    const archivo = event.target.files[0];
    const lector = new FileReader();
    document.querySelector(".loader").style.display = "block";
    lector.onload = async function () {
      const datos = JSON.parse(lector.result);
      dbManager.deleteAlbumsAndImages();
      dbManager.importar(datos);
      array_imagenes = await dbManager.obtenerParteAlbumPaginada(1);
      renderImages();
      document.querySelector(".loader").style.display = "none";
      fileInputI.value = null;
    };
    lector.readAsText(archivo);
  }
});

const actualizarData = async () => {
  array_imagenes = await dbManager.obtenerTodo();
};

// COLORES Y COLUMNAS
columnas.addEventListener("input", () => {
  {
    const numColumnas = parseInt(columnas.value);
    gallery.style.gridTemplateColumns = `repeat(${numColumnas}, minmax(250px, 1fr))`;
  }
});

colorPicker.addEventListener("change", function () {
  const color = this.value;
  gallery.style.backgroundColor = color;
});

document.getElementById("boton-capturar").addEventListener("click", () => {
  document.querySelector(".loader").style.display = "block";
  html2canvas(document.querySelector("#gallery")).then((canvas) => {
    const imagen = canvas.toDataURL("image/png");
    const enlaceDescarga = document.createElement("a");
    enlaceDescarga.href = imagen;
    enlaceDescarga.download = "captura_de_pantalla.png";
    enlaceDescarga.click();
    document.querySelector(".loader").style.display = "none";
  });
});

imagenes.addEventListener("input", () => {
  {
    const numColumnas = parseInt(imagenes.value);

    document.querySelector(".loader").style.display = "block";
    setTimeout(async () => {
      array_imagenes = await dbManager.obtenerParteAlbumPaginada(numColumnas);
      renderImages();
      document.querySelector(".loader").style.display = "none";
      cargar = false;
    }, 1000);
  }
});
