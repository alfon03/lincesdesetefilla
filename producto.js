let productos = [];
let productoActual = null;

// ==========================================
// ELEMENTOS DE LA PÁGINA
// ==========================================

const contenedorProducto =
    document.getElementById("producto-container");

const mensajeError =
    document.getElementById("producto-error");

// ==========================================
// OBTENER ID DEL PRODUCTO
// ==========================================

const parametros =
    new URLSearchParams(window.location.search);

const productoId =
    parametros.get("id");

// ==========================================
// CARGAR PRODUCTOS
// ==========================================

async function cargarProducto() {


    try {

        if (!productoId) {
            throw new Error("No se ha indicado ningún producto.");
        }


        const respuesta =
            await fetch("productos.json");


        if (!respuesta.ok) {
            throw new Error("No se ha podido cargar productos.json.");
        }


        productos =
            await respuesta.json();


        productoActual =
            productos.find(producto => producto.id === productoId);


        if (!productoActual) {
            throw new Error("El producto no existe.");
        }


        mostrarProducto();


        actualizarContadorCarrito();


    } catch (error) {

        console.error(error);

        contenedorProducto.innerHTML = "";

        mensajeError.innerHTML = `
        <h2>Producto no encontrado</h2>

        <p>
            No hemos podido encontrar el producto que buscas.
        </p>

        <a href="tienda.html" class="boton-volver">
            Volver a la tienda
        </a>
    `;

    }


}

// ==========================================
// MOSTRAR PRODUCTO
// ==========================================

function mostrarProducto() {


    document.title =
        `${productoActual.nombre} | Linces De Setefilla`;


    const imagenPrincipal =
        productoActual.imagenes &&
            productoActual.imagenes.length > 0
            ? productoActual.imagenes[0]
            : "";


    let miniaturas = "";


    if (
        productoActual.imagenes &&
        productoActual.imagenes.length > 1
    ) {

        miniaturas =
            productoActual.imagenes
                .map((imagen, indice) => {

                    return `
                    <button
                        class="miniatura ${indice === 0 ? "activa" : ""
                        }"
                        data-imagen="${imagen}"
                    >
                        <img
                            src="${imagen}"
                            alt="${productoActual.nombre}"
                        >
                    </button>
                `;

                })
                .join("");

    }


    let selectorTallas = "";


    if (
        productoActual.tallas &&
        productoActual.tallas.length > 0
    ) {

        selectorTallas = `

        <div class="producto-opcion">

            <label for="talla">
                Talla
            </label>

            <select id="talla">

                <option value="">
                    Selecciona una talla
                </option>

                ${productoActual.tallas
                .map(talla => `
                        <option value="${talla}">
                            ${talla}
                        </option>
                    `)
                .join("")}

            </select>

        </div>

    `;

    }


    let guiaTallas = "";


    if (productoActual.guiaTallas) {

        guiaTallas = `

        <a
            href="${productoActual.guiaTallas}"
            class="guia-tallas"
            target="_blank"
        >
            📏 Ver guía de tallas
        </a>

    `;

    }


    contenedorProducto.innerHTML = `

    <a
        href="tienda.html"
        class="volver-tienda"
    >
        ← Volver a la tienda
    </a>


    <section class="producto-detalle">


        <div class="producto-galeria">

            <div class="imagen-principal">

                ${imagenPrincipal
            ? `
                        <img
                            id="imagen-producto"
                            src="${imagenPrincipal}"
                            alt="${productoActual.nombre}"
                        >
                    `
            : `
                        <div class="sin-imagen">
                            Sin imagen
                        </div>
                    `
        }

            </div>


            ${miniaturas
            ? `
                    <div class="producto-miniaturas">
                        ${miniaturas}
                    </div>
                `
            : ""
        }

        </div>


        <div class="producto-datos">

            <p class="producto-categoria">
                ${productoActual.categoria}
            </p>


            <h1>
                ${productoActual.nombre}
            </h1>


            <p class="producto-precio-grande">
                ${productoActual.precio.toFixed(2)} €
            </p>


            <div class="producto-linea">
            </div>


            <p class="producto-descripcion-grande">
                ${productoActual.descripcion}
            </p>


            ${selectorTallas
            ? selectorTallas
            : ""
        }


            ${guiaTallas}


            <div class="producto-opcion">

                <label for="cantidad">
                    Cantidad
                </label>

                <div class="cantidad-control">

                    <button
                        type="button"
                        id="menos-cantidad"
                    >
                        −
                    </button>

                    <input
                        type="number"
                        id="cantidad"
                        value="1"
                        min="1"
                        max="99"
                    >

                    <button
                        type="button"
                        id="mas-cantidad"
                    >
                        +
                    </button>

                </div>

            </div>


            <button
                type="button"
                id="boton-anadir-carrito"
                class="boton-anadir-carrito"
            >
                Añadir al carrito
            </button>


            <p
                id="mensaje-carrito"
                class="mensaje-carrito"
            >
            </p>

        </div>

    </section>

`;


    configurarGaleria();

    configurarCantidad();

    configurarCarrito();


}

