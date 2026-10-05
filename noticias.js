// =====================================================
// AÑO DEL FOOTER
// =====================================================

const currentYear =
    document.getElementById("currentYear");

if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


// =====================================================
// CERRAR MENÚ MÓVIL
// =====================================================

document
    .querySelectorAll(
        "#mainNav .nav-link:not(.dropdown-toggle), #mainNav .dropdown-item"
    )
    .forEach((link) => {

        link.addEventListener("click", () => {

            const nav =
                document.getElementById("mainNav");

            if (
                nav &&
                nav.classList.contains("show")
            ) {

                bootstrap.Collapse
                    .getOrCreateInstance(nav)
                    .hide();

            }

        });

    });


// =====================================================
// CARGAR TODAS LAS NOTICIAS ACTIVAS
// =====================================================

async function cargarNoticias() {

    const contenedor =
        document.getElementById(
            "noticias-container"
        );

    const sinNoticias =
        document.getElementById(
            "sin-noticias"
        );

    const errorNoticias =
        document.getElementById(
            "error-noticias"
        );


    try {

        const respuesta =
            await fetch("noticias.json");


        if (!respuesta.ok) {

            throw new Error(
                "No se ha podido cargar noticias.json"
            );

        }


        const noticias =
            await respuesta.json();


        // Comprobar que el JSON contiene un array

        if (
            !Array.isArray(noticias)
        ) {

            throw new Error(
                "El contenido de noticias.json no es válido"
            );

        }


        // =================================================
        // FILTRAR NOTICIAS DE MÁS DE UN MES
        // =================================================

        const ahora =
            new Date();


        const noticiasActivas =
            noticias.filter((noticia) => {

                if (!noticia.fecha) {
                    return false;
                }


                const fechaNoticia =
                    new Date(noticia.fecha);


                if (
                    Number.isNaN(
                        fechaNoticia.getTime()
                    )
                ) {

                    return false;

                }


                const fechaCaducidad =
                    new Date(fechaNoticia);


                fechaCaducidad.setMonth(
                    fechaCaducidad.getMonth() + 1
                );


                return (
                    ahora <
                    fechaCaducidad
                );

            });


        // =================================================
        // ORDENAR DE MÁS RECIENTE A MÁS ANTIGUA
        // =================================================

        noticiasActivas.sort(
            (a, b) => {

                return (
                    new Date(b.fecha) -
                    new Date(a.fecha)
                );

            }
        );


        // =================================================
        // SI NO HAY NOTICIAS
        // =================================================

        if (
            noticiasActivas.length === 0
        ) {

            sinNoticias.classList.remove(
                "d-none"
            );

            return;

        }


        // =================================================
        // GENERAR TARJETAS
        // =================================================

        contenedor.innerHTML =
            noticiasActivas
                .map((noticia) => {

                    return `

                <div class="col-sm-6 col-lg-4">

                  <article
                    class="card news-card h-100"
                    role="link"
                    tabindex="0"
                    data-noticia-id="${escaparHTML(noticia.id)}"
                  >

                    <img
                      src="${escaparHTML(noticia.imagen)}"
                      alt="${escaparHTML(noticia.alt || noticia.titulo)}"
                      loading="lazy"
                      class="card-img-top"
                    >

                    <div class="card-body">

                      <span class="news-date">

                        <i class="bi bi-calendar3"></i>

                        ${escaparHTML(
                        noticia.fechaTexto ||
                        formatearFecha(noticia.fecha)
                    )}

                      </span>


                      <h2 class="h3">

                        ${escaparHTML(
                        noticia.titulo
                    )}

                      </h2>


                      <p>

                        ${escaparHTML(
                        noticia.resumen || ""
                    )}

                      </p>

                    </div>

                  </article>

                </div>

              `;

                })
                .join("");


        // =================================================
        // HACER TARJETAS CLICABLES
        // =================================================

        contenedor
            .querySelectorAll(
                "[data-noticia-id]"
            )
            .forEach((tarjeta) => {


                const abrirNoticia =
                    () => {

                        const id =
                            tarjeta.dataset.noticiaId;


                        window.location.href =
                            `noticia.html?id=${encodeURIComponent(id)}`;

                    };


                tarjeta.addEventListener(
                    "click",
                    abrirNoticia
                );


                tarjeta.addEventListener(
                    "keydown",
                    (evento) => {

                        if (
                            evento.key === "Enter" ||
                            evento.key === " "
                        ) {

                            evento.preventDefault();

                            abrirNoticia();

                        }

                    }
                );

            });


    } catch (error) {

        console.error(
            "Error al cargar las noticias:",
            error
        );


        errorNoticias.classList.remove(
            "d-none"
        );

    }

}


// =====================================================
// INICIAR
// =====================================================

cargarNoticias();


// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHTML(valor) {

    const elemento =
        document.createElement("div");

    elemento.textContent =
        valor ?? "";

    return elemento.innerHTML;

}


// =====================================================
// FORMATEAR FECHA
// =====================================================

function formatearFecha(fecha) {

    const fechaObjeto =
        new Date(fecha);


    return fechaObjeto.toLocaleDateString(
        "es-ES",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}