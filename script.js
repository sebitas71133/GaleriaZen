const dbManager = new IndexedDBManager("ListaAlbums", 4);
let array_imagenes = [];
let cantidadSeleccionada;
// localStorage.setItem('pagina', 2);
// localStorage.setItem('mostrar', 10);

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(".loader").style.display = "block";
  pagina = JSON.parse(localStorage.getItem("pagina")) || 1;
  cantidadSeleccionada = JSON.parse(localStorage.getItem("mostrar")) || 10;
  imagenes.value = pagina;
  cantidad.value = cantidadSeleccionada;
  renderImages(pagina,cantidadSeleccionada);
  document.querySelector(".loader").style.display = "none";
});



cantidad.addEventListener('change', async function() {
    cantidadSeleccionada = parseInt(cantidad.value);
    localStorage.setItem('mostrar', cantidadSeleccionada);
    renderImages(pagina,cantidadSeleccionada);
});

const renderImages = async (pagina,cantidadSeleccionada) => {
  array_imagenes =  await dbManager.obtenerParteAlbumPaginada(pagina,cantidadSeleccionada);
  gallery.innerHTML
  = array_imagenes.map((item) => {
      return `
               
                  <img loading="lazy" src="${item.url}" alt="" onclick= "handleZoomItemClick('${item.clave}','${item.url}')" />
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
      dbManager.deleteVideosByAlbumId(pathSelected);
      
    }
  }
  imagen_zoom.classList.toggle("visible");
  renderImages(pagina,cantidadSeleccionada);
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
    array_imagenes = await dbManager.obtenerParteAlbumPaginada(1,cantidadSeleccionada);
    convertedImages.length = 0; // Vaciar convertedImages después de agregar las imágenes al array
    fileInput.value = null;
    uploadForm.classList.toggle("visible");
    renderImages(pagina,cantidadSeleccionada);
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


// window.addEventListener("scroll", function () {
//   var header = document.querySelector("header");
//   if (window.scrollY > 100) {
//     header.classList.add("transparente");
//   } else {
//     header.classList.remove("transparente");
//   }
// });

const guardarAlbum = () => {
  if(confirm("¿Desea exportar todos los albumes?")){
    dbManager.exportar();
  }
  
};

const guardarPreviews = () => {
  if(confirm("¿Desea exportar todas las imagenes de los albumes?")){
    comprimirImagenesEnZIP(array_imagenes);
  } 
};

// IMPORTAR

fileInputI.addEventListener("change", function (event) {
  if (
    confirm("¿Desea importar otros albumes? No se perdera los albumes actuales")
  ) {
    const archivo = event.target.files[0];
    const lector = new FileReader();
    document.querySelector(".loader").style.display = "block";
    lector.onload = async function () {
      const datos = JSON.parse(lector.result);
      // dbManager.deleteAlbumsAndImagesAndVideos();
      dbManager.importar(datos);
      
      renderImages(pagina,cantidadSeleccionada);
      document.querySelector(".loader").style.display = "none";
      fileInputI.value = null;
    };
    lector.readAsText(archivo);
  }
});

function deleteAll(){
    if(confirm("¿Desea borrar todo?, procure exportar los albumes primero")){
       if(confirm("seguro que desea borrar todo?")){
          dbManager.deleteAlbumsAndImagesAndVideos();
          renderImages();
       }
    }
}

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

// colorPicker.addEventListener("change", function () {
//   const color = this.value;
//   gallery.style.backgroundColor = color;
// });

document.getElementById("boton-capturar").addEventListener("click", () => {
  if(confirm("¿Desea sacar una captura de pantalla de los albumes?")){
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


// PAGINACION
let pagina = 1;
imagenes.addEventListener("input", () => {
  {
    pagina = parseInt(imagenes.value);
    localStorage.setItem("pagina",pagina)
    document.querySelector(".loader").style.display = "block";
    setTimeout(async () => {
      renderImages(pagina,cantidadSeleccionada);
      document.querySelector(".loader").style.display = "none";
      cargar = false;
    }, 1000);
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