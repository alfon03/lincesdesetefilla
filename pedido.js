// =====================================================
// PEDIDO - LINCES DE SETEFILLA
// =====================================================


// -----------------------------------------------------
// ELEMENTOS DEL DOM
// -----------------------------------------------------

const pedidoProductos =
    document.getElementById("pedido-productos");

const pedidoSubtotal =
    document.getElementById("pedido-subtotal");

const pedidoTotal =
    document.getElementById("pedido-total");

const pedidoError =
    document.getElementById("pedido-error");

const botonConfirmar =
    document.getElementById(
        "boton-confirmar-pedido"
    );

const contadorCarrito =
    document.getElementById(
        "contador-carrito"
    );


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
// FORMATO DE PRECIO
// -----------------------------------------------------

function formatearPrecio(precio) {

    return Number(precio)
        .toFixed(2)
        .replace(".", ",") + " €";

}


// -----------------------------------------------------
// CONTADOR DEL CARRITO
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


    contadorCarrito.style.display =
        cantidad === 0
            ? "none"
            : "flex";

}


// -----------------------------------------------------
// MOSTRAR PRODUCTOS
// -----------------------------------------------------

function mostrarProductos() {

    const carrito =
        obtenerCarrito();


    if (!pedidoProductos) {
        return;
    }


    pedidoProductos.innerHTML = "";


    carrito.forEach(producto => {

        const elemento =
            document.createElement("article");


        elemento.className =
            "pedido-producto";


        const imagen =
            producto.imagen || "";


        const talla =
            producto.talla
                ? `Talla: ${producto.talla} · `
                : "";


        const cantidad =
            Number(
                producto.cantidad || 0
            );


        const subtotalProducto =
            Number(producto.precio || 0) *
            cantidad;


        elemento.innerHTML = `

            <div class="pedido-producto-imagen">

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


            <div class="pedido-producto-info">

                <h3>
                    ${producto.nombre}
                </h3>

                <p class="pedido-producto-detalle">
                    ${talla}Cantidad: ${cantidad}
                </p>

            </div>


            <strong class="pedido-producto-precio">
                ${formatearPrecio(subtotalProducto)}
            </strong>

        `;


        pedidoProductos.appendChild(
            elemento
        );

    });

}


// -----------------------------------------------------
// CALCULAR RESUMEN
// -----------------------------------------------------

function calcularSubtotal() {

    const carrito =
        obtenerCarrito();


    return carrito.reduce(
        (total, producto) => {

            return total +
                (
                    Number(producto.precio || 0) *
                    Number(producto.cantidad || 0)
                );

        },
        0
    );

}


function actualizarResumen() {

    const subtotal =
        calcularSubtotal();


    if (pedidoSubtotal) {

        pedidoSubtotal.textContent =
            formatearPrecio(subtotal);

    }


    if (pedidoTotal) {

        pedidoTotal.textContent =
            formatearPrecio(subtotal);

    }

}


// -----------------------------------------------------
// ERRORES
// -----------------------------------------------------

