// =====================================================
// CONFIRMACIÓN DE PEDIDO - LINCES DE SETEFILLA
// =====================================================


const contenedor =
    document.getElementById(
        "confirmacion-pedido"
    );


const contadorCarrito =
    document.getElementById(
        "contador-carrito"
    );


// -----------------------------------------------------
// FORMATO DE PRECIO
// -----------------------------------------------------

function formatearPrecio(precio) {

    return Number(precio)
        .toFixed(2)
        .replace(".", ",") + " €";

}


// -----------------------------------------------------
// ACTUALIZAR CONTADOR
// -----------------------------------------------------

function actualizarContadorCarrito() {

    if (!contadorCarrito) {
        return;
    }


    contadorCarrito.textContent =
        "0";


    contadorCarrito.style.display =
        "none";

}


// -----------------------------------------------------
// CARGAR PEDIDO
// -----------------------------------------------------

function cargarPedido() {

    const pedidoGuardado =
        localStorage.getItem(
            "ultimoPedido"
        );


    if (!pedidoGuardado) {

        mostrarPedidoNoEncontrado();

        return;

    }


    let pedido;


    try {

        pedido =
            JSON.parse(
                pedidoGuardado
            );

    } catch (error) {

        console.error(error);

        mostrarPedidoNoEncontrado();

        return;

    }


    mostrarPedido(
        pedido
    );

}


// -----------------------------------------------------
// MOSTRAR PEDIDO
// -----------------------------------------------------

function mostrarPedido(pedido) {

    const cliente =
        pedido.cliente;


    const productos =
        pedido.productos || [];


    const productosHTML =
        productos.map(producto => {

            const talla =
                producto.talla
                    ? `
                        <span>
                            Talla: ${producto.talla}
                        </span>
                    `
                    : "";


            return `

                <article class="confirmacion-producto">

                    <div class="confirmacion-producto-imagen">

                        ${producto.imagen
                    ? `
                                    <img
                                        src="${producto.imagen}"
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


                    <div class="confirmacion-producto-info">

                        <h3>
                            ${producto.nombre}
                        </h3>

                        <p>
                            ${talla}

                            <span>
                                Cantidad: ${producto.cantidad}
                            </span>
                        </p>

                    </div>


                    <strong>
                        ${formatearPrecio(producto.subtotal)}
                    </strong>

                </article>

            `;

        }).join("");


    contenedor.innerHTML = `

        <div class="confirmacion-numero">

            <span>
                Número de pedido
            </span>

            <strong>
                ${pedido.numeroPedido}
            </strong>

        </div>


        <section class="confirmacion-bloque">

            <div class="confirmacion-bloque-cabecera">

                <i class="bi bi-bag-check"></i>

                <div>

                    <h2>
                        Resumen del pedido
                    </h2>

                    <p>
                        Estos son los productos incluidos en tu pedido.
                    </p>

                </div>

            </div>


            <div class="confirmacion-productos">

                ${productosHTML}

            </div>


            <div class="confirmacion-separador"></div>


            <div class="confirmacion-total">

                <span>
                    Total
                </span>

                <strong>
                    ${formatearPrecio(pedido.total)}
                </strong>

            </div>

        </section>


        <div class="confirmacion-dos-columnas">


            <section class="confirmacion-bloque">

                <div class="confirmacion-bloque-cabecera">

                    <i class="bi bi-person"></i>

                    <div>

                        <h2>
                            Datos del comprador
                        </h2>

                    </div>

                </div>


                <div class="confirmacion-datos">

                    <div>
                        <span>Nombre</span>
                        <strong>
                            ${cliente.nombre}
                            ${cliente.apellidos}
                        </strong>
                    </div>


                    <div>
                        <span>Teléfono</span>
                        <strong>
                            ${cliente.telefono}
                        </strong>
                    </div>


                    <div>
                        <span>Correo electrónico</span>
                        <strong>
                            ${cliente.correo}
                        </strong>
                    </div>


                    <div>
                        <span>Domicilio</span>
                        <strong>
                            ${cliente.domicilio}
                        </strong>
                    </div>


                    <div>
                        <span>Código postal</span>
                        <strong>
                            ${cliente.codigoPostal}
                        </strong>
                    </div>

                </div>

            </section>



            <section class="confirmacion-bloque">

                <div class="confirmacion-bloque-cabecera">

                    <i class="bi bi-truck"></i>

                    <div>

                        <h2>
                            Entrega y pago
                        </h2>

                    </div>

                </div>


                <div class="confirmacion-datos">

                    <div>
                        <span>Entrega</span>
                        <strong>
                            ${cliente.entrega}
                        </strong>
                    </div>


                    <div>
                        <span>Forma de pago</span>
                        <strong>
                            ${cliente.pago}
                        </strong>
                    </div>

                </div>

            </section>

        </div>


        <div class="confirmacion-acciones">

            <a
                href="tienda.html"
                class="boton-confirmacion"
            >
                Seguir comprando
            </a>

            <a
                href="index.html"
                class="confirmacion-volver"
            >
                Volver al inicio
            </a>

        </div>

    `;

}


// -----------------------------------------------------
// PEDIDO NO ENCONTRADO
// -----------------------------------------------------

function mostrarPedidoNoEncontrado() {

    contenedor.innerHTML = `

        <div class="confirmacion-bloque confirmacion-no-encontrado">

            <div class="confirmacion-icono-secundario">

                <i class="bi bi-receipt"></i>

            </div>


            <h2>
                No hay ningún pedido disponible
            </h2>


            <p>
                No hemos encontrado los datos del último pedido.
            </p>


            <a
                href="tienda.html"
                class="boton-confirmacion"
            >
                Ir a la tienda
            </a>

        </div>

    `;

}


// -----------------------------------------------------
// INICIALIZAR
// -----------------------------------------------------

actualizarContadorCarrito();

cargarPedido();

