
const hero =
    document.getElementById("noticia-hero");

const contenido =
    document.getElementById("noticia-contenido");

const error =
    document.getElementById("error-noticia");


/* =========================
   UTILIDADES
========================== */

function escaparHTML(valor) {

    if (
        valor === undefined ||
        valor === null
    ) {

        return "";

    }

    return String(valor)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function urlSegura(valor) {

    if (!valor) {

        return "";

    }

    try {

        const url =
            new URL(
                valor,
                window.location.href
            );

        if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
        ) {

            return "";

        }

        return url.href;

    } catch {

        return "";

    }

}


function textoComoParrafos(texto) {

    if (Array.isArray(texto)) {

        return texto
            .map(parrafo => {

                return `
              <p>
                ${escaparHTML(parrafo)}
              </p>
            `;

            })
            .join("");

    }


    if (!texto) {

        return "";

    }


    return `
        <p>
          ${escaparHTML(texto)}
        </p>
      `;

}


/* =========================
   BLOQUES DE CONTENIDO
========================== */

function crearBloqueTexto(bloque) {

    return `

        <article class="news-content-block news-text-block">

          <div class="news-text-inner">

            ${bloque.titulo
            ? `
                  <div class="news-block-heading">

                    <span></span>

                    <h2>
                      ${escaparHTML(bloque.titulo)}
                    </h2>

                  </div>
                `
            : ""
        }

            <div class="news-text-body">

              ${textoComoParrafos(bloque.texto)}

            </div>

          </div>

        </article>

      `;

}


function crearBloqueImagen(bloque) {

    const imagen =
        urlSegura(bloque.imagen);


    if (!imagen) {

        return "";

    }


    return `

        <article class="news-content-block news-image-block">

          <figure class="news-full-image">

            <img
              src="${escaparHTML(imagen)}"
              alt="${escaparHTML(bloque.alt || "")}"
              loading="lazy"
            >

            ${bloque.titulo
            ? `
                  <figcaption>
                    ${escaparHTML(bloque.titulo)}
                  </figcaption>
                `
            : ""
        }

          </figure>

        </article>

      `;

}


function crearBloqueImagenTexto(bloque) {

    const imagen =
        urlSegura(bloque.imagen);


    if (!imagen) {

        return "";

    }


    const posicion =
        bloque.posicion === "derecha"
            ? "news-split-reverse"
            : "";


    return `

        <article
          class="news-content-block news-split ${posicion}"
        >

          <div class="news-split-image">

            <img
              src="${escaparHTML(imagen)}"
              alt="${escaparHTML(bloque.alt || "")}"
              loading="lazy"
            >

          </div>


          <div class="news-split-text">

            ${bloque.titulo
            ? `
                  <div class="news-block-heading">

                    <span></span>

                    <h2>
                      ${escaparHTML(bloque.titulo)}
                    </h2>

                  </div>
                `
            : ""
        }


            <div class="news-text-body">

              ${textoComoParrafos(bloque.texto)}

            </div>

          </div>

        </article>

      `;

}


function crearBloqueVideo(bloque) {

    const video =
        urlSegura(bloque.url);


    if (!video) {

        return "";

    }


    return `

        <article class="news-content-block news-video-block">

          <div class="news-video">

            <iframe
              src="${escaparHTML(video)}"
              title="Vídeo de la noticia"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>

          </div>

        </article>

      `;

}


function crearBloque(bloque) {

    if (
        !bloque ||
        !bloque.tipo
    ) {

        return "";

    }


    switch (bloque.tipo) {

        case "texto":

            return crearBloqueTexto(bloque);


        case "imagen":

            return crearBloqueImagen(bloque);


        case "imagen-texto":

            return crearBloqueImagenTexto(bloque);


        case "video":

            return crearBloqueVideo(bloque);


        default:

            return "";

    }

}


/* =========================
   HERO DE LA NOTICIA
========================== */

function crearHero(noticia) {

    const imagen =
        urlSegura(noticia.imagen);


    hero.innerHTML = `

        <div class="news-detail-hero-copy">

          <div class="news-detail-meta">

            <i class="bi bi-calendar3"></i>

            <span>
              ${escaparHTML(
        noticia.fechaTexto || ""
    )}
            </span>

          </div>


          <h1 class="news-detail-title">

            ${escaparHTML(noticia.titulo)}

          </h1>


          ${noticia.resumen
            ? `
                <p class="news-detail-summary">

                  ${escaparHTML(noticia.resumen)}

                </p>
              `
            : ""
        }


          <a
            href="noticias.html"
            class="news-detail-hero-back"
          >

            <i class="bi bi-arrow-left"></i>

            Volver a noticias

          </a>

        </div>


        ${imagen
            ? `
              <div class="news-detail-hero-image">

                <img
                  src="${escaparHTML(imagen)}"
                  alt="${escaparHTML(
                noticia.alt || noticia.titulo
            )}"
                >

              </div>
            `
            : ""
        }

      `;

}


/* =========================
   CARGAR NOTICIA
========================== */

async function cargarNoticia() {

    try {

        const parametros =
            new URLSearchParams(
                window.location.search
            );


        const id =
            parametros.get("id");


        if (!id) {

            mostrarError();

            return;

        }


        const respuesta =
            await fetch("noticias.json");


        if (!respuesta.ok) {

            throw new Error(
                "No se pudo cargar noticias.json"
            );

        }


        const noticias =
            await respuesta.json();


        if (!Array.isArray(noticias)) {

            throw new Error(
                "El archivo noticias.json no contiene una lista válida."
            );

        }


        const noticia =
            noticias.find(
                item => item.id === id
            );


        if (!noticia) {

            mostrarError();

            return;

        }


        /* HERO */

        crearHero(noticia);


        /* CONTENIDO */

        let bloques;


        /*
          Compatibilidad:

          Si todavía tienes alguna noticia
          con "contenido" como texto normal,
          también funcionará.
        */

        if (
            Array.isArray(noticia.contenido)
        ) {

            bloques =
                noticia.contenido;

        } else if (
            noticia.contenido
        ) {

            bloques = [

                {
                    tipo: "texto",
                    texto: noticia.contenido
                }

            ];

        } else {

            bloques = [];

        }


        contenido.innerHTML =
            bloques
                .map(crearBloque)
                .join("");


        /*
          Si no hay contenido,
          mostramos un pequeño mensaje.
        */

        if (
            !contenido.innerHTML.trim()
        ) {

            contenido.innerHTML = `

            <article class="news-content-block news-text-block">

              <div class="news-text-inner">

                <div class="news-text-body">

                  <p>
                    ${escaparHTML(
                noticia.resumen || ""
            )}
                  </p>

                </div>

              </div>

            </article>

          `;

        }


        /*
          Cambiamos el título del navegador.
        */

        document.title =
            `${noticia.titulo} | Linces de Setefilla`;


    } catch (error) {

        console.error(error);

        mostrarError();

    }

}


/* =========================
   ERROR
========================== */

function mostrarError() {

    hero.innerHTML = "";

    contenido.innerHTML = "";

    error.classList.remove("d-none");

}


/* =========================
   AÑO FOOTER
========================== */

document.getElementById(
    "currentYear"
).textContent =
    new Date().getFullYear();


/* =========================
   INICIAR
========================== */

cargarNoticia();