function mostrarError(mensaje) {

    if (!pedidoError) {
        return;
    }


    pedidoError.innerHTML = `
        <strong>
            Revisa los datos del pedido.
        </strong>

        <br>

        ${mensaje}
    `;


    pedidoError.hidden = false;


    pedidoError.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


function ocultarError() {

    if (!pedidoError) {
        return;
    }


    pedidoError.hidden = true;

    pedidoError.textContent = "";

}


// -----------------------------------------------------
// VALIDAR FORMULARIO
// -----------------------------------------------------

function validarFormulario() {

    const nombre =
        document.getElementById("nombre");

    const apellidos =
        document.getElementById("apellidos");

    const telefono =
        document.getElementById("telefono");

    const correo =
        document.getElementById("correo");

    const domicilio =
        document.getElementById("domicilio");

    const codigoPostal =
        document.getElementById("codigo-postal");


    if (!nombre.value.trim()) {

        nombre.focus();

        mostrarError(
            "Introduce tu nombre."
        );

        return false;

    }


    if (!apellidos.value.trim()) {

        apellidos.focus();

        mostrarError(
            "Introduce tus apellidos."
        );

        return false;

    }


    if (!telefono.value.trim()) {

        telefono.focus();

        mostrarError(
            "Introduce tu teléfono."
        );

        return false;

    }


    const telefonoLimpio =
        telefono.value
            .replace(/\s/g, "")
            .replace(/-/g, "");


    if (
        !/^[0-9+]{9,15}$/.test(
            telefonoLimpio
        )
    ) {

        telefono.focus();

        mostrarError(
            "Introduce un número de teléfono válido."
        );

        return false;

    }


    if (!correo.value.trim()) {

        correo.focus();

        mostrarError(
            "Introduce tu correo electrónico."
        );

        return false;

    }


    if (!correo.checkValidity()) {

        correo.focus();

        mostrarError(
            "Introduce un correo electrónico válido."
        );

        return false;

    }


    if (!domicilio.value.trim()) {

        domicilio.focus();

        mostrarError(
            "Introduce tu domicilio."
        );

        return false;

    }


    const codigoPostalLimpio =
        codigoPostal.value.trim();


    if (
        !/^[0-9]{5}$/.test(
            codigoPostalLimpio
        )
    ) {

        codigoPostal.focus();

        mostrarError(
            "Introduce un código postal válido de 5 cifras."
        );

        return false;

    }


    const entregaSeleccionada =
        document.querySelector(
            'input[name="entrega"]:checked'
        );


    if (!entregaSeleccionada) {

        mostrarError(
            "Selecciona una forma de entrega."
        );

        return false;

    }


    const pagoSeleccionado =
        document.querySelector(
            'input[name="pago"]:checked'
        );


    if (!pagoSeleccionado) {

        mostrarError(
            "Selecciona una forma de pago."
        );

        return false;

    }


    return true;

}


// -----------------------------------------------------
// DATOS DEL CLIENTE
// -----------------------------------------------------

function obtenerDatosCliente() {

    const entrega =
        document.querySelector(
            'input[name="entrega"]:checked'
        );


    const pago =
        document.querySelector(
            'input[name="pago"]:checked'
        );


    return {

        nombre:
            document.getElementById(
                "nombre"
            ).value.trim(),

        apellidos:
            document.getElementById(
                "apellidos"
            ).value.trim(),

        telefono:
            document.getElementById(
                "telefono"
            ).value.trim(),

        correo:
            document.getElementById(
                "correo"
            ).value.trim(),

        domicilio:
            document.getElementById(
                "domicilio"
            ).value.trim(),

        codigoPostal:
            document.getElementById(
                "codigo-postal"
            ).value.trim(),

        entrega:
            entrega
                ? entrega.value
                : "",

        pago:
            pago
                ? pago.value
                : ""

    };

}


// -----------------------------------------------------
// GENERAR NÚMERO DE PEDIDO
// -----------------------------------------------------

function generarNumeroPedido() {

    const ahora =
        new Date();


    const fecha =
        ahora
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, "");


    const aleatorio =
        Math.floor(
            1000 +
            Math.random() * 9000
        );


    return `LIN-${fecha}-${aleatorio}`;

}


// -----------------------------------------------------
// PREPARAR PEDIDO
// -----------------------------------------------------

function prepararPedido() {

    const carrito =
        obtenerCarrito();


    const datosCliente =
        obtenerDatosCliente();


    const subtotal =
        calcularSubtotal();


    return {

        numeroPedido:
            generarNumeroPedido(),

        fecha:
            new Date().toISOString(),

        cliente:
            datosCliente,

        productos:
            carrito.map(producto => ({

                id:
                    producto.id,

                nombre:
                    producto.nombre,

                precio:
                    Number(
                        producto.precio || 0
                    ),

                talla:
                    producto.talla || null,

                cantidad:
                    Number(
                        producto.cantidad || 0
                    ),

                subtotal:
                    Number(
                        producto.precio || 0
                    ) *
                    Number(
                        producto.cantidad || 0
                    )

            })),

        subtotal:
            subtotal,

        total:
            subtotal

    };

}


// -----------------------------------------------------
// GUARDAR PEDIDO
// -----------------------------------------------------

function guardarPedido(pedido) {

    localStorage.setItem(
        "ultimoPedido",
        JSON.stringify(pedido)
    );

}


// -----------------------------------------------------
// CONFIRMAR PEDIDO
// -----------------------------------------------------

