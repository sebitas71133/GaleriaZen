const dbManager = new IndexedDBManager('ListaAlbums', 3);
let array_imagenes = [];

document.addEventListener("DOMContentLoaded", async function () {
  // Hacer una solicitud al servidor para obtener las rutas de las imágenes
   array_imagenes = await dbManager.obtenerTodo();
   
   renderImages();
});


const renderImages = () => {
  gallery.innerHTML =  array_imagenes
          .map((item) => {

            return `
               
                  <img src="${item.url}" alt="" onclick= "handleZoomItemClick('${item.clave}','${item.url}')" />
               `
          
          })
          .join("");
};

let pathSelected;
const handleZoomItemClick = (id,url) => {
  //hacer visible el form
  pathSelected = id;
  imagen_zoom.classList.toggle("visible");
  imagenZoom.src = url;
};

showZoomForm = () => {
  console.log("cerrar");
  imagen_zoom.classList.toggle("visible");
};

imageClose.addEventListener("click", () => {
  imagen_zoom.classList.toggle("visible");
});

imageEnter.addEventListener("click", () => {
  const url = `album.html?album=${pathSelected}`;
  window.location.href = url;
  imagen_zoom.classList.toggle("visible");
});

 //BORRAR UNA IMAGEN PREVIEW

 imageBorrar.addEventListener("click", () => {
  
  if (confirm("¿Estás seguro de borrar la Preview?")) {
    if (confirm("¿Se borrara todos las imagenes asociadas?")) {
      dbManager.eliminar(pathSelected);
      dbManager.eliminarImagenesPorAlbum(pathSelected);
      array_imagenes = array_imagenes.filter(e=>e.clave!=pathSelected);
    };
  }
  imagen_zoom.classList.toggle("visible");
  renderImages();
});


//GUARDAR IMAGENES AL CARGARLOS
const addPictures = () => {
  uploadForm.classList.toggle("visible");
};

function convertirArchivoAURLBase64ConID(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); 
    reader.onload = function() {
      const id = getNombreAlbum(file.name);
      // const id = 'image_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      resolve({ clave: id, url: reader.result });
    };
    reader.onerror = function(error) {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

let convertedImages = []; 
fileInput.addEventListener("change", async function () {
  const files = this.files;
  
  for (let i = 0; i < files.length; i++) {
    if (files[i].type.startsWith('image/')) {
      try {
        const { clave, url } = await convertirArchivoAURLBase64ConID(files[i]);
        convertedImages.push({ clave, url }); // Agregar la imagen convertida al array
      } catch (error) {
        console.error('Error al convertir el archivo:', error);
      }
    } else {
      fileInput.value = null;
      alert('Por favor, seleccione solo imágenes.');
    }
  }

});

// FORMULARIO CONFIRMAR - CANCELAR SUBIR IMAGENES
uploadForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  try {

    dbManager.agregarVarios(convertedImages);
    array_imagenes = await dbManager.obtenerTodo();
    convertedImages.length = 0; // Vaciar convertedImages después de agregar las imágenes al array
    fileInput.value = null; 
    uploadForm.classList.toggle("visible");
    renderImages();
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

const ocultar = (contenedor) => {
  console.log(contenedor);
  document.querySelector(`#${contenedor}`).classList.toggle("ocultar");
};

window.addEventListener('scroll', function() {
  var header = document.querySelector('header');
  if (window.scrollY > 100) {
      header.classList.add('transparente');
  } else {
      header.classList.remove('transparente');
  }
});


const getNombreAlbum = (albumNameRoute) => {
  const albumName = albumNameRoute.replace(/\.[^/.]+$/, "");
  return albumName;
}

const guardarAlbum = () => {
  console.log('hola');
  dbManager.exportar();
}

const guardarPreviews = () => {
  comprimirImagenesEnZIP(array_imagenes)
}



// IMPORTAR
let arrayAlbumes ;
let arrayImagenes;
fileInputI.addEventListener('change', function(event) {

  if(confirm("Al importar se perderan todos los datos, procure exportar primero")){
    const archivo = event.target.files[0];
    const lector = new FileReader();
   
    lector.onload = async function() {
      const datos = JSON.parse(lector.result);
      
        dbManager.eliminarTodo();
        dbManager.importar(datos);
        array_imagenes = await dbManager.obtenerTodo();
        renderImages();
      fileInputI.value = null;
    };   
    lector.readAsText(archivo); 
  }

});

const actualizarData = async () => {
  array_imagenes = await dbManager.obtenerTodo();
}



  // COLORES Y COLUMNAS
  columnas.addEventListener('input', ()=>{
    {
      const numColumnas = parseInt(columnas.value);
      gallery.style.gridTemplateColumns = `repeat(${numColumnas}, minmax(250px, 1fr))`;
    }
  });
  
  
  colorPicker.addEventListener('change', function() {
      const color = this.value;
      gallery.style.backgroundColor = color;
  });


  document.getElementById("boton-capturar").addEventListener("click", () => {
    html2canvas(document.querySelector("#gallery")).then((canvas) => {
        const imagen = canvas.toDataURL("image/png");
        const enlaceDescarga = document.createElement('a');
        enlaceDescarga.href = imagen;
        enlaceDescarga.download = 'captura_de_pantalla.png';
        enlaceDescarga.click();
    });
  });