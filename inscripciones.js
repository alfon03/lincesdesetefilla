// =========================================================
// INSCRIPCIONES CAMPUS DE VERANO
// Linces de Setefilla
// =========================================================


// =========================================================
// CONFIGURACIÓN
// =========================================================

// URL de la implementación de Google Apps Script
const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzVTqeHvR8MGZSL_plr825Y0M1j4saaNbZB0H0YdPWCZjirih2awxici7gJ7Q4YOKn2rA/exec";


// ID DEL CAMPUS
const CAMPUS_ID =
    "VERANO";


// Número de WhatsApp que recibirá las inscripciones
const WHATSAPP_NUMBER =
    "34642579419";


// =========================================================
// ELEMENTOS DEL DOM
// =========================================================

const form =
    document.getElementById(
        "summerRegistrationForm"
    );

const registrationSection =
    document.getElementById(
        "registrationSection"
    );

const submitButton =
    document.getElementById(
        "submitButton"
    );

const formAlert =
    document.getElementById(
        "formAlert"
    );

const successPanel =
    document.getElementById(
        "successPanel"
    );

const openWhatsappAgain =
    document.getElementById(
        "openWhatsappAgain"
    );

const currentYear =
    document.getElementById(
        "currentYear"
    );

const campusStatus =
    document.getElementById(
        "campusStatus"
    );


// =========================================================
// AÑO DEL FOOTER
// =========================================================

if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


// =========================================================
// VARIABLE PARA GUARDAR WHATSAPP
// =========================================================

let whatsappUrl = "";


// =========================================================
// MOSTRAR ALERTA
// =========================================================

function showAlert(
    message,
    type = "danger"
) {

    if (!formAlert) {
        return;
    }

    formAlert.className =
        `alert alert-${type}`;

    formAlert.innerHTML =
        message;

    formAlert.classList.remove(
        "d-none"
    );

}


// =========================================================
// OCULTAR ALERTA
// =========================================================

function hideAlert() {

    if (!formAlert) {
        return;
    }

    formAlert.classList.add(
        "d-none"
    );

    formAlert.textContent =
        "";

}


// =========================================================
// ESTADO DEL BOTÓN
// =========================================================

function setLoading(
    isLoading
) {

    if (!submitButton) {
        return;
    }

    submitButton.disabled =
        isLoading;


    const buttonText =
        submitButton.querySelector(
            ".button-text"
        );

    const buttonLoading =
        submitButton.querySelector(
            ".button-loading"
        );


    if (buttonText) {

        buttonText.classList.toggle(
            "d-none",
            isLoading
        );

    }


    if (buttonLoading) {

        buttonLoading.classList.toggle(
            "d-none",
            !isLoading
        );

    }

}


// =========================================================
// CALCULAR EDAD REAL A PARTIR DE LA FECHA
// =========================================================

function calcularEdad(fechaNacimiento) {

    if (!fechaNacimiento) {
        return null;
    }

    const fecha =
        new Date(
            fechaNacimiento + "T00:00:00"
        );

    if (
        isNaN(fecha.getTime())
    ) {
        return null;
    }

    const hoy =
        new Date();

    let edad =
        hoy.getFullYear() -
        fecha.getFullYear();

    const mesActual =
        hoy.getMonth();

    const mesNacimiento =
        fecha.getMonth();

    const diaActual =
        hoy.getDate();

    const diaNacimiento =
        fecha.getDate();

    // Todavía no ha cumplido años este año
    if (
        mesActual < mesNacimiento ||
        (
            mesActual === mesNacimiento &&
            diaActual < diaNacimiento
        )
    ) {
        edad--;
    }

    return edad;
}

// =========================================================
// FORMATEAR FECHA PARA MOSTRARLA
// =========================================================

function formatearFechaNacimiento(
    fechaNacimiento
) {

    if (!fechaNacimiento) {
        return "";
    }


    const partes =
        String(
            fechaNacimiento
        ).split("-");


    if (
        partes.length !== 3
    ) {
        return fechaNacimiento;
    }


    return (
        `${partes[2]}/${partes[1]}/${partes[0]}`
    );

}


