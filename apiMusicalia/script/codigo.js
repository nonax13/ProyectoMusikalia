// JavaScript Document

window.console = window.console || function(t) {};

if (document.location.search.match(/type=embed/gi)) {
    window.parent.postMessage("resize", "*");
}

const DIR_SERVIDOR_ITUNES = "https://itunes.apple.com/search/?media=music&term=";
let current_song_index = 0;
let audio_song;
let src_cancion;
let progress_bar;
let play_pause = new Boolean(false);
let playing_default_song = new Boolean(true);
let icon_play_pause;
let search_results;
let xhr = new XMLHttpRequest();
let defaultSong;
let defaultSongLoaded = new Boolean(false);
let modal_message;

// Esta función carga una primera busqueda elegida por defecto,para que la tabla y reproductor no esten vacios 
function loadingDefaultSong() {
    defaultSong = "Fix you";
    // 1 Busca en servidor Itunes
    let url = DIR_SERVIDOR_ITUNES + defaultSong;
    let url_formatted = encodeURI(url);
    // 2 Petición Ajax al servidor
    xhr.open('GET', url_formatted);
    xhr.onreadystatechange = loadingTable;
    xhr.send();
    // Mientras cargamos la primera canción de la llamada AJAX, el índice se establece en cero
    current_song_index = 0;
}

// Esta función evalúa los posibles errores causados ​​por la canción buscada
function errorsEvaluation(error) {
    modal_message = document.getElementById('modal_message');

    switch (error) {
        case 0:
            modal_message.innerHTML = "Debes escribir una canción en el área de búsqueda";
            openModal();
            break;
        case 1:
            modal_message.innerHTML = "La canción <span class='font-weight-bold'>" + document.getElementById("entrada").value + "</span> no existe. Intentelo de nuevo";
            openModal();
            break;
        case 2:
            modal_message.innerHTML = "<span class='font-weight-bold'>" + document.getElementById("entrada").value + "</span> no se ha encontrado. Intentelo de nuevo";
            openModal();
            break;
    }

}

// Esta función realiza la llamada AJAX en función del tipo de canción en el elemento de búsqueda en el DOM
function buscaCanciones() {
    let searchedSong = document.getElementById("entrada").value.toLowerCase();
    if (searchedSong.length <= 0) {
        errorsEvaluation(0);
    } else {
        // 1 Busca el servidor de Itunes
        let url = DIR_SERVIDOR_ITUNES + capitalizeFirstLetter(searchedSong);
        let url_formatted = encodeURI(url);
        // 2 Hace la peticón Ajax al servidor
        xhr.open('GET', url_formatted);
        xhr.onreadystatechange = loadingTable;
        xhr.send();
    }
}

// Esta función pone en mayúscula la primera letra de la cadena de búsqueda
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Esta función carga las canciones devueltas por la llamada AJAX
function loadingTable() {
    //Si la llamada AJAX fue exitosa, la tabla se carga
    if (xhr.readyState == 4) {
        console.log("Response received");
        if (xhr.status == 200) {
            console.log("Successful response");
            // Guardando en una variable xhr.responseText
            // Y lo guardamos en "search_result". Lo hemos DESERIALIZADO.
            search_result = JSON.parse(xhr.responseText);
            // De esta forma, tenemos dos atributos en search_result
            search_result.resultCount;
            search_result.results;

            if (search_result.results.length > 0) {
                // La Tabla se limpia antes de cargar las canciones.
                cleaningTable();
                // Bucle "search_results.results" que cargará diez canciones
                for (let index = 0; index < 10; index++) {
                    // Cargando la canción de datos en cada fila de la tabla
                    loadingSongsInTable(search_result.results[index], index);
                }
            } else {
                // No hay ninguna canción sobre la cadena de búsqueda escrita
                errorsEvaluation(1);
            }
        } else {
            // No hay cancion
            console.log("Wrong readyState " + xhr.readyState);
            console.log("Wrong status " + xhr.status);
            errorsEvaluation(2);
        }
    } else {
        // TODO: Puede que la búsqueda, aunque esté bien realizada no haya devuelto nada
        // Deveríamos evaluar que los resultados tienen contenido y si no, mostrar un mensaje
        console.log("Wrong response" + xhr.status);
    }
}

