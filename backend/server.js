// =====================================================
// BACKEND - LINCES DE SETEFILLA
// =====================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");

const app = express();

const PORT = 3000;


// =====================================================
// RESEND
// =====================================================

const resend =
    new Resend(
        process.env.RESEND_API_KEY
    );

const correoAdministrador = "lincesdesetefilla@gmail.com";
// =====================================================
// CONFIGURACIÓN
// =====================================================

app.use(cors());
app.use(express.json());


// =====================================================
// ARCHIVO DE PEDIDOS
// =====================================================

const archivoPedidos =
    path.join(
        __dirname,
        "pedidos.json"
    );


function obtenerPedidos() {

    try {

        if (!fs.existsSync(archivoPedidos)) {
            return [];
        }

        const contenido =
            fs.readFileSync(
                archivoPedidos,
                "utf8"
            );

        if (!contenido.trim()) {
            return [];
        }

        const pedidos =
            JSON.parse(
                contenido
            );

        if (!Array.isArray(pedidos)) {
            return [];
        }

        return pedidos;

    } catch (error) {

        console.error(
            "Error al leer pedidos.json:",
            error
        );

        return [];
    }
}


function guardarPedidos(
    pedidos
) {

    fs.writeFileSync(
        archivoPedidos,
        JSON.stringify(
            pedidos,
            null,
            4
        ),
        "utf8"
    );
}


// =====================================================
// FORMATEAR PRECIO
// =====================================================

function formatearPrecio(
    precio
) {

    return Number(precio)
        .toFixed(2)
        .replace(".", ",") + " €";
}


// =====================================================
// ENVIAR PEDIDO A GOOGLE SHEETS
// =====================================================

async function enviarPedidoAGoogleSheets(
    pedido
) {

    const url =
        process.env.GOOGLE_APPS_SCRIPT_URL;


    if (!url) {

        console.warn(
            "GOOGLE_APPS_SCRIPT_URL no está configurada."
        );

        return {

            ok: false,

            omitido: true,

            mensaje:
                "URL de Google Apps Script no configurada."

        };

    }


    const cliente =
        pedido.cliente || {};


    const productos =
        Array.isArray(
            pedido.productos
        )
            ? pedido.productos
            : [];


    // -------------------------------------------------
    // CONVERTIR PRODUCTOS A TEXTO PARA GOOGLE SHEETS
    // -------------------------------------------------

    const productosTexto =
        productos
            .map(
                producto => {

                    const nombre =
                        producto.nombre || "Producto";


                    const talla =
                        producto.talla
                            ? ` - Talla ${producto.talla}`
                            : "";


                    const cantidad =
                        Number(
                            producto.cantidad || 0
                        );


                    const subtotal =
                        Number(
                            producto.subtotal || 0
                        );


                    return (
                        `${nombre}` +
                        `${talla}` +
                        ` x${cantidad}` +
                        ` (${formatearPrecio(subtotal)})`
                    );

                }
            )
            .join(" | ");


    // -------------------------------------------------
    // PREPARAR DATOS PARA APPS SCRIPT
    // -------------------------------------------------

    const datos = {

        accion:
            "guardarPedido",

        numeroPedido:
            pedido.numeroPedido || "",

        nombre:
            cliente.nombre || "",

        apellidos:
            cliente.apellidos || "",

        email:
            cliente.correo || "",

        telefono:
            cliente.telefono || "",

        direccion:
            cliente.domicilio || "",

        codigoPostal:
            cliente.codigoPostal || "",

        entrega:
            pedido.entrega || cliente.entrega || "",

        pago:
            pedido.pago || cliente.pago || "",

        productos:
            productosTexto,

        total:
            Number(
                pedido.total || 0
            )

    };


    // -------------------------------------------------
    // ENVIAR A GOOGLE APPS SCRIPT
    // -------------------------------------------------

    try {

        const respuesta =
            await fetch(
                url,
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(
                            datos
                        )

                }
            );


        const texto =
            await respuesta.text();


        let resultado;


        try {

            resultado =
                JSON.parse(
                    texto
                );

        }
        catch (error) {

            resultado = {

                ok: false,

                mensaje:
                    "Google Apps Script devolvió una respuesta no válida.",

                respuesta:
                    texto

            };

        }


        if (
            !respuesta.ok
        ) {

            console.error(
                "Google Apps Script respondió con error:",
                resultado
            );


            return {

                ok: false,

                mensaje:
                    "Google Apps Script respondió con error.",

                resultado

            };

        }


        if (
            !resultado.ok
        ) {

            console.error(
                "Google Sheets no aceptó el pedido:",
                resultado
            );


            return {

                ok: false,

                mensaje:
                    resultado.mensaje ||
                    "Google Sheets no aceptó el pedido.",

                resultado

            };

        }


        console.log(
            "Pedido enviado correctamente a Google Sheets:",
            pedido.numeroPedido
        );


        return {

            ok: true,

            resultado

        };

    }
    catch (error) {

        console.error(
            "Error conectando con Google Apps Script:",
            error
        );


        return {

            ok: false,

            mensaje:
                error.message

        };

    }

}

// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHtml(
    texto
) {

    return String(
        texto ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// =====================================================
// CREAR HTML DEL CORREO
// =====================================================

// =====================================================
// CREAR HTML DEL CORREO DE CONFIRMACIÓN AL CLIENTE
// =====================================================

function crearCorreoPedido(
    pedido
) {

    const cliente =
        pedido.cliente || {};

    const productos =
        Array.isArray(
            pedido.productos
        )
            ? pedido.productos
            : [];

    // ---------------------------------------------
    // DATOS
    // ---------------------------------------------

    const nombreCliente =
        cliente.nombre || "cliente";

    const entrega =
        pedido.entrega ||
        cliente.entrega ||
        "-";

    const pago =
        pedido.pago ||
        cliente.pago ||
        "-";

    const domicilio =
        cliente.domicilio ||
        cliente.direccion ||
        "-";

    // ---------------------------------------------
    // PRODUCTOS
    // ---------------------------------------------

    const filasProductos =
        productos
            .map(
                producto => {

                    const cantidad =
                        Number(
                            producto.cantidad
                        ) || 1;

                    const precio =
                        Number(
                            producto.precio
                        ) || 0;

                    const subtotal =
                        Number(
                            producto.subtotal
                        ) ||
                        (
                            precio *
                            cantidad
                        );

                    const talla =
                        producto.talla
                            ? `
                                <div
                                    style="
                                        color:#6b7280;
                                        font-size:12px;
                                        margin-top:4px;
                                    "
                                >
                                    Talla:
                                    ${escaparHtml(
                                producto.talla
                            )}
                                </div>
                            `
                            : "";

                    return `
                        <tr>

                            <td
                                style="
                                    padding:15px 10px;
                                    border-bottom:1px solid #e5e7eb;
                                    vertical-align:top;
                                "
                            >

                                <strong
                                    style="
                                        color:#111827;
                                        font-size:14px;
                                    "
                                >
                                    ${escaparHtml(
                        producto.nombre || ""
                    )}
                                </strong>

                                ${talla}

                            </td>


                            <td
                                style="
                                    padding:15px 10px;
                                    text-align:center;
                                    border-bottom:1px solid #e5e7eb;
                                    color:#4b5563;
                                    font-size:14px;
                                    vertical-align:top;
                                "
                            >
                                ${cantidad}
                            </td>


                            <td
                                style="
                                    padding:15px 10px;
                                    text-align:right;
                                    border-bottom:1px solid #e5e7eb;
                                    color:#111827;
                                    font-weight:bold;
                                    font-size:14px;
                                    vertical-align:top;
                                "
                            >
                                ${formatearPrecio(
                        subtotal
                    )}
                            </td>

                        </tr>
                    `;

                }
            )
            .join("");


    // ---------------------------------------------
    // HTML DEL CORREO
    // ---------------------------------------------

    return `
        <!DOCTYPE html>

        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                Confirmación de pedido
                ${escaparHtml(
        pedido.numeroPedido || ""
    )}
            </title>

        </head>


        <body
            style="
                margin:0;
                padding:0;
                background:#f3f4f6;
                font-family:Arial,Helvetica,sans-serif;
                color:#111827;
            "
        >

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="
                    background:#f3f4f6;
                "
            >

                <tr>

                    <td
                        align="center"
                        style="
                            padding:30px 15px;
                        "
                    >

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                max-width:680px;
                                background:#ffffff;
                                border-radius:14px;
                                overflow:hidden;
                                box-shadow:
                                    0 4px 18px
                                    rgba(0,0,0,0.08);
                            "
                        >

                            <!-- ================================= -->
                            <!-- CABECERA -->
                            <!-- ================================= -->

                            <tr>

                                <td
                                    style="
                                        background:#061522;
                                        padding:30px 25px;
                                        text-align:center;
                                    "
                                >

                                    <img
                                        src="https://lincesdesetefilla.es/assets/LOGO.PNG"
                                        alt="Linces de Setefilla"
                                        style="
                                            display:block;
                                            max-width:180px;
                                            width:100%;
                                            height:auto;
                                            margin:0 auto 20px auto;
                                        "
                                    >


                                    <div
                                        style="
                                            color:#ffffff;
                                            font-size:25px;
                                            font-weight:bold;
                                            line-height:1.3;
                                        "
                                    >
                                        ¡Pedido recibido!
                                    </div>


                                    <div
                                        style="
                                            color:#d1d5db;
                                            font-size:14px;
                                            margin-top:8px;
                                        "
                                    >
                                        Gracias por confiar en
                                        Linces de Setefilla
                                    </div>

                                </td>

                            </tr>


                            <!-- ================================= -->
                            <!-- CONTENIDO -->
                            <!-- ================================= -->

                            <tr>

                                <td
                                    style="
                                        padding:30px 25px;
                                    "
                                >

                                    <!-- SALUDO -->

                                    <div
                                        style="
                                            font-size:22px;
                                            font-weight:bold;
                                            color:#111827;
                                            margin-bottom:12px;
                                        "
                                    >
                                        ¡Gracias por tu pedido,
                                        ${escaparHtml(
        nombreCliente
    )}!
                                    </div>


                                    <p
                                        style="
                                            margin:0;
                                            color:#4b5563;
                                            font-size:15px;
                                            line-height:1.6;
                                        "
                                    >
                                        Hemos recibido correctamente
                                        tu pedido y ya lo tenemos
                                        registrado.
                                    </p>


                                    <!-- NUMERO PEDIDO -->

                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            margin-top:25px;
                                        "
                                    >

                                        <tr>

                                            <td
                                                style="
                                                    background:#f8fafc;
                                                    border:1px solid #e5e7eb;
                                                    border-radius:10px;
                                                    padding:18px;
                                                    text-align:center;
                                                "
                                            >

                                                <div
                                                    style="
                                                        color:#6b7280;
                                                        font-size:12px;
                                                        text-transform:uppercase;
                                                        letter-spacing:0.5px;
                                                    "
                                                >
                                                    Número de pedido
                                                </div>


                                                <div
                                                    style="
                                                        margin-top:7px;
                                                        color:#061522;
                                                        font-size:22px;
                                                        font-weight:bold;
                                                    "
                                                >
                                                    ${escaparHtml(
        pedido.numeroPedido || "-"
    )}
                                                </div>

                                            </td>

                                        </tr>

                                    </table>


                                    <!-- PRODUCTOS -->

                                    <div
                                        style="
                                            margin-top:32px;
                                            margin-bottom:15px;
                                            font-size:19px;
                                            font-weight:bold;
                                            color:#111827;
                                        "
                                    >
                                        Resumen del pedido
                                    </div>


                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            border-collapse:collapse;
                                            border:1px solid #e5e7eb;
                                            font-size:14px;
                                        "
                                    >

                                        <thead>

                                            <tr
                                                style="
                                                    background:#061522;
                                                    color:#ffffff;
                                                "
                                            >

                                                <th
                                                    style="
                                                        padding:13px 10px;
                                                        text-align:left;
                                                        font-size:12px;
                                                    "
                                                >
                                                    Producto
                                                </th>


                                                <th
                                                    style="
                                                        padding:13px 10px;
                                                        text-align:center;
                                                        font-size:12px;
                                                    "
                                                >
                                                    Cant.
                                                </th>


                                                <th
                                                    style="
                                                        padding:13px 10px;
                                                        text-align:right;
                                                        font-size:12px;
                                                    "
                                                >
                                                    Total
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            ${filasProductos}

                                        </tbody>

                                    </table>


                                    <!-- TOTAL -->

                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            margin-top:18px;
                                        "
                                    >

                                        <tr>

                                            <td
                                                style="
                                                    background:#f8fafc;
                                                    border:1px solid #e5e7eb;
                                                    border-radius:10px;
                                                    padding:18px;
                                                    text-align:right;
                                                "
                                            >

                                                <span
                                                    style="
                                                        color:#6b7280;
                                                        font-size:13px;
                                                    "
                                                >
                                                    TOTAL DEL PEDIDO
                                                </span>


                                                <br>


                                                <strong
                                                    style="
                                                        display:inline-block;
                                                        margin-top:5px;
                                                        color:#061522;
                                                        font-size:27px;
                                                    "
                                                >
                                                    ${formatearPrecio(
        pedido.total || 0
    )}
                                                </strong>

                                            </td>

                                        </tr>

                                    </table>


                                    <!-- DATOS DE ENTREGA -->

                                    <div
                                        style="
                                            margin-top:32px;
                                            margin-bottom:15px;
                                            font-size:19px;
                                            font-weight:bold;
                                            color:#111827;
                                        "
                                    >
                                        Datos de entrega
                                    </div>


                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            background:#f8fafc;
                                            border:1px solid #e5e7eb;
                                            border-radius:10px;
                                        "
                                    >

                                        <tr>

                                            <td
                                                style="
                                                    padding:16px;
                                                    width:50%;
                                                    vertical-align:top;
                                                "
                                            >

                                                <div
                                                    style="
                                                        color:#6b7280;
                                                        font-size:12px;
                                                        margin-bottom:5px;
                                                    "
                                                >
                                                    ENTREGA
                                                </div>


                                                <div
                                                    style="
                                                        color:#111827;
                                                        font-size:15px;
                                                        font-weight:bold;
                                                    "
                                                >
                                                    ${escaparHtml(
        entrega
    )}
                                                </div>

                                            </td>


                                            <td
                                                style="
                                                    padding:16px;
                                                    width:50%;
                                                    vertical-align:top;
                                                "
                                            >

                                                <div
                                                    style="
                                                        color:#6b7280;
                                                        font-size:12px;
                                                        margin-bottom:5px;
                                                    "
                                                >
                                                    CÓDIGO POSTAL
                                                </div>


                                                <div
                                                    style="
                                                        color:#111827;
                                                        font-size:15px;
                                                        font-weight:bold;
                                                    "
                                                >
                                                    ${escaparHtml(
        cliente.codigoPostal || "-"
    )}
                                                </div>

                                            </td>

                                        </tr>


                                        <tr>

                                            <td
                                                colspan="2"
                                                style="
                                                    padding:0 16px 16px 16px;
                                                "
                                            >

                                                <div
                                                    style="
                                                        color:#6b7280;
                                                        font-size:12px;
                                                        margin-bottom:5px;
                                                    "
                                                >
                                                    DOMICILIO
                                                </div>


                                                <div
                                                    style="
                                                        color:#111827;
                                                        font-size:15px;
                                                    "
                                                >
                                                    ${escaparHtml(
        domicilio
    )}
                                                </div>

                                            </td>

                                        </tr>

                                    </table>


                                    <!-- FORMA DE PAGO -->

                                    <div
                                        style="
                                            margin-top:25px;
                                            margin-bottom:15px;
                                            font-size:19px;
                                            font-weight:bold;
                                            color:#111827;
                                        "
                                    >
                                        Forma de pago
                                    </div>


                                    <div
                                        style="
                                            background:#f8fafc;
                                            border:1px solid #e5e7eb;
                                            border-radius:10px;
                                            padding:16px;
                                            color:#111827;
                                            font-size:15px;
                                            font-weight:bold;
                                        "
                                    >
                                        ${escaparHtml(
        pago
    )}
                                    </div>


                                    <!-- AVISO ADMINISTRADOR -->

                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            margin-top:30px;
                                        "
                                    >

                                        <tr>

                                            <td
                                                style="
                                                    background:#061522;
                                                    border-radius:10px;
                                                    padding:20px;
                                                    text-align:center;
                                                "
                                            >

                                                <div
                                                    style="
                                                        color:#ffffff;
                                                        font-size:16px;
                                                        font-weight:bold;
                                                        line-height:1.4;
                                                    "
                                                >
                                                    📩 Próximamente nos pondremos
                                                    en contacto contigo
                                                </div>


                                                <div
                                                    style="
                                                        color:#d1d5db;
                                                        font-size:13px;
                                                        line-height:1.6;
                                                        margin-top:8px;
                                                    "
                                                >
                                                    En unas horas, un administrador
                                                    de Linces de Setefilla se pondrá
                                                    en contacto contigo para gestionar
                                                    los detalles de la entrega y el pago.
                                                </div>

                                            </td>

                                        </tr>

                                    </table>


                                    <p
                                        style="
                                            margin:28px 0 0;
                                            color:#6b7280;
                                            font-size:12px;
                                            line-height:1.6;
                                            text-align:center;
                                        "
                                    >
                                        Este correo es una confirmación de que
                                        hemos recibido correctamente tu pedido.
                                    </p>

                                </td>

                            </tr>


                            <!-- ================================= -->
                            <!-- PIE -->
                            <!-- ================================= -->

                            <tr>

                                <td
                                    style="
                                        background:#061522;
                                        padding:22px;
                                        text-align:center;
                                    "
                                >

                                    <div
                                        style="
                                            color:#ffffff;
                                            font-size:14px;
                                            font-weight:bold;
                                        "
                                    >
                                        Linces de Setefilla
                                    </div>


                                    <div
                                        style="
                                            color:#9ca3af;
                                            font-size:12px;
                                            margin-top:6px;
                                        "
                                    >
                                        Gracias por confiar en nosotros
                                    </div>

                                </td>

                            </tr>

                        </table>

                    </td>

                </tr>

            </table>

        </body>

        </html>
    `;
}


// =====================================================
// CREAR HTML DEL CORREO INTERNO
// =====================================================

function crearCorreoAdministrador(pedido) {

    const cliente =
        pedido.cliente || {};

    const productos =
        Array.isArray(pedido.productos)
            ? pedido.productos
            : [];

    // ---------------------------------------------
    // DATOS DEL CLIENTE
    // ---------------------------------------------

    const nombreCompleto =
        `${cliente.nombre || ""} ${cliente.apellidos || ""}`.trim();

    const direccion =
        cliente.domicilio ||
        cliente.direccion ||
        "-";

    const entrega =
        pedido.entrega ||
        cliente.entrega ||
        "-";

    const pago =
        pedido.pago ||
        cliente.pago ||
        "-";

    // ---------------------------------------------
    // PRODUCTOS
    // ---------------------------------------------

    const filasProductos =
        productos.map(producto => {

            const cantidad =
                Number(producto.cantidad) || 1;

            const precio =
                Number(producto.precio) || 0;

            const subtotal =
                precio * cantidad;

            return `
                <tr>

                    <td style="
                        padding:14px 10px;
                        border-bottom:1px solid #e5e7eb;
                        color:#1f2937;
                        font-size:14px;
                    ">
                        <strong>
                            ${escaparHtml(producto.nombre || "")}
                        </strong>
                    </td>

                    <td style="
                        padding:14px 10px;
                        border-bottom:1px solid #e5e7eb;
                        text-align:center;
                        color:#4b5563;
                        font-size:14px;
                    ">
                        ${escaparHtml(producto.talla || "-")}
                    </td>

                    <td style="
                        padding:14px 10px;
                        border-bottom:1px solid #e5e7eb;
                        text-align:center;
                        color:#4b5563;
                        font-size:14px;
                    ">
                        ${cantidad}
                    </td>

                    <td style="
                        padding:14px 10px;
                        border-bottom:1px solid #e5e7eb;
                        text-align:right;
                        color:#4b5563;
                        font-size:14px;
                    ">
                        ${formatearPrecio(precio)}
                    </td>

                    <td style="
                        padding:14px 10px;
                        border-bottom:1px solid #e5e7eb;
                        text-align:right;
                        font-weight:bold;
                        color:#111827;
                        font-size:14px;
                    ">
                        ${formatearPrecio(subtotal)}
                    </td>

                </tr>
            `;

        }).join("");

    // ---------------------------------------------
    // HTML DEL CORREO
    // ---------------------------------------------

    return `
        <!DOCTYPE html>

        <html lang="es">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>
                Nuevo pedido ${escaparHtml(
        pedido.numeroPedido || ""
    )}
            </title>

        </head>

        <body style="
            margin:0;
            padding:0;
            background:#f3f4f6;
            font-family:Arial,Helvetica,sans-serif;
            color:#111827;
        ">

            <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="background:#f3f4f6;"
            >

                <tr>

                    <td
                        align="center"
                        style="padding:30px 15px;"
                    >

                        <table
                            width="100%"
                            cellpadding="0"
                            cellspacing="0"
                            border="0"
                            style="
                                max-width:760px;
                                background:#ffffff;
                                border-radius:14px;
                                overflow:hidden;
                                box-shadow:0 4px 18px rgba(0,0,0,0.08);
                            "
                        >

                            <!-- ================================= -->
                            <!-- CABECERA -->
                            <!-- ================================= -->

                            <tr>

                                <td
                                    style="
                                        background:#061522;
                                        padding:30px 25px;
                                        text-align:center;
                                    "
                                >

                                    <img
                                        src="https://lincesdesetefilla.es/assets/LOGO.PNG"
                                        alt="Linces de Setefilla"
                                        style="
                                            display:block;
                                            max-width:180px;
                                            width:100%;
                                            height:auto;
                                            margin:0 auto 22px auto;
                                        "
                                    >

                                    <div
                                        style="
                                            color:#ffffff;
                                            font-size:26px;
                                            font-weight:bold;
                                            line-height:1.3;
                                        "
                                    >
                                        Nuevo pedido recibido
                                    </div>

                                    <div
                                        style="
                                            color:#d1d5db;
                                            font-size:15px;
                                            margin-top:10px;
                                        "
                                    >
                                        Pedido nº
                                        <strong style="color:#ffffff;">
                                            ${escaparHtml(
        pedido.numeroPedido || "-"
    )}
                                        </strong>
                                    </div>

                                </td>

                            </tr>


                            <!-- ================================= -->
                            <!-- CONTENIDO -->
                            <!-- ================================= -->

                            <tr>

                                <td
                                    style="
                                        padding:30px 25px;
                                    "
                                >

                                    <!-- ============================= -->
                                    <!-- DATOS DEL CLIENTE -->
                                    <!-- ============================= -->

                                    <div
                                        style="
                                            font-size:20px;
                                            font-weight:bold;
                                            color:#111827;
                                            margin-bottom:18px;
                                        "
                                    >
                                        Datos del cliente
                                    </div>


                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            background:#f8fafc;
                                            border:1px solid #e5e7eb;
                                            border-radius:10px;
                                        "
                                    >

                                        <tr>

                                            <td
                                                style="
                                                    padding:16px;
                                                    width:50%;
                                                    vertical-align:top;
                                                "
                                            >

                                                <div style="
                                                    color:#6b7280;
                                                    font-size:12px;
                                                    margin-bottom:5px;
                                                ">
                                                    NOMBRE
                                                </div>

                                                <div style="
                                                    font-size:15px;
                                                    font-weight:bold;
                                                    color:#111827;
                                                ">
                                                    ${escaparHtml(
        nombreCompleto || "-"
    )}
                                                </div>

                                            </td>


                                            <td
                                                style="
                                                    padding:16px;
                                                    width:50%;
                                                    vertical-align:top;
                                                "
                                            >

                                                <div style="
                                                    color:#6b7280;
                                                    font-size:12px;
                                                    margin-bottom:5px;
                                                ">
                                                    TELÉFONO
                                                </div>

                                                <div style="
                                                    font-size:15px;
                                                    font-weight:bold;
                                                    color:#111827;
                                                ">
                                                    ${escaparHtml(
        cliente.telefono || "-"
    )}
                                                </div>

                                            </td>

                                        </tr>


                                        <tr>

                                            <td
                                                colspan="2"
                                                style="
                                                    padding:0 16px 16px 16px;
                                                "
                                            >

                                                <div style="
                                                    color:#6b7280;
                                                    font-size:12px;
                                                    margin-bottom:5px;
                                                ">
                                                    CORREO ELECTRÓNICO
                                                </div>

                                                <div style="
                                                    font-size:15px;
                                                    color:#111827;
                                                ">
                                                    ${escaparHtml(
        cliente.correo || "-"
    )}
                                                </div>

                                            </td>

                                        </tr>


                                        <tr>

                                            <td
                                                colspan="2"
                                                style="
                                                    padding:0 16px 16px 16px;
                                                "
                                            >

                                                <div style="
                                                    color:#6b7280;
                                                    font-size:12px;
                                                    margin-bottom:5px;
                                                ">
                                                    DIRECCIÓN
                                                </div>

                                                <div style="
                                                    font-size:15px;
                                                    color:#111827;
                                                ">
                                                    ${escaparHtml(
        direccion
    )}
                                                </div>

                                            </td>

                                        </tr>


                                        <tr>

                                            <td
                                                colspan="2"
                                                style="
                                                    padding:0 16px 16px 16px;
                                                "
                                            >

                                                <div style="
                                                    color:#6b7280;
                                                    font-size:12px;
                                                    margin-bottom:5px;
                                                ">
                                                    CÓDIGO POSTAL
                                                </div>

                                                <div style="
                                                    font-size:15px;
                                                    color:#111827;
                                                ">
                                                    ${escaparHtml(
        cliente.codigoPostal || "-"
    )}
                                                </div>

                                            </td>

                                        </tr>

                                    </table>


                                    <!-- ============================= -->
                                    <!-- INFORMACIÓN DEL PEDIDO -->
                                    <!-- ============================= -->

                                    <div
                                        style="
                                            font-size:20px;
                                            font-weight:bold;
                                            color:#111827;
                                            margin-top:32px;
                                            margin-bottom:18px;
                                        "
                                    >
                                        Información del pedido
                                    </div>


                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                    >

                                        <tr>

                                            <td
                                                style="
                                                    width:50%;
                                                    padding:16px;
                                                    background:#f8fafc;
                                                    border:1px solid #e5e7eb;
                                                    border-radius:10px;
                                                    vertical-align:top;
                                                "
                                            >

                                                <div style="
                                                    color:#6b7280;
                                                    font-size:12px;
                                                    margin-bottom:6px;
                                                ">
                                                    ENTREGA
                                                </div>

                                                <div style="
                                                    font-size:15px;
                                                    font-weight:bold;
                                                    color:#111827;
                                                ">
                                                    ${escaparHtml(
        entrega
    )}
                                                </div>

                                            </td>


                                            <td style="width:15px;">
                                            </td>


                                            <td
                                                style="
                                                    width:50%;
                                                    padding:16px;
                                                    background:#f8fafc;
                                                    border:1px solid #e5e7eb;
                                                    border-radius:10px;
                                                    vertical-align:top;
                                                "
                                            >

                                                <div style="
                                                    color:#6b7280;
                                                    font-size:12px;
                                                    margin-bottom:6px;
                                                ">
                                                    PAGO
                                                </div>

                                                <div style="
                                                    font-size:15px;
                                                    font-weight:bold;
                                                    color:#111827;
                                                ">
                                                    ${escaparHtml(
        pago
    )}
                                                </div>

                                            </td>

                                        </tr>

                                    </table>


                                    <!-- ============================= -->
                                    <!-- PRODUCTOS -->
                                    <!-- ============================= -->

                                    <div
                                        style="
                                            font-size:20px;
                                            font-weight:bold;
                                            color:#111827;
                                            margin-top:32px;
                                            margin-bottom:18px;
                                        "
                                    >
                                        Productos
                                    </div>


                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            border-collapse:collapse;
                                            font-size:14px;
                                            border:1px solid #e5e7eb;
                                        "
                                    >

                                        <thead>

                                            <tr
                                                style="
                                                    background:#061522;
                                                    color:#ffffff;
                                                "
                                            >

                                                <th
                                                    style="
                                                        padding:13px 10px;
                                                        text-align:left;
                                                        font-size:12px;
                                                    "
                                                >
                                                    Producto
                                                </th>

                                                <th
                                                    style="
                                                        padding:13px 10px;
                                                        text-align:center;
                                                        font-size:12px;
                                                    "
                                                >
                                                    Talla
                                                </th>

                                                <th
                                                    style="
                                                        padding:13px 10px;
                                                        text-align:center;
                                                        font-size:12px;
                                                    "
                                                >
                                                    Cant.
                                                </th>

                                                <th
                                                    style="
                                                        padding:13px 10px;
                                                        text-align:right;
                                                        font-size:12px;
                                                    "
                                                >
                                                    Precio
                                                </th>

                                                <th
                                                    style="
                                                        padding:13px 10px;
                                                        text-align:right;
                                                        font-size:12px;
                                                    "
                                                >
                                                    Subtotal
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            ${filasProductos}

                                        </tbody>

                                    </table>


                                    <!-- ============================= -->
                                    <!-- TOTAL -->
                                    <!-- ============================= -->

                                    <table
                                        width="100%"
                                        cellpadding="0"
                                        cellspacing="0"
                                        border="0"
                                        style="
                                            margin-top:20px;
                                        "
                                    >

                                        <tr>

                                            <td
                                                style="
                                                    text-align:right;
                                                    padding:18px;
                                                    background:#f8fafc;
                                                    border:1px solid #e5e7eb;
                                                    border-radius:10px;
                                                "
                                            >

                                                <span
                                                    style="
                                                        color:#6b7280;
                                                        font-size:14px;
                                                    "
                                                >
                                                    TOTAL DEL PEDIDO
                                                </span>

                                                <br>

                                                <strong
                                                    style="
                                                        display:inline-block;
                                                        margin-top:5px;
                                                        font-size:28px;
                                                        color:#061522;
                                                    "
                                                >
                                                    ${formatearPrecio(
        pedido.total || 0
    )}
                                                </strong>

                                            </td>

                                        </tr>

                                    </table>

                                </td>

                            </tr>


                            <!-- ================================= -->
                            <!-- PIE -->
                            <!-- ================================= -->

                            <tr>

                                <td
                                    style="
                                        background:#061522;
                                        padding:22px;
                                        text-align:center;
                                    "
                                >

                                    <div
                                        style="
                                            color:#ffffff;
                                            font-size:14px;
                                            font-weight:bold;
                                        "
                                    >
                                        Linces de Setefilla
                                    </div>

                                    <div
                                        style="
                                            color:#9ca3af;
                                            font-size:12px;
                                            margin-top:6px;
                                        "
                                    >
                                        Nuevo pedido recibido desde la tienda online
                                    </div>

                                </td>

                            </tr>

                        </table>

                    </td>

                </tr>

            </table>

        </body>

        </html>
    `;
}

// =====================================================
// RUTA DE PRUEBA
// =====================================================

app.get(
    "/",
    (req, res) => {

        res.json({

            ok: true,

            mensaje:
                "Backend de Linces De Setefilla funcionando correctamente."

        });

    }
);


// =====================================================
// CORREO DE PRUEBA
// =====================================================

app.get(
    "/api/prueba-correo",
    async (req, res) => {

        try {

            const resultado =
                await resend.emails.send({

                    from:
                        "onboarding@resend.dev",

                    to:
                        "lincesdesetefilla@gmail.com",

                    subject:
                        "Prueba de correo - Linces De Setefilla",

                    html: `
                        <h1>
                            Linces De Setefilla
                        </h1>

                        <p>
                            Este es un correo de prueba
                            enviado desde el backend.
                        </p>

                        <p>
                            Resend funciona correctamente.
                        </p>
                    `

                });


            console.log(
                "Correo enviado:",
                resultado
            );


            res.json({

                ok: true,

                mensaje:
                    "Correo enviado correctamente.",

                resultado

            });


        } catch (error) {

            console.error(
                "Error enviando correo:",
                error
            );


            res.status(500).json({

                ok: false,

                mensaje:
                    "No se ha podido enviar el correo.",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// RECIBIR PEDIDO
// =====================================================

app.post(
    "/api/pedido",
    async (req, res) => {

        try {

            const pedido =
                req.body;


            console.log(
                "===================================="
            );

            console.log(
                "NUEVO PEDIDO RECIBIDO"
            );

            console.log(
                "===================================="
            );

            console.log(
                pedido
            );


            // -----------------------------------------
            // COMPROBAR PEDIDO
            // -----------------------------------------

            if (
                !pedido ||
                !pedido.cliente
            ) {

                return res.status(400).json({

                    ok: false,

                    mensaje:
                        "El pedido recibido no es válido."

                });

            }


            // -----------------------------------------
            // COMPROBAR CORREO
            // -----------------------------------------

            const correoCliente =
                String(
                    pedido.cliente.correo || ""
                ).trim();


            if (!correoCliente) {

                return res.status(400).json({

                    ok: false,

                    mensaje:
                        "El pedido no contiene un correo electrónico."

                });

            }


            // -----------------------------------------
            // GUARDAR PEDIDO
            // -----------------------------------------

            const pedidos =
                obtenerPedidos();


            pedidos.push(
                pedido
            );


            guardarPedidos(
                pedidos
            );


            console.log(
                "Pedido guardado correctamente."
            );


            // -----------------------------------------
            // ENVIAR CORREO AL CLIENTE
            // -----------------------------------------

            const resultadoCorreo =
                await resend.emails.send({

                    from:
                        "onboarding@resend.dev",

                    to:
                        correoCliente,

                    subject:
                        `Confirmación de pedido ${pedido.numeroPedido}`,

                    html:
                        crearCorreoPedido(
                            pedido
                        )

                });


            if (
                resultadoCorreo.error
            ) {

                console.error(
                    "Error de Resend:",
                    resultadoCorreo.error
                );


                return res.status(500).json({

                    ok: false,

                    mensaje:
                        "El pedido se ha guardado, pero no se ha podido enviar el correo.",

                    numeroPedido:
                        pedido.numeroPedido || null

                });

            }


            console.log(
                "Correo del pedido enviado correctamente."
            );


            console.log(
                "ID del correo:",
                resultadoCorreo.data?.id
            );


            const resultadoCorreoAdministrador = await resend.emails.send({
                from: "onboarding@resend.dev",
                to: correoAdministrador,
                subject: `Nuevo pedido ${pedido.numeroPedido} - Linces De Setefilla`,
                html: crearCorreoAdministrador(pedido)
            });

            if (resultadoCorreoAdministrador.error) {
                console.error(
                    "Error enviando correo al administrador:",
                    resultadoCorreoAdministrador.error
                );
            }

            // -----------------------------------------
            // ENVIAR PEDIDO A GOOGLE SHEETS
            // -----------------------------------------
            console.log("INICIANDO ENVÍO A GOOGLE SHEETS...");

            const resultadoGoogleSheets =
                await enviarPedidoAGoogleSheets(
                    pedido
                );


            if (
                resultadoGoogleSheets.ok
            ) {

                console.log(
                    "Pedido registrado correctamente en Google Sheets."
                );

            }
            else {

                console.error(
                    "El pedido NO se pudo registrar en Google Sheets:",
                    resultadoGoogleSheets.mensaje
                );

            }



            // -----------------------------------------
            // RESPUESTA
            // -----------------------------------------

            res.json({

                ok: true,

                mensaje:
                    "Pedido recibido, guardado y correo enviado correctamente.",

                numeroPedido:
                    pedido.numeroPedido || null,

                correoEnviado:
                    true

            });


        } catch (error) {

            console.error(
                "Error procesando el pedido:",
                error
            );


            res.status(500).json({

                ok: false,

                mensaje:
                    "Ha ocurrido un error al procesar el pedido.",

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Backend funcionando en http://localhost:${PORT}`
        );

    }
);
