
// =========================================================
// AÑO AUTOMÁTICO EN EL PIE DE PÁGINA
// =========================================================
const yearElement =
    document.getElementById("currentYear");

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}

// =========================================================
// CERRAR EL MENÚ MÓVIL DESPUÉS DE PULSAR UN ENLACE
// =========================================================

document
    .querySelectorAll(
        "#mainNav .nav-link:not(.dropdown-toggle), #mainNav .dropdown-item"
    )
    .forEach(
        (link) => {

            link.addEventListener(
                "click",
                () => {

                    const nav =
                        document.getElementById(
                            "mainNav"
                        );

                    if (
                        nav &&
                        nav.classList.contains(
                            "show"
                        )
                    ) {

                        bootstrap.Collapse
                            .getOrCreateInstance(
                                nav
                            )
                            .hide();

                    }

                }
            );

        }
    );


// =========================================================
// NOTICIAS
// =========================================================

async function cargarNoticiasInicio() {

    const contenedor =
        document.querySelector(
            "#noticias .row"
        );

    if (!contenedor) {
        return;
    }


    try {

        const respuesta =
            await fetch(
                "noticias.json"
            );


        if (!respuesta.ok) {

            throw new Error(
                "No se ha podido cargar noticias.json"
            );

        }


        const noticias =
            await respuesta.json();


        if (
            !Array.isArray(noticias) ||
            noticias.length === 0
        ) {

            contenedor.innerHTML = "";

            return;

        }


        // =========================================================
        // ELIMINAR DE LA WEB LAS NOTICIAS DE MÁS DE UN MES
        // =========================================================

        const ahora =
            new Date();


        const noticiasActivas =
            noticias.filter(
                (noticia) => {

                    const fechaNoticia =
                        new Date(
                            noticia.fecha
                        );


                    const fechaCaducidad =
                        new Date(
                            fechaNoticia
                        );


                    fechaCaducidad.setMonth(
                        fechaCaducidad.getMonth() + 1
                    );


                    return (
                        ahora <
                        fechaCaducidad
                    );

                }
            );


        // Ordenar de más reciente a más antigua

        noticiasActivas.sort(
            (a, b) =>
                new Date(b.fecha) -
                new Date(a.fecha)
        );


        // Mostrar únicamente las 4 últimas noticias activas

        const ultimasNoticias =
            noticiasActivas.slice(
                0,
                4
            );




        contenedor.innerHTML =
            ultimasNoticias
                .map(
                    (noticia) => {

                        return `
                            <div class="col-sm-6 col-lg-3">
                                <article
                                    class="card news-card h-100"
                                    role="link"
                                    tabindex="0"
                                    data-noticia-id="${noticia.id}"
                                >

                                    <img
                                        src="${noticia.imagen}"
                                        alt="${noticia.alt}"
                                        loading="lazy"
                                        class="card-img-top"
                                    >

                                    <div class="card-body">

                                        <span class="news-date">
                                            <i class="bi bi-calendar3"></i>
                                            ${noticia.fechaTexto}
                                        </span>

                                        <h3>
                                            ${noticia.titulo}
                                        </h3>

                                        <p>
                                            ${noticia.resumen}
                                        </p>

                                    </div>

                                </article>
                            </div>
                        `;

                    }
                )
                .join("");


        // Hacer que cada noticia sea clicable

        contenedor
            .querySelectorAll(
                "[data-noticia-id]"
            )
            .forEach(
                (tarjeta) => {

                    const abrirNoticia =
                        () => {

                            const id =
                                tarjeta.dataset
                                    .noticiaId;

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
                                evento.key ===
                                "Enter" ||
                                evento.key ===
                                " "
                            ) {

                                evento.preventDefault();

                                abrirNoticia();

                            }

                        }
                    );

                }
            );

    }
    catch (error) {

        console.error(
            "Error al cargar las noticias:",
            error
        );

    }

}


// =========================================================
// INICIAR NOTICIAS
// =========================================================

cargarNoticiasInicio();

/* =========================
   PREGUNTAS FRECUENTES
   ========================= */

document.querySelectorAll(".faq-question").forEach((question) => {
    question.addEventListener("click", () => {

        const item = question.closest(".faq-item");
        const isOpen = item.classList.contains("active");

        // Cerrar las demás preguntas
        document.querySelectorAll(".faq-item.active").forEach((openItem) => {
            if (openItem !== item) {
                openItem.classList.remove("active");
            }
        });

        // Abrir/cerrar la seleccionada
        item.classList.toggle("active", !isOpen);
    });
});




