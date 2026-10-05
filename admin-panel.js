const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzBJTJgu7Q4t6jxkNC6CeW7srq6VNKACPuUDd7su1skHdeRbp22z6TmD0ncN7tzt7ospw/exec";


const adminToken =
    sessionStorage.getItem("adminToken");

const adminUsuario =
    sessionStorage.getItem("adminUsuario");


const adminUsuarioElement =
    document.getElementById("adminUsuario");

const logoutButton =
    document.getElementById("logoutButton");

const alertBox =
    document.getElementById("adminAlert");

const campusLoading =
    document.getElementById("campusLoading");

const campusList =
    document.getElementById("campusList");

const campusEmpty =
    document.getElementById("campusEmpty");


function mostrarAlerta(
    mensaje,
    tipo = "danger"
) {

    if (!alertBox) return;

    alertBox.className =
        `admin-alert admin-alert-${tipo}`;

    alertBox.textContent =
        mensaje;

    alertBox.classList.remove(
        "d-none"
    );

}


async function comprobarSesion() {

    if (!adminToken) {

        window.location.href =
            "admin.html";

        return false;

    }


    try {

        const respuesta =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method: "POST",

                    redirect: "follow",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body: JSON.stringify({
                        accion:
                            "comprobarSesionAdmin",

                        token:
                            adminToken
                    })
                }
            );


        const texto =
            await respuesta.text();


        if (!texto) {

            throw new Error(
                "El servidor no ha devuelto ninguna respuesta."
            );

        }


        const resultado =
            JSON.parse(texto);


        if (!resultado.ok) {

            sessionStorage.removeItem(
                "adminToken"
            );

            sessionStorage.removeItem(
                "adminUsuario"
            );

            window.location.href =
                "admin.html";

            return false;

        }


        if (adminUsuarioElement) {

            adminUsuarioElement.textContent =
                resultado.usuario ||
                adminUsuario ||
                "Administrador";

        }


        return true;

    } catch (error) {

        console.error(
            "Error al comprobar la sesión:",
            error
        );

        mostrarAlerta(
            "No se ha podido comprobar la sesión."
        );

        return false;

    }

}


async function cargarCampus() {

    if (!campusLoading || !campusList) {
        return;
    }


    campusLoading.classList.remove(
        "d-none"
    );

    campusList.innerHTML = "";

    if (campusEmpty) {

        campusEmpty.classList.add(
            "d-none"
        );

    }


    try {

        const respuesta =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method: "POST",

                    redirect: "follow",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body: JSON.stringify({
                        accion:
                            "obtenerCampusAdmin",

                        token:
                            adminToken
                    })
                }
            );


        const texto =
            await respuesta.text();


        if (!texto) {

            throw new Error(
                "El servidor no ha devuelto ninguna respuesta."
            );

        }


        const resultado =
            JSON.parse(texto);


        if (!resultado.ok) {

            throw new Error(
                resultado.error ||
                "No se han podido obtener los campus."
            );

        }


        const campus =
            resultado.campus || [];


        campusLoading.classList.add(
            "d-none"
        );


        if (campus.length === 0) {

            if (campusEmpty) {

                campusEmpty.classList.remove(
                    "d-none"
                );

            }

            return;

        }


        campus.forEach(
            mostrarCampus
        );


    } catch (error) {

        console.error(
            "Error al cargar los campus:",
            error
        );

        campusLoading.classList.add(
            "d-none"
        );

        mostrarAlerta(
            "No se han podido cargar los campus."
        );

    }

}


function obtenerEstadoCampus(
    campus
) {

    if (!campus.activo) {

        return {
            texto: "Inactivo",
            clase: "campus-status-inactive"
        };

    }


    const ahora =
        new Date();


    const apertura =
        campus.fechaApertura
            ? new Date(
                campus.fechaApertura
            )
            : null;


    const cierre =
        campus.fechaCierre
            ? new Date(
                campus.fechaCierre
            )
            : null;


    if (
        apertura &&
        ahora < apertura
    ) {

        return {
            texto: "Inscripciones no abiertas",
            clase: "campus-status-pending"
        };

    }


    if (
        cierre &&
        ahora > cierre
    ) {

        return {
            texto: "Inscripciones cerradas",
            clase: "campus-status-closed"
        };

    }


    return {
        texto: "Inscripciones abiertas",
        clase: "campus-status-active"
    };

}