// Esta función limpia la tabla antes de cargar las canciones.
function cleaningTable() {
    var songs_table = document.getElementById("songsTable");
    while (songs_table.rows.length > 1) {
        songs_table.deleteRow(1);
    }
}

// Esta función carga la canción de datos en cada fila de la tabla
function loadingSongsInTable(cancion, index) {
    // Encapsulando los datos de la canción en la tabla
    let songs_table = document.getElementById("songsTable");
    let tr_table = document.createElement("tr");
    tr_table.setAttribute("id", index, onclick = "searchingSongs();");
    let artist_name = document.createElement("td");
    let track_name = document.createElement("td");
    let collection_name = document.createElement("td");
    current_song_index = index;

    // Encapsulando los valores a los campos del td
    artist_name.innerHTML = cancion.artistName;
    track_name.innerHTML = cancion.trackName;
    collection_name.innerHTML = cancion.collectionName;

    // Agregar los elementos td a un elemento tr
    tr_table.appendChild(artist_name);
    tr_table.appendChild(track_name);
    tr_table.appendChild(collection_name);

    // Agregar elemento tr a la table
    tr_table.addEventListener('click', function() {
        loadingPlayer(index);
    }, false);
    songs_table.appendChild(tr_table);
}

// Esta función controla la Reproductor.
function loadingPlayer(index) {
    // Capturar y configurar los elementos relacionados con la canción cargada en el DOM
    current_song_index = index;
    audio_song = document.getElementById("audioCancion");
    src_cancion = document.getElementById("srcSong");
    let img_song =
        document.getElementById("img_song");
    let artist_name = document.getElementById("artistName");
    let track_name = document.getElementById("trackName");
    let collection_name = document.getElementById("collectionName");
    let song_src = search_result.results[index].previewUrl;
    src_cancion.src = search_result.results[index].previewUrl;
    img_song.
    src = search_result.results[index].artworkUrl100;
    artist_name.innerHTML = search_result.results[index].artistName;
    track_name.innerHTML = search_result.results[index].trackName;
    collection_name.innerHTML = search_result.results[index].collectionName;
    src_cancion.innerHTML = song_src;
    audio_song.load();
    audio_song.play();
    play_pause = false;
    playPause();
    //Aplicar el color predeterminado a todas las filas de la tabla
    for (let indexTable = 0; indexTable < 10; indexTable++) {
        document.getElementById(indexTable).style.backgroundColor = "#333";
    }
    // Resaltando la fila en la que se hizo clic en la tabla
    document.getElementById(index).style.backgroundColor = "#162f2e";
}

// Esta función controla el comportamiento del botón Reproducir
function playPause() {
    // Capturando elementos relacionados con el botón Reproducir / Pausa en el DOM
    icon_play_pause = document.getElementById("iconPlayPause");
    audio_song = document.getElementById("audioCancion");
    src_cancion = document.getElementById("srcSong");
    if (playing_default_song) {
        current_song_index = 0;
        playing_default_song = false;
    }
    //Control del botón de icono play_pause
    if (play_pause) {
        // Visualización del icono de reproducción
        icon_play_pause.innerHTML = "<i class='fas fa-play' aria-hidden='true'></i>";
        audio_song.pause();
        play_pause = false;
    } else {
        // Visualización del icono de pausa
        icon_play_pause.innerHTML = "<i class='fas fa-pause' aria-hidden='true'></i>";
        // Reproducir canción cargada
        audio_song.play();
        play_pause = true;
        //Llamando a la función que controla la barra de progreso
        loadingProgressBar();
    }
}

// Esta función controla el comportamiento del botón Atrás
function playPrevoius() {
    if (current_song_index > 0) {
        current_song_index--;
    } else {
        current_song_index = 0;
    }
    // Cargue la canción anterior en la lista
    loadingPlayer(current_song_index);
}

