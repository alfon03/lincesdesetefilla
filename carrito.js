// =====================================================
// CARRITO - LINCES DE SETEFILLA
// =====================================================


// -----------------------------------------------------
// ELEMENTOS DEL DOM
// -----------------------------------------------------

const carritoVacio =
    document.getElementById("carrito-vacio");

const carritoConProductos =
    document.getElementById("carrito-con-productos");

const carritoLista =
    document.getElementById("carrito-lista");

const carritoNumeroProductos =
    document.getElementById("carrito-numero-productos");

const carritoSubtotal =
    document.getElementById("carrito-subtotal");

const carritoTotal =
    document.getElementById("carrito-total");

const botonFinalizar =
    document.getElementById("boton-finalizar");

const contadorCarrito =
    document.getElementById("contador-carrito");


// -----------------------------------------------------
// OBTENER CARRITO
// -----------------------------------------------------

function obtenerCarrito() {

    try {

        const carritoGuardado =
            localStorage.getItem("carrito");

        if (!carritoGuardado) {
            return [];
        }

        const carrito =
            JSON.parse(carritoGuardado);

        if (!Array.isArray(carrito)) {
            return [];
        }

        return carrito;

    } catch (error) {

        console.error(
            "Error al leer el carrito:",
            error
        );

        return [];

    }

}


// -----------------------------------------------------
// GUARDAR CARRITO
// -----------------------------------------------------

function guardarCarrito(carrito) {

    localStorage.setItem(
        "carrito",
        JSON.stringify(carrito)
    );

}


// -----------------------------------------------------
// FORMATO DE PRECIO
// -----------------------------------------------------

function formatearPrecio(precio) {

    return Number(precio)
        .toFixed(2)
        .replace(".", ",") + " €";

}


// -----------------------------------------------------
// ACTUALIZAR CONTADOR DEL HEADER
// -----------------------------------------------------

function actualizarContadorCarrito() {

    const carrito =
        obtenerCarrito();


    const cantidad =
        carrito.reduce(
            (total, producto) => {

                return total +
                    Number(producto.cantidad || 0);

            },
            0
        );


    if (!contadorCarrito) {
        return;
    }


    contadorCarrito.textContent =
        cantidad;


    if (cantidad === 0) {

        contadorCarrito.style.display =
            "none";

    } else {

        contadorCarrito.style.display =
            "flex";

    }

}


// -----------------------------------------------------
// ACTUALIZAR RESUMEN
// -----------------------------------------------------

function actualizarResumen() {

    const carrito =
        obtenerCarrito();


    const cantidadTotal =
        carrito.reduce(
            (total, producto) => {

                return total +
                    Number(producto.cantidad || 0);

            },
            0
        );


    const subtotal =
        carrito.reduce(
            (total, producto) => {

                const precio =
                    Number(
                        producto.precio || 0
                    );

                const cantidad =
                    Number(
                        producto.cantidad || 0
                    );

                return total +
                    (precio * cantidad);

            },
            0
        );


    if (carritoNumeroProductos) {

        carritoNumeroProductos.textContent =
            `${cantidadTotal} producto${cantidadTotal !== 1
                ? "s"
                : ""
            }`;

    }


    if (carritoSubtotal) {

        carritoSubtotal.textContent =
            formatearPrecio(subtotal);

    }


    if (carritoTotal) {

        carritoTotal.textContent =
            formatearPrecio(subtotal);

    }

}


// -----------------------------------------------------
// MOSTRAR CARRITO
// -----------------------------------------------------

