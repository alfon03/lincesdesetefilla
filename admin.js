
const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyQb33i9XNBSKDOCq3EEAaJK9OIY0NvkonEX5Z5FkJPqUrn0PR1V58r9ZDjHT03pa6sZw/exec";

const form = document.getElementById("adminLoginForm");
const usuarioInput = document.getElementById("adminUsuario");
const passwordInput = document.getElementById("adminPassword");
const button = document.getElementById("adminLoginButton");
const buttonText = document.getElementById("buttonText");
const buttonLoading = document.getElementById("buttonLoading");
const alertBox = document.getElementById("adminAlert");


function mostrarAlerta(mensaje, tipo = "danger") {
    if (!alertBox) return;

    alertBox.className = `admin-alert admin-alert-${tipo}`;
    alertBox.textContent = mensaje;
    alertBox.classList.remove("d-none");
}


function ocultarAlerta() {
    if (!alertBox) return;

    alertBox.classList.add("d-none");
    alertBox.textContent = "";
}


function cambiarEstadoBoton(cargando) {
    if (!button) return;

    button.disabled = cargando;

    if (buttonText) {
        buttonText.classList.toggle("d-none", cargando);
    }

    if (buttonLoading) {
        buttonLoading.classList.toggle("d-none", !cargando);
    }
}


async function iniciarSesion(usuario, password) {

    const respuesta = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
            accion: "loginAdmin",
            usuario: usuario,
            password: password
        })
    });

    console.log("Estado HTTP:", respuesta.status);
    console.log("URL final:", respuesta.url);
    console.log("Tipo de respuesta:", respuesta.type);

    const texto = await respuesta.text();

    console.log("Respuesta recibida:", texto);

    if (!respuesta.ok) {
        throw new Error(`Error HTTP ${respuesta.status}`);
    }

    if (!texto) {
        throw new Error("El servidor no ha devuelto ninguna respuesta.");
    }

    try {
        return JSON.parse(texto);
    } catch (error) {
        console.error("La respuesta no es JSON válido:", texto);
        throw new Error("El servidor ha devuelto una respuesta no válida.");
    }
}




if (form) {
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        ocultarAlerta();

        const usuario = usuarioInput.value.trim();
        const password = passwordInput.value;

        if (!usuario || !password) {
            mostrarAlerta("Introduce el usuario y la contraseña.");
            return;
        }

        cambiarEstadoBoton(true);

        try {
            const resultado = await iniciarSesion(usuario, password);

            if (!resultado || !resultado.ok) {
                mostrarAlerta(
                    resultado?.mensaje || "Usuario o contraseña incorrectos."
                );
                return;
            }

            if (!resultado.token) {
                throw new Error("El servidor no ha devuelto un token de sesión.");
            }

            sessionStorage.setItem("adminToken", resultado.token);
            sessionStorage.setItem("adminUsuario", usuario);

            mostrarAlerta(
                resultado.mensaje || "Acceso correcto.",
                "success"
            );

            // Esperamos un momento para que el usuario
            // pueda ver el mensaje de acceso correcto.
            setTimeout(function () {

                window.location.href = "admin-panel.html";

            }, 500);



        } catch (error) {
            console.error("Error al iniciar sesión:", error);

            mostrarAlerta(
                "No se ha podido conectar con el servidor. Inténtalo de nuevo."
            );
        } finally {
            cambiarEstadoBoton(false);
        }
    });
}