function mostrarCampus(
    campus
) {

    const tarjeta =
        document.createElement(
            "article"
        );

    tarjeta.className =
        "campus-card";


    const estadoCampus =
        obtenerEstadoCampus(
            campus
        );


    const fechaApertura =
        convertirFechaInput(
            campus.fechaApertura
        );


    const fechaCierre =
        convertirFechaInput(
            campus.fechaCierre
        );


    tarjeta.innerHTML = `

        <div class="campus-card-header">

            <div>

                <h3>
                    ${escaparHTML(campus.nombre)}
                </h3>

                <div class="campus-id">
                    ID:
                    ${escaparHTML(campus.id)}
                </div>

            </div>

            <span
                class="campus-status ${estadoCampus.clase}"
            >
                ${estadoCampus.texto}
            </span>

        </div>


        <div class="campus-dates">

            <div class="campus-date">

                <span class="campus-date-label">
                    Fecha de apertura
                </span>

                <span class="campus-date-value">
                    ${formatearFecha(campus.fechaApertura)}
                </span>

            </div>


            <div class="campus-date">

                <span class="campus-date-label">
                    Fecha de cierre
                </span>

                <span class="campus-date-value">
                    ${formatearFecha(campus.fechaCierre)}
                </span>

            </div>

        </div>


        <div class="campus-actions">

            <button
                type="button"
                class="campus-edit-button"
            >
                Editar fechas
            </button>

        </div>


        <div class="campus-edit-form d-none">

            <div class="campus-edit-fields">

                <div class="form-group">

                    <label>
                        Fecha de apertura
                    </label>

                    <input
                        type="date"
                        class="campus-opening-input"
                        value="${fechaApertura}"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Fecha de cierre
                    </label>

                    <input
                        type="date"
                        class="campus-closing-input"
                        value="${fechaCierre}"
                    >

                </div>

            </div>


            <div class="campus-active-row">

                <label>

                    <input
                        type="checkbox"
                        class="campus-active-input"
                        ${campus.activo ? "checked" : ""}
                    >

                    Campus activo

                </label>

            </div>


            <div class="campus-edit-actions">

                <button
                    type="button"
                    class="campus-save-button"
                >
                    Guardar cambios
                </button>

                <button
                    type="button"
                    class="campus-cancel-button"
                >
                    Cancelar
                </button>

            </div>

        </div>

    `;


    const editButton =
        tarjeta.querySelector(
            ".campus-edit-button"
        );


    const editForm =
        tarjeta.querySelector(
            ".campus-edit-form"
        );


    const cancelButton =
        tarjeta.querySelector(
            ".campus-cancel-button"
        );


    const saveButton =
        tarjeta.querySelector(
            ".campus-save-button"
        );


    editButton.addEventListener(
        "click",
        function () {

            editForm.classList.remove(
                "d-none"
            );

            editButton.classList.add(
                "d-none"
            );

        }
    );


    cancelButton.addEventListener(
        "click",
        function () {

            cargarCampus();

        }
    );


    saveButton.addEventListener(
        "click",
        async function () {

            await guardarCampus(
                campus,
                tarjeta
            );

        }
    );


    campusList.appendChild(
        tarjeta
    );

}


async function guardarCampus(
    campus,
    tarjeta
) {

    const fechaApertura =
        tarjeta.querySelector(
            ".campus-opening-input"
        ).value;


    const fechaCierre =
        tarjeta.querySelector(
            ".campus-closing-input"
        ).value;


    const activo =
        tarjeta.querySelector(
            ".campus-active-input"
        ).checked;


    if (
        !fechaApertura ||
        !fechaCierre
    ) {

        mostrarAlerta(
            "Debes indicar las fechas de apertura y cierre."
        );

        return;

    }


    if (
        fechaCierre < fechaApertura
    ) {

        mostrarAlerta(
            "La fecha de cierre no puede ser anterior a la fecha de apertura."
        );

        return;

    }


    const saveButton =
        tarjeta.querySelector(
            ".campus-save-button"
        );


    saveButton.disabled =
        true;

    saveButton.textContent =
        "Guardando...";


    try {

        const respuesta =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method: "POST",

                    redirect: "follow",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body: JSON.stringify({

                        accion:
                            "actualizarCampusAdmin",

                        token:
                            adminToken,

                        campusId:
                            campus.id,

                        fechaApertura:
                            fechaApertura,

                        fechaCierre:
                            fechaCierre,

                        activo:
                            activo

                    })

                }
            );


        const texto =
            await respuesta.text();


        if (!texto) {

            throw new Error(
                "El servidor no ha devuelto ninguna respuesta."
            );

        }


        const resultado =
            JSON.parse(texto);


        if (!resultado.ok) {

            throw new Error(
                resultado.error ||
                "No se ha podido actualizar el campus."
            );

        }


        mostrarAlerta(
            "Campus actualizado correctamente.",
            "success"
        );


        await cargarCampus();


    } catch (error) {

        console.error(
            "Error al actualizar el campus:",
            error
        );


        mostrarAlerta(
            error.message ||
            "No se ha podido actualizar el campus."
        );


        saveButton.disabled =
            false;

        saveButton.textContent =
            "Guardar cambios";

    }

}


function formatearFecha(
    fecha
) {

    if (!fecha) {
        return "—";
    }


    const fechaObjeto =
        new Date(fecha);


    if (
        Number.isNaN(
            fechaObjeto.getTime()
        )
    ) {

        return "—";

    }


    return new Intl.DateTimeFormat(
        "es-ES",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    ).format(
        fechaObjeto
    );

}


function convertirFechaInput(
    fecha
) {

    if (!fecha) {
        return "";
    }


    const fechaObjeto =
        new Date(fecha);


    if (
        Number.isNaN(
            fechaObjeto.getTime()
        )
    ) {

        return "";
    }


    const año =
        fechaObjeto.getFullYear();


    const mes =
        String(
            fechaObjeto.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const dia =
        String(
            fechaObjeto.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${año}-${mes}-${dia}`;

}


function escaparHTML(
    valor
) {

    return String(
        valor ?? ""
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


async function cerrarSesion() {

    if (!adminToken) {

        window.location.href =
            "admin.html";

        return;

    }


    try {

        await fetch(
            APPS_SCRIPT_URL,
            {
                method: "POST",

                redirect: "follow",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({
                    accion:
                        "cerrarSesionAdmin",

                    token:
                        adminToken
                })
            }
        );

    } catch (error) {

        console.error(
            "Error al cerrar sesión:",
            error
        );

    } finally {

        sessionStorage.removeItem(
            "adminToken"
        );

        sessionStorage.removeItem(
            "adminUsuario"
        );

        window.location.href =
            "admin.html";

    }

}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        cerrarSesion
    );

}


async function iniciarPanel() {

    const sesionValida =
        await comprobarSesion();


    if (!sesionValida) {
        return;
    }


    await cargarCampus();

}


iniciarPanel();