async function confirmarPedido(evento) {

    if (evento) {
        evento.preventDefault();
    }

    console.log("1. Iniciando confirmación del pedido");

    const carrito = obtenerCarrito();

    if (!carrito.length) {

        mostrarError(
            "El carrito está vacío."
        );

        return;
    }


    // =========================================
    // DATOS DEL CLIENTE
    // =========================================

    const nombre =
        document.getElementById("nombre").value.trim();

    const apellidos =
        document.getElementById("apellidos").value.trim();

    const telefono =
        document.getElementById("telefono").value.trim();

    const correo =
        document.getElementById("correo").value.trim();

    const domicilio =
        document.getElementById("domicilio").value.trim();

    const codigoPostal =
        document.getElementById("codigo-postal").value.trim();


    // =========================================
    // VALIDAR DATOS
    // =========================================

    if (
        !nombre ||
        !apellidos ||
        !telefono ||
        !correo ||
        !domicilio ||
        !codigoPostal
    ) {

        mostrarError(
            "Completa todos los campos obligatorios."
        );

        return;
    }


    // =========================================
    // ENTREGA
    // =========================================

    const entregaSeleccionada =
        document.querySelector(
            'input[name="entrega"]:checked'
        );


    if (!entregaSeleccionada) {

        mostrarError(
            "Selecciona una forma de entrega."
        );

        return;
    }


    const entrega =
        entregaSeleccionada.value;


    // =========================================
    // PAGO
    // =========================================

    const pagoSeleccionado =
        document.querySelector(
            'input[name="pago"]:checked'
        );


    if (!pagoSeleccionado) {

        mostrarError(
            "Selecciona una forma de pago."
        );

        return;
    }


    const pago =
        pagoSeleccionado.value;


    // =========================================
    // CREAR PRODUCTOS DEL PEDIDO
    // =========================================

    const productos =
        carrito.map(producto => {

            const precio =
                Number(producto.precio || 0);

            const cantidad =
                Number(producto.cantidad || 0);

            return {

                id:
                    producto.id,

                nombre:
                    producto.nombre,

                precio:
                    precio,

                talla:
                    producto.talla || null,

                cantidad:
                    cantidad,

                subtotal:
                    precio * cantidad

            };

        });


    // =========================================
    // CALCULAR TOTAL
    // =========================================

    const subtotal =
        productos.reduce(
            (total, producto) => {

                return total +
                    producto.subtotal;

            },
            0
        );


    // =========================================
    // CREAR PEDIDO
    // =========================================

    const pedido = {

        numeroPedido:
            generarNumeroPedido(),

        fecha:
            new Date().toISOString(),

        cliente: {

            nombre:
                nombre,

            apellidos:
                apellidos,

            telefono:
                telefono,

            correo:
                correo,

            domicilio:
                domicilio,

            codigoPostal:
                codigoPostal,

            entrega:
                entrega,

            pago:
                pago

        },

        productos:
            productos,

        subtotal:
            subtotal,

        total:
            subtotal

    };


    console.log(
        "2. Pedido preparado:",
        pedido
    );


    // =========================================
    // BLOQUEAR BOTÓN
    // =========================================

    if (botonConfirmar) {

        botonConfirmar.disabled =
            true;

        botonConfirmar.textContent =
            "Procesando pedido...";

    }


    try {

        // =====================================
        // ENVIAR AL BACKEND
        // =====================================

        console.log(
            "3. Enviando pedido al backend..."
        );


        const respuesta =
            await fetch(
                "http://localhost:3000/api/pedido",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(pedido)

                }
            );


        console.log(
            "4. Respuesta recibida del backend:",
            respuesta.status
        );


        const resultado =
            await respuesta.json();


        console.log(
            "5. Resultado del backend:",
            resultado
        );


        if (
            !respuesta.ok ||
            !resultado.ok
        ) {

            throw new Error(
                resultado.mensaje ||
                "No se ha podido confirmar el pedido."
            );

        }


        console.log(
            "6. Pedido confirmado correctamente."
        );


        // =====================================
        // GUARDAR ÚLTIMO PEDIDO
        // =====================================

        localStorage.setItem(
            "ultimoPedido",
            JSON.stringify(pedido)
        );


        console.log(
            "7. ultimoPedido guardado:"
        );


        console.log(
            localStorage.getItem(
                "ultimoPedido"
            )
        );


        // =====================================
        // VACIAR CARRITO
        // =====================================

        localStorage.removeItem(
            "carrito"
        );


        console.log(
            "8. Carrito eliminado:"
        );


        console.log(
            localStorage.getItem(
                "carrito"
            )
        );


        // =====================================
        // REDIRECCIÓN
        // =====================================

        console.log(
            "9. Redirigiendo a confirmacion.html..."
        );


        window.location.replace(
            "./confirmacion.html"
        );


    } catch (error) {

        console.error(
            "Error confirmando el pedido:",
            error
        );


        if (botonConfirmar) {

            botonConfirmar.disabled =
                false;

            botonConfirmar.textContent =
                "Confirmar pedido";

        }


        mostrarError(
            error.message ||
            "No se ha podido confirmar el pedido."
        );

    }

}


// -----------------------------------------------------
// EVENTO CONFIRMAR
// -----------------------------------------------------

if (botonConfirmar) {

    botonConfirmar.addEventListener(
        "click",
        evento => {
            confirmarPedido(evento);
        }
    );

}


// -----------------------------------------------------
// INICIALIZAR
// -----------------------------------------------------

function inicializarPedido() {

    const carrito =
        obtenerCarrito();


    if (carrito.length === 0) {

        if (pedidoProductos) {

            pedidoProductos.innerHTML = `

                <div class="pedido-sin-productos">

                    <p>
                        No hay productos en tu carrito.
                    </p>

                    <a href="tienda.html">
                        Volver a la tienda
                    </a>

                </div>

            `;

        }


        if (botonConfirmar) {

            botonConfirmar.disabled =
                true;

        }

    } else {

        mostrarProductos();

        actualizarResumen();

    }


    actualizarContadorCarrito();

}


inicializarPedido();