// =========================================================
// COMPROBAR ESTADO DEL CAMPUS
// =========================================================

async function comprobarEstadoCampus() {

    if (campusStatus) {

        campusStatus.className =
            "campus-status-message campus-status-loading";

        campusStatus.innerHTML = `
            <div class="campus-status-icon">
                <i class="bi bi-hourglass-split"></i>
            </div>

            <div class="campus-status-content">
                <strong>Comprobando inscripciones...</strong>
                <span>
                    Un momento, estamos comprobando el estado del Campus.
                </span>
            </div>
        `;
    }


    if (registrationSection) {

        registrationSection.classList.add(
            "d-none"
        );

    }


    try {

        const respuesta =
            await fetch(
                APPS_SCRIPT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body: JSON.stringify({

                        accion:
                            "obtenerEstadoCampus",

                        campusId:
                            CAMPUS_ID

                    })
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

        } catch (error) {

            console.error(
                "La respuesta NO es JSON válido:",
                error
            );

            throw new Error(
                "La respuesta de Apps Script no es un JSON válido."
            );

        }


        if (!resultado.ok) {

            throw new Error(
                resultado.mensaje ||
                resultado.error ||
                "No se ha podido comprobar el campus."
            );

        }


        // -------------------------------------------------
        // CAMPUS NO ACTIVO ESTA TEMPORADA
        // -------------------------------------------------

        if (
            !resultado.encontrado &&
            resultado.abierto === false
        ) {

            if (campusStatus) {

                campusStatus.className =
                    "campus-status-message campus-status-closed";

                campusStatus.innerHTML = `

            <div class="campus-status-icon">

                <i class="bi bi-calendar-event"></i>

            </div>

            <div class="campus-status-content">

                <strong>
                    Campus de Verano no disponible
                </strong>

                <span>
                    El Campus de Verano no está activo
                    durante esta temporada.
                </span>

            </div>

        `;

            }

            if (registrationSection) {

                registrationSection.classList.add(
                    "d-none"
                );

            }

            return;
        }

        // -------------------------------------------------
        // CAMPUS CERRADO / PRÓXIMAMENTE
        // -------------------------------------------------

        if (!resultado.abierto) {

            if (campusStatus) {

                campusStatus.className =
                    "campus-status-message campus-status-closed";

                campusStatus.innerHTML = `
                    <div class="campus-status-icon">
                        <i class="bi bi-calendar-x"></i>
                    </div>

                    <div class="campus-status-content">

                        <strong>
                            ${resultado.estado === "proximamente"
                        ? "Inscripciones próximamente"
                        : "Inscripciones cerradas"
                    }
                        </strong>

                        <span>
                            ${resultado.mensaje ||
                    "Las inscripciones no están disponibles en este momento."
                    }
                        </span>

                    </div>
                `;

            }


            if (registrationSection) {

                registrationSection.classList.add(
                    "d-none"
                );

            }


            return;

        }


        // -------------------------------------------------
        // CAMPUS COMPLETO
        // -------------------------------------------------

        if (resultado.sinPlazas) {

            whatsappUrl =
                resultado.whatsappUrl ||
                `https://wa.me/${WHATSAPP_NUMBER}`;


            if (campusStatus) {

                campusStatus.className =
                    "campus-status-message campus-status-closed";

                campusStatus.innerHTML = `
                    <div class="campus-status-icon">
                        <i class="bi bi-exclamation-circle"></i>
                    </div>

                    <div class="campus-status-content">

                        <strong>
                            Campus completo
                        </strong>

                        <span>
                            ${resultado.mensajeAforo ||
                    "No quedan plazas disponibles."
                    }
                        </span>

                        <a
                            href="${whatsappUrl}"
                            target="_blank"
                            rel="noopener"
                            class="btn btn-success mt-3"
                        >
                            <i class="bi bi-whatsapp me-2"></i>
                            Solicitar excepción por WhatsApp
                        </a>

                    </div>
                `;

            }


            if (registrationSection) {

                registrationSection.classList.add(
                    "d-none"
                );

            }


            return;

        }


        // -------------------------------------------------
        // CAMPUS ABIERTO
        // -------------------------------------------------

        if (campusStatus) {

            campusStatus.className =
                "campus-status-message campus-status-open";

            campusStatus.innerHTML = `
                <div class="campus-status-icon">
                    <i class="bi bi-check-circle"></i>
                </div>

                <div class="campus-status-content">

                    <strong>
                        ¡Inscripciones abiertas!
                    </strong>

                    <span>
                        ${resultado.mensajeAforo ||
                "Ya puedes realizar la inscripción."
                }
                    </span>

                </div>
            `;

        }


        if (registrationSection) {

            registrationSection.classList.remove(
                "d-none"
            );

        }


    } catch (error) {

        console.error(
            "ERROR COMPROBANDO CAMPUS:",
            error
        );


        if (campusStatus) {

            campusStatus.className =
                "campus-status-message campus-status-closed";

            campusStatus.innerHTML = `
                <div class="campus-status-icon">
                    <i class="bi bi-exclamation-triangle"></i>
                </div>

                <div class="campus-status-content">

                    <strong>
                        No se ha podido comprobar el campus
                    </strong>

                    <span>
                        ${error.message ||
                "Se ha producido un error al consultar el estado del Campus."
                }
                    </span>

                </div>
            `;

        }


        if (registrationSection) {

            registrationSection.classList.add(
                "d-none"
            );

        }

    }

}


