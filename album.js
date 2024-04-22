let albumName = "";
let array_imagenes = [];
const dbManager = new IndexedDBManager('ListaAlbums', 3);

document.addEventListener("DOMContentLoaded",async function () {
    const params = new URLSearchParams(window.location.search);
    albumName = params.get('album');
    array_imagenes = await dbManager.consultarImagenesPorAlbum(albumName);
    renderPreviews();
});



const renderPreviews = async () => {
   
    gallery.innerHTML = array_imagenes
        .map((item) => {
            return `<img src="${item.url}" alt="" onclick= "handleZoomItemClick('${item.url}','${item.clave}')" />`;
        })
        .join("");
}

const getData = async () => {
    try {
      const response = await fetch(`/images?albumName=${albumName}`);
      const imagePaths = await response.json();
      return imagePaths;
    } catch (error) {
      console.error("Error al obtener las rutas de las imágenes:", error);
      throw error;
    }
  };


// COMPORTAMIENTO ZOOM AL HACER CLICK IMAGEN

let idSelected;
let positionActual;
const handleZoomItemClick = (image,id) => {
  idSelected = id; 
  imagen_zoom.classList.toggle("visible");
  imagenZoom.src = image;
  positionActual  = getPosition(idSelected);  
};

imagenZoom.addEventListener("click",()=>{
  imagen_zoom.classList.toggle("visible");
})

imageClose.addEventListener("click", () => {
    imagen_zoom.classList.toggle("visible");
});

//Funcion para obtener posicion mediante el id

const getPosition = (id) => {
    let position = -1;
      array_imagenes.forEach((e,index)=>{
          if(e.clave==id){
             position = index;
          }
      })
  
      return position;
  }
  
  //Funcion obtener imagen por posicion
  
  const getImagenByPosRight = () => {
      if(positionActual<array_imagenes.length-1){
        positionActual = positionActual +1;
      }else{
        positionActual = 0;
      }
      
      return array_imagenes.filter((e,index)=>{
        if(index==positionActual){
          nextImage(e.url,e.clave)
        }
      });
  }
  
  const getImagenByPosLeft = () => {
      
    if(positionActual>0){
      positionActual = positionActual -1;
    }else{
      positionActual = array_imagenes.length-1;
    }
    
    return array_imagenes.filter((e,index)=>{
      if(index==positionActual){
        nextImage(e.url,e.clave)
      }
    });
  }
  
  //Funcion para mostrar siguiente imagen
  
  const nextImage = (image,id) => {
    idSelected = id; 
    imagenZoom.src = image;
    positionActual  = getPosition(idSelected);  
    
  };

  showZoomForm = () => {
    console.log("cerrar");
    imagen_zoom.classList.toggle("visible");
  };

//GUARDAR IMAGENES AL CARGARLOS
const addPictures = () => {
  uploadForm.classList.toggle("visible");
};

function convertirArchivoAURLBase64ConID(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); 
    reader.onload = function() {
      // console.log(file);
     // const id = getNombreAlbum(file.name);
      const id = 'image_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      resolve({ clave: id, url: reader.result, id_album:albumName });
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
        const { clave, url, id_album } = await convertirArchivoAURLBase64ConID(files[i]);
        convertedImages.push({ clave, url, id_album }); // Agregar la imagen convertida al array
     
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
  
      dbManager.agregarImagenesAlbum(convertedImages);
      array_imagenes = await dbManager.consultarImagenesPorAlbum(albumName);
      convertedImages.length = 0;
      fileInput.value = null; 
      uploadForm.classList.toggle("visible");
      renderPreviews();
  } catch (error) {
    console.error(error);
  }
  
});


//SALIR

btnSalir.addEventListener("click", () => {
  convertedImages.length = 0;
  fileInput.value = null; 
  uploadForm.classList.toggle("visible");
});







  
   //Borrar una imagen 
  imageBorrar.addEventListener("click", () => {
    if (confirm("¿Estás seguro de borrar la imagen?")) {
      dbManager.eliminarImagen(idSelected)
      array_imagenes = array_imagenes.filter(e=>e.clave!=idSelected);
    }
    imagen_zoom.classList.toggle("visible");
    renderPreviews();
  });


  // AGREGAR ELIMINAR IMAGENES CONTENEDOR

const deleteAll = () => {
  if (confirm("¿Estás seguro de borrar todas las imagenes?")) {
    // itemRepository.removeAll();
    array_imagenes.length = 0;
    dbManager.eliminarImagenesPorAlbum(albumName);
    renderPreviews();
  }
};

// CANVAS

// document.getElementById("boton-capturar").addEventListener("click", () => {
//     html2canvas(document.querySelector("#gallery"),{
//       scale : 2
//     }).then((canvas) => {
//         const imagen = canvas.toDataURL("image/png");
//         const enlaceDescarga = document.createElement('a');
//         enlaceDescarga.href = imagen;
//         enlaceDescarga.download = 'captura_de_pantalla.png';
//         enlaceDescarga.click();
//     });
//   });

  document.getElementById("boton-capturar").addEventListener("click", () => {
    html2canvas(document.querySelector("#gallery")).then((canvas) => {
      const imagen = canvas.toDataURL("image/png");
      const ventanaNueva = window.open();
      ventanaNueva.document.write(
        '<img  src="' + imagen + '" alt="Captura de pantalla">'
      );
    });
  });
// TECLAS MOVER IMAGEN

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight') {
      getImagenByPosRight();
    }
    if (event.key === 'ArrowLeft') {
      getImagenByPosLeft();
    }
  
    if (event.key === 'Escape') {
      imagen_zoom.classList.toggle("visible");
    }
  });


window.addEventListener('scroll', function() {
    var header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.classList.add('transparente');
    } else {
        header.classList.remove('transparente');
    }
  });
  

  // Escucha el evento input del input de número
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


  const getNombreAlbum = (albumNameRoute) => {
    const albumName = albumNameRoute.replace(/\.[^/.]+$/, "");
    return albumName;
  }