// Esta función controla el comportamiento del botón Adelante
function playNext() {
    if (current_song_index < 9) {
        current_song_index++;
    } else {
        current_song_index = 9;
    }
    // Cargue la siguiente canción de la lista
    loadingPlayer(current_song_index);
}

// Esta función controla el comportamiento de la barra de progreso
function loadingProgressBar() {
    // Capturando la barra de progreso en el DOM
    progress_bar = document.getElementById("progressBar");
    // Controlar la duración de la canción cargada
    var song_duration = setInterval(scene, audio_song.duration);
    // Cambiar el con de la barra de progreso hasta el final de la canción de carga
    function scene() {
        if (audio_song.currentTime >= audio_song.duration) {
            clearInterval(song_duration);
        } else {
            progress_bar.style.width = audio_song.currentTime / 30 * 100 + '%';
        }
    }
}

// Esta función ordena la tabla de la A a la Z
function sortTableAZ(column) {
    var table, rows, switching, i, x, y, shouldSwitch;
    // Capturando el elemento de la tabla en el DOM
    table = document.getElementById("songsTable");
    switching = true;
    //Bucle mientras se cambia
    while (switching) {
        //comience diciendo: no se realiza ningún cambio:
        switching = false;
        // Capturando el elemento de filas en el DOM
        rows = table.rows;
        //Recorrer todas las filas de la tabla (excepto la primera, que contiene encabezados de tabla)
        for (i = 1; i < rows.length - 1; i++) {
            //Empiece diciendo que no debería haber cambios
            shouldSwitch = false;
            //Obtenga los dos elementos para comparar, uno de la fila actual y otro de la siguiente
            x = rows[i].getElementsByTagName("TD")[column];
            y = rows[i + 1].getElementsByTagName("TD")[column];
            //compruebe si las dos filas deben cambiar de lugar:
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                //si es así, marque como un interruptor y rompa el lazo
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            //Si se ha marcado un interruptor, hágalo y marque que se ha realizado un cambio.
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

// Esta función ordena la tabla de Z a A
function sortTableZA(column) {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("songsTable");
    switching = true;

    // Bucle mientras se cambia
    while (switching) {
        //comience diciendo: no se realiza ningún cambio:
        switching = false;
        // Capturando el elemento de filas en el DOM
        rows = table.rows;
        // Recorrer todas las filas de la tabla (excepto la primera, que contiene encabezados de tabla)
        for (i = rows.length - 1; i > 0; i--) {
            //Empiece diciendo que no debería haber cambios
            shouldSwitch = false;
            // Obtenga los dos elementos para comparar, uno de la fila actual y otro de la anterior
            x = rows[i].getElementsByTagName("TD")[column];
            y = rows[i - 1].getElementsByTagName("TD")[column];
            if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                //si es así, marque como un interruptor y rompa el lazo
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            // Si se ha marcado un interruptor, hágalo Si se ha marcado un interruptor, haga el interruptor y marque que se ha realizado un cambio o interruptor y marque que se ha realizado un cambio
            rows[i].parentNode.insertBefore(rows[i], rows[i - 1]);
            switching = true;
        }
    }
}

function openModal() {
    document.getElementById("backdrop").style.display = "block";
    document.getElementById("errorModal").style.display = "block";
    document.getElementById("errorModal").className += "show";
}

function closeModal() {
    console.log("defaultSongLoaded " + defaultSongLoaded);
    if (defaultSongLoaded) {
        loadingDefaultSong();
    } else {
        searchingSongs();
    }
    document.getElementById("backdrop").style.display = "none";
    document.getElementById("errorModal").style.display = "none";
    document.getElementById("errorModal").className += document.getElementById("errorModal").className.replace("show", "");
}

//Cuando el usuario haga clic en cualquier lugar fuera del modal, ciérrelo.
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
};


// Esta función carga la canción predeterminada cuando se carga la página
window.onload = function() {
    //Obtener la modal
    var modal = document.getElementById('errorModal');
    loadingDefaultSong();
};
//# sourceURL=pen.js