// =========================================================
// OBTENER DATOS DEL FORMULARIO
// =========================================================

function getFormData() {

    const formData =
        new FormData(
            form
        );


    const fechaNacimiento =
        String(
            formData.get("fechaNacimiento") || ""
        ).trim();

    const edad =
        calcularEdad(fechaNacimiento);

    return {

        nombre:
            String(
                formData.get(
                    "nombre"
                ) || ""
            ).trim(),

        primerApellido:
            String(
                formData.get(
                    "primerApellido"
                ) || ""
            ).trim(),

        segundoApellido:
            String(
                formData.get(
                    "segundoApellido"
                ) || ""
            ).trim(),

        edad:
            edad,

        fechaNacimiento: fechaNacimiento,
        email:
            String(
                formData.get(
                    "email"
                ) || ""
            ).trim(),

        telefono:
            String(
                formData.get(
                    "telefono"
                ) || ""
            ).trim(),

        informacion:
            String(
                formData.get(
                    "informacion"
                ) || ""
            ).trim(),

        consentimiento:
            document.getElementById(
                "consentimiento"
            ).checked,

        consentimientoImagenes:
            document.getElementById(
                "consentimientoImagenes"
            ).checked,

        fecha:
            new Date().toISOString()

    };

}


// =========================================================
// VALIDACIÓN DEL FORMULARIO
// =========================================================

