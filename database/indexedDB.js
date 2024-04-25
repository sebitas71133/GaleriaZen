class IndexedDBManager {
    constructor(databaseName, version) {
        this.indexedDB = window.indexedDB;
        this.db = null;
        this._databaseName = databaseName;
        this._version = version;
        const connection = this.indexedDB.open(databaseName, version);

        connection.onsuccess = () => {
            this.db = connection.result;
             console.log('Base de datos abierta', this.db);
        };

        //Esto se activa cuando lo incrementas de version
        //if you created a new collection, you must increase the number of version.
        connection.onupgradeneeded = (e) => {
            this.db = e.target.result;
            console.log('Base de datos creada', this.db);
            this.db.createObjectStore('albums', { keyPath: 'clave' });
            this.db.createObjectStore('images', { keyPath: 'clave' });
        };

        connection.onerror = (error) => {
            console.error('Error:', error);
        };
    }

    
    agregar = (data) => {
        if (!this.db) {
            console.error('Error: Base de datos no está disponible aún');
            return;
        }
    
        const transaction = this.db.transaction(['albums'], 'readwrite');
        const objectStore = transaction.objectStore('albums');
        const request = objectStore.add(data);
    
        request.onsuccess = () => {
            console.log('Elemento agregado correctamente');
            // this.consultar();
        };
    
        request.onerror = (error) => {
            console.error('Error al agregar elemento:', error);
        };
    }
    


    agregarVarios = (datos) => {
    const trasaccion = this.db.transaction(['albums'], 'readwrite');
    const coleccionObjetos = trasaccion.objectStore('albums');

        datos.forEach(dato => {
            coleccionObjetos.add(dato);
        });
        // this.consultar();
    }   

    consultarImagenesPorAlbum = (id_album) => {
        const connection = this.indexedDB.open(this._databaseName, this._databaseNameversion);
        return new Promise((resolve, reject) => {

            connection.onsuccess = () => {
                const db = connection.result;
                const transaction = db.transaction(['images'], 'readonly');
                const imageStore = transaction.objectStore('images');
                const cursorRequest = imageStore.openCursor();
                const result = [];
    
                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        const imagen = cursor.value;
                        if (imagen.id_album === id_album) {
                            result.push(imagen);
                        }
                        cursor.continue(); // Continúa con el siguiente objeto
                    } else {
                        resolve(result);
                    }
                };
        
    
                cursorRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };
        });
    };

     // Agrega una imagen asociada con un álbum existente
     agregarImagenesAlbum = async (imageData) => {
        const transaction = this.db.transaction(['images'], 'readwrite');
        const imageStore = transaction.objectStore('images');

        // Recorre el array imageData y agrega cada imagen al álbum correspondiente
        imageData.forEach(image => {
         
            const imageRequest = imageStore.add(image);
            imageRequest.onsuccess = () => {
                console.log('Imagen agregada correctamente');
            };
            imageRequest.onerror = (error) => {
                console.error('Error al agregar imagen:', error);
            };
        });
      
    }
    


    obtener = (clave) =>{
        const trasaccion = this.db.transaction(['albums'],'readonly')
        const coleccionObjetos = trasaccion.objectStore('albums')
        const conexion = coleccionObjetos.get(clave)

        conexion.onsuccess = (e) =>{
            console.log(conexion.result)
        }

        conexion.onerror = (error) => {
            console.error('Error al obtener elementos:', error);
        };
        
    }

    obtenerTodo = () => {
        return new Promise((resolve, reject) => {
            const connection = this.indexedDB.open(this._databaseName, this._databaseNameversion);
    
            connection.onsuccess = () => {
                const db = connection.result;
                const transaction = db.transaction(['albums'], 'readonly');
                const objectStore = transaction.objectStore('albums');
                const cursorRequest = objectStore.openCursor();
                const result = [];
    
                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor) {
                        result.push(cursor.value);
                        cursor.continue(); // Continúa con el siguiente objeto
                    } else {
                        resolve(result);
                    }
                };
    
                cursorRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };
    
            connection.onerror = (error) => {
                reject(error);
            };
        });
    };

    
    obtenerParteAlbum = (quantity) => {
        return new Promise((resolve, reject) => {
            const connection = this.indexedDB.open(this._databaseName, this._databaseNameversion);
            
            connection.onsuccess = () => {
                const db = connection.result;
                const transaction = db.transaction(['albums'], 'readonly');
                const objectStore = transaction.objectStore('albums');
                const cursorRequest = objectStore.openCursor();
                const result = [];
                let count = 0;
                cursorRequest.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && count<quantity) {
                        result.push(cursor.value);
                        cursor.continue(); // Continúa con el siguiente objeto
                        count++;
                    } else {
                        resolve(result);
                    }
                };
    
                cursorRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };
    
            connection.onerror = (error) => {
                reject(error);
            };
        });
    }; 
    
    

    actualizar = (data) =>{    
        const trasaccion = this.db.transaction(['albums'],'readwrite')
        const coleccionObjetos = trasaccion.objectStore('albums')
        const conexion = coleccionObjetos.put(data)
        
        conexion.onsuccess = () =>{
            this.consultar()
        }

        conexion.onerror = (error) => {
            console.error('Error al actualizar elemento:', error);
        };
    }

    eliminar = (clave) =>{      
        const trasaccion = this.db.transaction(['albums'],'readwrite')
        const coleccionObjetos = trasaccion.objectStore('albums')
        const conexion = coleccionObjetos.delete(clave)

        conexion.onsuccess = () =>{
            this.consultar()
        }

        conexion.onerror = (error) => {
            console.error('Error al eliminar elemento:', error);
        };
    }

    eliminarImagen = (clave) =>{      
        const trasaccion = this.db.transaction(['images'],'readwrite')
        const coleccionObjetos = trasaccion.objectStore('images')
        const conexion = coleccionObjetos.delete(clave)

        conexion.onsuccess = () =>{
            this.consultar()
        }

        conexion.onerror = (error) => {
            console.error('Error al eliminar elemento:', error);
        };
    }


    eliminarImagenesPorAlbum = (id_album) => {
        const transaction = this.db.transaction(['images'], 'readwrite');
        const objectStore = transaction.objectStore('images');
    
        const request = objectStore.openCursor(); 
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const imagen = cursor.value;
                if (imagen.id_album === id_album) { 
                   
                    cursor.delete(); 
                }
                cursor.continue(); 
            } else {
                // console.log('Todas las imágenes asociadas al álbum con ID', id_album, 'han sido eliminadas'); test
                // this.consultar(); 
            }
        };
    
        request.onerror = (event) => {
            console.error('Error al abrir el cursor sobre el almacén de objetos:', event.target.error);
        };
    };


    eliminarTodo = async () => {
        const transactionAlbum = this.db.transaction(['albums'], 'readwrite');
        const albumStore = transactionAlbum.objectStore('albums');
    
        const transactionImagen = this.db.transaction(['images'], 'readwrite');
        const imageStore = transactionImagen.objectStore('images');
    
        // Eliminar todos los álbumes
        const eliminarAlbums = new Promise((resolve, reject) => {
            transactionAlbum.oncomplete = () => {
                console.log("Se eliminaron todos los álbumes");
                resolve();
            };
            transactionAlbum.onerror = (event) => {
                console.error("Error al eliminar los álbumes:", event.target.error);
                reject(event.target.error);
            };
            albumStore.clear();
        });
    
        // Eliminar todas las imágenes
        const eliminarImagenes = new Promise((resolve, reject) => {
            transactionImagen.oncomplete = () => {
                console.log("Se eliminaron todas las imágenes");
                resolve();
            };
            transactionImagen.onerror = (event) => {
                console.error("Error al eliminar las imágenes:", event.target.error);
                reject(event.target.error);
            };
            imageStore.clear();
        });
    
        await Promise.all([eliminarAlbums, eliminarImagenes]);
    
        console.log("Se eliminó todo el contenido de las colecciones");
    };
    
    
    

    consultar = () =>{
        const trasaccion = this.db.transaction(['albums'],'readonly')
        const coleccionObjetos = trasaccion.objectStore('albums')
        const conexion = coleccionObjetos.openCursor()

        
        conexion.onsuccess = (e) =>{
            const cursor = e.target.result        
            if(cursor){
                // console.log(cursor.value);
                cursor.continue()
            }else{
                // console.log('No hay albums en la lista')
            }
        }
    }

    exportar = () => {
        document.querySelector('.loader').style.display = 'block';
        const transactionAlbum = this.db.transaction(['albums'], 'readonly');
        const albumStore = transactionAlbum.objectStore('albums');
    
        const transactionImagen = this.db.transaction(['images'], 'readonly');
        const imageStore = transactionImagen.objectStore('images');
    
        const obtenerAlbums = new Promise((resolve, reject) => {
            const conexionAlbum = albumStore.openCursor();
            const arrayAlbum = [];
            conexionAlbum.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    arrayAlbum.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(arrayAlbum);
                }
            };
        });
    
        const obtenerImagenes = new Promise((resolve, reject) => {
            const conexionImage = imageStore.openCursor();
            const arrayImagen = [];
            conexionImage.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    arrayImagen.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(arrayImagen);
                }
            };
        });
    
        Promise.all([obtenerAlbums, obtenerImagenes])
            .then(([arrayAlbum, arrayImagen]) => {
                const objExport = {
                    "arrayAlbums": arrayAlbum,
                    "arrayImages": arrayImagen
                };
                this.descargarArrayJson(objExport);
                document.querySelector('.loader').style.display = 'none';
            })
            .catch(error => {
                console.error('Error al obtener los datos:', error);
            });
    };
    


    descargarArrayJson = (array)=> {
        // Convertir el arreglo a JSON
        
        const jsonArreglo = JSON.stringify(array);
        const enlace = document.createElement('a');
        const blob = new Blob([jsonArreglo], { type: 'application/json' });
        enlace.href = URL.createObjectURL(blob);
        enlace.download = 'database.json';
        enlace.click(); 
    }

    importar = (datos) => {
        arrayAlbumes = datos.arrayAlbums;
        arrayImagenes = datos.arrayImages;
        this.agregarVarios(arrayAlbumes); //AgregarAlbumes
        this.agregarImagenesAlbum(arrayImagenes); //Agregar imagenes

    }
}
