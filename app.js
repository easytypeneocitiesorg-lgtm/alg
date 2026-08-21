const overlay =
    document.getElementById("passwordOverlay");

const passwordInput =
    document.getElementById("passwordInput");

const passwordButton =
    document.getElementById("passwordButton");

const passwordError =
    document.getElementById("passwordError");


let unlocked = false;


// ============================================================
// K = PASSWORD
// ============================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key.toLowerCase() !== "k"
        ) {
            return;
        }

        if (unlocked) {
            return;
        }

        overlay.classList.remove(
            "hidden"
        );

        passwordInput.value = "";

        passwordError.textContent = "";

        passwordInput.focus();
    }
);


// ============================================================
// PASSWORD
// ============================================================

passwordButton.addEventListener(
    "click",
    checkPassword
);


passwordInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {
            checkPassword();
        }

        if (event.key === "Escape") {
            overlay.classList.add(
                "hidden"
            );
        }
    }
);


async function checkPassword() {

    if (
        passwordInput.value !==
        "Cinnamon279"
    ) {

        passwordError.textContent =
            "Incorrect password.";

        passwordInput.value = "";

        passwordInput.focus();

        return;
    }


    unlocked = true;

    overlay.classList.add(
        "hidden"
    );


    await openAlg();
}


// ============================================================
// OPEN ALG.YAML
// ============================================================

async function openAlg() {

    try {

        const response =
            await fetch("alg.yaml");


        if (!response.ok) {

            throw new Error(
                "Could not load alg.yaml."
            );
        }


        const html =
            await response.text();


        const tab =
            window.open(
                "about:blank",
                "_blank"
            );


        if (!tab) {

            alert(
                "Popup blocked."
            );

            return;
        }


        tab.document.open();

        tab.document.write(html);

        tab.document.close();


    } catch (error) {

        console.error(error);

        alert(
            error.message
        );
    }
}