function validateForm() {

    form.classList.add(
        "was-validated"
    );


    // -----------------------------------------------------
    // VALIDACIÓN HTML
    // -----------------------------------------------------

    if (!form.checkValidity()) {

        showAlert(
            "Revisa los campos marcados antes de continuar.",
            "warning"
        );

        return false;

    }

    // -----------------------------------------------------
    // VALIDACIÓN DEL CORREO ELECTRÓNICO
    // -----------------------------------------------------

    const emailElement =
        document.getElementById(
            "email"
        );

    if (!emailElement) {

        showAlert(
            "No se ha encontrado el campo de correo electrónico.",
            "danger"
        );

        return false;

    }

    const email =
        emailElement.value.trim();

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {

        showAlert(
            "Introduce una dirección de correo electrónico válida.",
            "warning"
        );

        emailElement.focus();

        return false;

    }

    // -----------------------------------------------------
    // DETECTAR ERRORES HABITUALES EN DOMINIOS
    // -----------------------------------------------------

    const dominiosIncorrectos = {

        "gmai.com": "gmail.com",
        "gmial.com": "gmail.com",
        "gmail.con": "gmail.com",
        "gmail.co": "gmail.com",
        "hotmial.com": "hotmail.com",
        "hotmai.com": "hotmail.com",
        "outlok.com": "outlook.com",
        "outloo.com": "outlook.com",
        "yaho.com": "yahoo.com"

    };

    const partesEmail =
        email.toLowerCase().split("@");

    const dominioEmail =
        partesEmail.length === 2
            ? partesEmail[1]
            : "";

    if (
        dominiosIncorrectos[dominioEmail]
    ) {

        showAlert(
            `Parece que hay un error en el dominio del correo. ¿Quizás quisiste escribir <strong>${dominiosIncorrectos[dominioEmail]}</strong>?`,
            "warning"
        );

        emailElement.focus();

        return false;

    }


    // -----------------------------------------------------
    // FECHA DE NACIMIENTO
    // -----------------------------------------------------

    const fechaNacimientoElement =
        document.getElementById(
            "fechaNacimiento"
        );


    if (!fechaNacimientoElement) {

        showAlert(
            "No se ha encontrado el campo de fecha de nacimiento.",
            "danger"
        );

        return false;

    }


    const fechaNacimiento =
        fechaNacimientoElement.value.trim();


    if (!fechaNacimiento) {

        showAlert(
            "Introduce la fecha de nacimiento.",
            "warning"
        );

        fechaNacimientoElement.focus();

        return false;

    }


    // -----------------------------------------------------
    // CALCULAR EDAD
    // -----------------------------------------------------

    const edad =
        calcularEdad(
            fechaNacimiento
        );


    if (edad === null) {

        showAlert(
            "La fecha de nacimiento no es válida.",
            "warning"
        );

        fechaNacimientoElement.focus();

        return false;

    }


    // -----------------------------------------------------
    // COMPROBAR EDAD
    // -----------------------------------------------------

    if (
        edad < 7 ||
        edad > 20
    ) {

        showAlert(
            `La edad debe estar comprendida entre 7 y 20 años. La edad calculada es ${edad} años.`,
            "warning"
        );

        fechaNacimientoElement.focus();

        return false;

    }

    // -----------------------------------------------------
    // CONSENTIMIENTO
    // -----------------------------------------------------

    const consentimiento =
        document.getElementById(
            "consentimiento"
        );


    if (
        !consentimiento ||
        !consentimiento.checked
    ) {

        showAlert(
            "Debes aceptar el consentimiento de privacidad para continuar.",
            "warning"
        );

        return false;

    }


    // -----------------------------------------------------
    // TODO CORRECTO
    // -----------------------------------------------------

    return true;

}


// =========================================================
// CREAR MENSAJE DE WHATSAPP
// =========================================================

function buildWhatsappUrl(data) {

    const message = [

        "*LINC​ES DE SETEFILLA*",
        "*NUEVA INSCRIPCIÓN — CAMPUS DE VERANO*",

        "━━━━━━━━━━━━━━━━━━━━",

        "*DATOS DEL PARTICIPANTE*",

        `• *Nombre:* ${data.nombre} ${data.primerApellido} ${data.segundoApellido}`,
        `• *Edad:* ${data.edad} años`,
        `• *Fecha de nacimiento:* ${formatearFechaNacimiento(data.fechaNacimiento)}`,

        "",

        "*DATOS DE CONTACTO*",

        `• *Correo:* ${data.email}`,
        `• *Teléfono:* ${data.telefono}`,

        "",

        "*INFORMACIÓN ADICIONAL*",

        data.informacion ||
        "No se ha indicado información adicional.",

        "",

        "*SOLICITUD*",

        `• *Fecha:* ${new Date(
            data.fecha
        ).toLocaleString("es-ES")}`,

        "━━━━━━━━━━━━━━━━━━━━",

        "*Solicitud de inscripción recibida.*"

    ].join("\n");

    return (
        `https://wa.me/${WHATSAPP_NUMBER}` +
        `?text=${encodeURIComponent(message)}`
    );
}