function mostrarCarrito() {

    const carrito =
        obtenerCarrito();


    console.log(
        "Carrito cargado:",
        carrito
    );


    // -----------------------------------------------
    // CARRITO VACÍO
    // -----------------------------------------------

    if (carrito.length === 0) {

        if (carritoVacio) {

            carritoVacio.hidden =
                false;

        }


        if (carritoConProductos) {

            carritoConProductos.style.display =
                "none";

        }


        actualizarResumen();
        actualizarContadorCarrito();

        return;

    }


    // -----------------------------------------------
    // CARRITO CON PRODUCTOS
    // -----------------------------------------------

    if (carritoVacio) {

        carritoVacio.hidden =
            true;

    }


    if (carritoConProductos) {

        carritoConProductos.style.display =
            "";

    }


    if (!carritoLista) {
        return;
    }


    carritoLista.innerHTML = "";


    carrito.forEach(
        (producto, indice) => {

            const tarjeta =
                document.createElement("article");


            tarjeta.className =
                "carrito-producto";


            const imagen =
                producto.imagen || "";


            const talla =
                producto.talla
                    ? `
                        <span class="carrito-producto-talla">
                            Talla: ${producto.talla}
                        </span>
                    `
                    : "";


            tarjeta.innerHTML = `

                <div class="carrito-producto-imagen">

                    ${imagen
                    ? `
                                <img
                                    src="${imagen}"
                                    alt="${producto.nombre}"
                                >
                            `
                    : `
                                <div class="sin-imagen">
                                    Sin imagen
                                </div>
                            `
                }

                </div>


                <div class="carrito-producto-info">

                    <p class="carrito-producto-categoria">
                        Producto oficial
                    </p>

                    <h3>
                        ${producto.nombre}
                    </h3>

                    ${talla}

                    <strong class="carrito-producto-precio">
                        ${formatearPrecio(producto.precio)}
                    </strong>

                </div>


                <div class="carrito-producto-acciones">


                    <div class="carrito-cantidad">

                        <button
                            type="button"
                            class="carrito-cantidad-menos"
                            data-indice="${indice}"
                            aria-label="Reducir cantidad"
                        >
                            −
                        </button>


                        <span>
                            ${producto.cantidad}
                        </span>


                        <button
                            type="button"
                            class="carrito-cantidad-mas"
                            data-indice="${indice}"
                            aria-label="Aumentar cantidad"
                        >
                            +
                        </button>

                    </div>


                    <strong class="carrito-producto-subtotal">

                        ${formatearPrecio(
                    Number(producto.precio) *
                    Number(producto.cantidad)
                )
                }

                    </strong>


                    <button
                        type="button"
                        class="carrito-eliminar"
                        data-indice="${indice}"
                    >

                        <i class="bi bi-trash3"></i>

                        <span>
                            Eliminar
                        </span>

                    </button>

                </div>

            `;


            carritoLista.appendChild(
                tarjeta
            );

        }
    );


    actualizarResumen();

    actualizarContadorCarrito();

}


// -----------------------------------------------------
// CAMBIAR CANTIDAD
// -----------------------------------------------------

function cambiarCantidad(
    indice,
    cambio
) {

    const carrito =
        obtenerCarrito();


    if (!carrito[indice]) {
        return;
    }


    let cantidad =
        Number(
            carrito[indice].cantidad
        ) || 1;


    cantidad += cambio;


    if (cantidad < 1) {
        cantidad = 1;
    }


    if (cantidad > 99) {
        cantidad = 99;
    }


    carrito[indice].cantidad =
        cantidad;


    guardarCarrito(
        carrito
    );


    mostrarCarrito();

}


// -----------------------------------------------------
// ELIMINAR PRODUCTO
// -----------------------------------------------------

function eliminarProducto(indice) {

    const carrito =
        obtenerCarrito();


    if (!carrito[indice]) {
        return;
    }


    carrito.splice(
        indice,
        1
    );


    guardarCarrito(
        carrito
    );


    mostrarCarrito();

}


// -----------------------------------------------------
// EVENTOS DE LOS PRODUCTOS
// -----------------------------------------------------

if (carritoLista) {

    carritoLista.addEventListener(
        "click",
        evento => {


            // -----------------------------------------
            // MENOS
            // -----------------------------------------

            const botonMenos =
                evento.target.closest(
                    ".carrito-cantidad-menos"
                );


            if (botonMenos) {

                const indice =
                    Number(
                        botonMenos.dataset.indice
                    );


                cambiarCantidad(
                    indice,
                    -1
                );


                return;

            }


            // -----------------------------------------
            // MÁS
            // -----------------------------------------

            const botonMas =
                evento.target.closest(
                    ".carrito-cantidad-mas"
                );


            if (botonMas) {

                const indice =
                    Number(
                        botonMas.dataset.indice
                    );


                cambiarCantidad(
                    indice,
                    1
                );


                return;

            }


            // -----------------------------------------
            // ELIMINAR
            // -----------------------------------------

            const botonEliminar =
                evento.target.closest(
                    ".carrito-eliminar"
                );


            if (botonEliminar) {

                const indice =
                    Number(
                        botonEliminar.dataset.indice
                    );


                eliminarProducto(
                    indice
                );

            }

        }
    );

}


// -----------------------------------------------------
// FINALIZAR PEDIDO
// -----------------------------------------------------

if (botonFinalizar) {

    botonFinalizar.addEventListener(
        "click",
        () => {

            const carrito =
                obtenerCarrito();


            if (carrito.length === 0) {
                return;
            }


            alert(
                "El proceso de pedido estará disponible próximamente."
            );

        }
    );

}


// -----------------------------------------------------
// INICIALIZAR
// -----------------------------------------------------

mostrarCarrito();