async function cargarProductosAleatorios() {

    const contenedor = document.getElementById("productos-destacados");

    if (!contenedor) {
        return;
    }

    try {

        const respuesta = await fetch("productos.json");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar productos.json");
        }

        const productos = await respuesta.json();

        const disponibles = productos.filter(
            producto => producto.disponible !== false
        );

        // Mezclar productos aleatoriamente
        const aleatorios = [...disponibles]
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);

        contenedor.innerHTML = aleatorios.map(producto => {

            const imagen =
                producto.imagenes && producto.imagenes.length > 0
                    ? producto.imagenes[0]
                    : "assets/LOGO.png";

            return `
                    <div class="col-12 col-sm-6 col-lg-3">

                        <article class="card h-100 border-0 shadow-sm">

                            <a
                                href="producto.html?id=${encodeURIComponent(producto.id)}"
                                class="text-decoration-none"
                            >

                                <div
                                    class="ratio ratio-1x1"
                                    style="background:#f4f4f4; overflow:hidden;"
                                >
                                    <img
                                        src="${imagen}"
                                        alt="${producto.nombre}"
                                        class="w-100 h-100"
                                        style="object-fit:cover;"
                                        loading="lazy"
                                    >
                                </div>

                            </a>

                            <div class="card-body d-flex flex-column">

                                <span class="small text-uppercase text-secondary">
                                    ${producto.categoria}
                                </span>

                                <h3 class="h5 fw-bold mt-1 mb-2">
                                    ${producto.nombre}
                                </h3>

                                <p class="fw-bold mb-3">
                                    ${Number(producto.precio).toFixed(2).replace(".", ",")} €
                                </p>

                                <a
                                    href="producto.html?id=${encodeURIComponent(producto.id)}"
                                    class="btn btn-sport mt-auto"
                                >
                                    Ver producto
                                    <i class="bi bi-arrow-right ms-2"></i>
                                </a>

                            </div>

                        </article>

                    </div>
                `;

        }).join("");

    } catch (error) {

        console.error("Error cargando los productos:", error);

        contenedor.innerHTML = `
                <div class="col-12">
                    <p class="text-secondary mb-0">
                        No se han podido cargar los productos.
                    </p>
                </div>
            `;

    }

}

cargarProductosAleatorios();


// ==========================================
// MARCAR PÁGINA ACTIVA EN EL MENÚ
// ==========================================

const paginaActual =
    window.location.pathname
        .split("/")
        .pop() || "index.html";

const anclaActual =
    window.location.hash;

const enlacesMenu =
    document.querySelectorAll(
        ".site-nav .nav-link"
    );


// ==========================================
// LIMPIAR TODOS LOS ACTIVOS
// ==========================================

enlacesMenu.forEach(enlace => {

    enlace.classList.remove("active");

});


// ==========================================
// INICIO
// ==========================================

if (
    paginaActual === "index.html" &&
    !anclaActual
) {

    const inicio =
        document.querySelector(
            '#mainNav .navbar-nav > .nav-item:first-child .nav-link'
        );

    if (inicio) {
        inicio.classList.add("active");
    }

}

// ==========================================
// INFO
// ==========================================

if (
    paginaActual === "index.html" &&
    anclaActual === "#info"
) {

    const info =
        document.querySelector(
            '.site-nav a[href="index.html#info"]'
        );

    if (info) {
        info.classList.add("active");
    }

}


// ==========================================
// CAMPUS
// ==========================================

const paginasCampus = [
    "inscripciones-verano.html",
    "inscripciones-invierno.html"
];

const campusActivo =
    (
        paginaActual === "index.html" &&
        (
            anclaActual === "#campus-verano" ||
            anclaActual === "#campus-invierno"
        )
    ) ||
    paginasCampus.includes(
        paginaActual
    );


if (campusActivo) {

    const campus =
        document.getElementById(
            "campusDropdown"
        );

    if (campus) {
        campus.classList.add("active");
    }

}


// ==========================================
// NOTICIAS
// ==========================================

if (
    paginaActual === "noticias.html"
) {

    const noticias =
        document.querySelector(
            '.site-nav a[href="noticias.html"]'
        );

    if (noticias) {
        noticias.classList.add("active");
    }

}


// ==========================================
// TIENDA
// ==========================================

if (
    paginaActual === "tienda.html"
) {

    const tienda =
        document.querySelector(
            '.site-nav a[href="tienda.html"]'
        );

    if (tienda) {
        tienda.classList.add("active");
    }

}