// =========================================================
// COMPROBAR CONFIGURACIÓN
// =========================================================

function checkConfiguration() {

    if (
        APPS_SCRIPT_URL.startsWith(
            "PEGA_AQUI"
        )
    ) {

        showAlert(
            "Todavía no está configurada la URL de Google Apps Script.",
            "danger"
        );

        return false;

    }


    if (
        WHATSAPP_NUMBER.startsWith(
            "PEGA_AQUI"
        )
    ) {

        showAlert(
            "Todavía no está configurado el número de WhatsApp.",
            "danger"
        );

        return false;

    }


    return true;

}


// =========================================================
// ENVIAR FORMULARIO
// =========================================================

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            hideAlert();


            if (!validateForm()) {
                return;
            }


            if (!checkConfiguration()) {
                return;
            }


            const data =
                getFormData();


            // -------------------------------------------------
            // Seguridad adicional en el cliente
            // -------------------------------------------------

            if (
                data.edad === null ||
                data.edad < 7 ||
                data.edad > 20
            ) {

                showAlert(
                    "La fecha de nacimiento no corresponde a una edad válida.",
                    "warning"
                );

                return;

            }


            whatsappUrl =
                buildWhatsappUrl(
                    data
                );


            setLoading(true);


            try {

                const respuesta =
                    await fetch(
                        APPS_SCRIPT_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "text/plain;charset=utf-8"
                            },

                            body:
                                JSON.stringify({

                                    campusId:
                                        CAMPUS_ID,

                                    nombre:
                                        data.nombre,

                                    primerApellido:
                                        data.primerApellido,

                                    segundoApellido:
                                        data.segundoApellido,

                                    // -------------------------------------------------
                                    // IMPORTANTE:
                                    // No enviamos la edad.
                                    // El servidor debe calcularla de nuevo.
                                    // -------------------------------------------------

                                    fechaNacimiento:
                                        data.fechaNacimiento,

                                    email:
                                        data.email,

                                    telefono:
                                        data.telefono,

                                    informacion:
                                        data.informacion,

                                    consentimiento:
                                        data.consentimiento,
                                    consentimientoImagenes: data.consentimientoImagenes

                                })

                        }
                    );


                const resultado =
                    await respuesta.json();


                // -----------------------------------------
                // SERVIDOR HA RECHAZADO
                // -----------------------------------------

                if (!resultado.ok) {


                    // -------------------------------------
                    // INSCRIPCIÓN DUPLICADA
                    // -------------------------------------

                    if (
                        resultado.duplicado
                    ) {

                        showAlert(
                            `
                            <strong>
                                Esta persona ya está inscrita.
                            </strong>

                            <br>

                            Ya existe una inscripción para este participante
                            en el Campus de Verano.

                            <br><br>

                            Si crees que se trata de un error,
                            comprueba los datos introducidos.
                            `,
                            "warning"
                        );


                        if (registrationSection) {

                            registrationSection.classList.remove(
                                "is-hidden"
                            );

                        }


                        return;

                    }


                    // -------------------------------------
                    // CAMPUS COMPLETO
                    // -------------------------------------

                    if (
                        resultado.sinPlazas
                    ) {

                        const urlWhatsApp =
                            resultado.whatsappUrl ||
                            `https://wa.me/${WHATSAPP_NUMBER}`;


                        showAlert(
                            `
                            <strong>
                                Campus completo.
                            </strong>

                            <br>

                            No quedan plazas disponibles.

                            <br><br>

                            <a
                                href="${urlWhatsApp}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="btn btn-yellow"
                            >
                                <i class="bi bi-whatsapp me-2"></i>
                                Solicitar una excepción por WhatsApp
                            </a>
                            `,
                            "warning"
                        );


                        if (registrationSection) {

                            registrationSection.classList.add(
                                "is-hidden"
                            );

                        }


                        return;

                    }


                    throw new Error(
                        resultado.mensaje ||
                        resultado.error ||
                        "No se ha podido guardar la inscripción."
                    );

                }


                // -----------------------------------------
                // INSCRIPCIÓN CORRECTAMENTE GUARDADA
                // -----------------------------------------


                // Ocultar formulario
                if (registrationSection) {

                    registrationSection.classList.add(
                        "d-none"
                    );

                    registrationSection.classList.add(
                        "is-hidden"
                    );

                }


                // Mostrar panel de éxito
                if (successPanel) {

                    successPanel.innerHTML = `

                        <div class="success-panel-content">

                            <div class="success-panel-icon">
                                <i class="bi bi-check-circle-fill"></i>
                            </div>

                            <h3>
                                ¡Muchas gracias, ${data.nombre}! 🎉
                            </h3>

                            <p>
                                Te has inscrito correctamente en el
                                <strong>Campus de Verano</strong>.
                            </p>

                            <p>
                                Tu inscripción ha quedado registrada
                                correctamente.
                            </p>

                            <p>
                                <strong>
                                    Un administrador se pondrá en contacto
                                    contigo próximamente.
                                </strong>
                            </p>

                            ${resultado.correoEnviado
                            ? `
                                        <p>
                                            📧 Hemos enviado un correo de
                                            confirmación a
                                            <strong>${data.email}</strong>.
                                        </p>
                                      `
                            : `
                                        <p class="text-warning">
                                            ⚠️ La inscripción se ha realizado
                                            correctamente, pero no hemos podido
                                            enviar el correo de confirmación.
                                        </p>
                                      `
                        }

                            <p>
                                <strong>
                                    Número de inscripción:
                                    ${resultado.idInscripcion || ""}
                                </strong>
                            </p>

                        </div>

                    `;


                    // QUITAR CUALQUIER CLASE QUE LO OCULTE
                    successPanel.classList.remove(
                        "d-none"
                    );

                    successPanel.classList.remove(
                        "is-hidden"
                    );


                    // FORZAR VISIBILIDAD
                    successPanel.style.display =
                        "block";

                    successPanel.style.visibility =
                        "visible";

                    successPanel.style.opacity =
                        "1";

                }


                // -----------------------------------------
                // ACTUALIZAR AFORO
                // -----------------------------------------

                if (
                    campusStatus &&
                    resultado.mensajeAforo
                ) {

                    campusStatus.className =
                        "campus-status-message campus-status-open";


                    campusStatus.innerHTML = `
                        <div class="campus-status-icon">
                            <i class="bi bi-check-circle"></i>
                        </div>

                        <div class="campus-status-content">

                            <strong>
                                Inscripción realizada
                            </strong>

                            <span>
                                ${resultado.mensajeAforo}
                            </span>

                        </div>
                    `;

                }


                // -----------------------------------------
                // ABRIR WHATSAPP
                // -----------------------------------------

                if (whatsappUrl) {

                    window.open(
                        whatsappUrl,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }


            } catch (error) {

                console.error(
                    "Error enviando inscripción:",
                    error
                );


                showAlert(
                    error.message ||
                    "No se ha podido completar la inscripción. Inténtalo de nuevo.",
                    "danger"
                );


            } finally {

                setLoading(
                    false
                );

            }

        }
    );

}


// =========================================================
// BOTÓN PARA VOLVER A ABRIR WHATSAPP
// =========================================================

if (openWhatsappAgain) {

    openWhatsappAgain.addEventListener(
        "click",
        function () {

            if (!whatsappUrl) {
                return;
            }


            window.open(
                whatsappUrl,
                "_blank",
                "noopener,noreferrer"
            );

        }
    );

}


// =========================================================
// COMPROBAR CAMPUS AL CARGAR LA PÁGINA
// =========================================================

comprobarEstadoCampus();