// ==========================================
// GALERÍA DE IMÁGENES
// ==========================================

function configurarGaleria() {


    const miniaturas =
        document.querySelectorAll(".miniatura");

    const imagenPrincipal =
        document.getElementById("imagen-producto");


    if (!miniaturas.length || !imagenPrincipal) {
        return;
    }


    miniaturas.forEach(miniatura => {

        miniatura.addEventListener("click", () => {

            const nuevaImagen =
                miniatura.dataset.imagen;


            imagenPrincipal.src =
                nuevaImagen;


            miniaturas.forEach(item => {
                item.classList.remove("activa");
            });


            miniatura.classList.add("activa");

        });

    });


}

// ==========================================
// CONTROL DE CANTIDAD
// ==========================================

function configurarCantidad() {


    const inputCantidad =
        document.getElementById("cantidad");

    const botonMenos =
        document.getElementById("menos-cantidad");

    const botonMas =
        document.getElementById("mas-cantidad");


    if (
        !inputCantidad ||
        !botonMenos ||
        !botonMas
    ) {
        return;
    }


    botonMenos.addEventListener("click", () => {

        let cantidad =
            parseInt(inputCantidad.value) || 1;


        if (cantidad > 1) {
            cantidad--;
        }


        inputCantidad.value =
            cantidad;

    });


    botonMas.addEventListener("click", () => {

        let cantidad =
            parseInt(inputCantidad.value) || 1;


        if (cantidad < 99) {
            cantidad++;
        }


        inputCantidad.value =
            cantidad;

    });


}

// ==========================================
// AÑADIR AL CARRITO
// ==========================================

function configurarCarrito() {


    const boton =
        document.getElementById("boton-anadir-carrito");


    if (!boton) {
        return;
    }


    boton.addEventListener("click", () => {

        const cantidadInput =
            document.getElementById("cantidad");


        const cantidad =
            parseInt(cantidadInput.value) || 1;


        let talla = null;


        const selectorTalla =
            document.getElementById("talla");


        if (selectorTalla) {

            talla =
                selectorTalla.value;


            if (!talla) {

                mostrarMensajeCarrito(
                    "Selecciona una talla antes de añadir el producto.",
                    true
                );

                return;

            }

        }


        let carrito =
            JSON.parse(
                localStorage.getItem("carrito")
            ) || [];


        const productoExistente =
            carrito.find(item =>

                item.id === productoActual.id &&
                item.talla === talla

            );


        if (productoExistente) {

            productoExistente.cantidad +=
                cantidad;

        } else {

            carrito.push({

                id: productoActual.id,

                nombre: productoActual.nombre,

                precio: productoActual.precio,

                imagen:
                    productoActual.imagenes &&
                        productoActual.imagenes.length > 0
                        ? productoActual.imagenes[0]
                        : "",

                talla: talla,

                cantidad: cantidad

            });

        }


        localStorage.setItem(
            "carrito",
            JSON.stringify(carrito)
        );


        actualizarContadorCarrito();


        mostrarMensajeCarrito(
            "✓ Producto añadido al carrito.",
            false
        );

    });


}

// ==========================================
// MENSAJE DEL CARRITO
// ==========================================

function mostrarMensajeCarrito(
    mensaje,
    error
) {


    const elemento =
        document.getElementById(
            "mensaje-carrito"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.classList.toggle(
        "error",
        error
    );


}

// ==========================================
// CONTADOR DEL CARRITO
// ==========================================

function actualizarContadorCarrito() {


    const contador =
        document.getElementById(
            "contador-carrito"
        );


    if (!contador) {
        return;
    }


    const carrito =
        JSON.parse(
            localStorage.getItem("carrito")
        ) || [];


    const cantidad =
        carrito.reduce(
            (total, producto) =>
                total + producto.cantidad,
            0
        );


    contador.textContent =
        cantidad;


}

// ==========================================
// INICIAR
// ==========================================

cargarProducto();
