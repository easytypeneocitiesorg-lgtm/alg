const overlay = document.getElementById("passwordOverlay");
const passwordInput = document.getElementById("passwordInput");
const passwordButton = document.getElementById("passwordButton");
const passwordError = document.getElementById("passwordError");

let unlocked = false;


// Press K anywhere on the page
document.addEventListener("keydown", (event) => {

    if (event.key.toLowerCase() !== "k") {
        return;
    }

    if (unlocked) {
        return;
    }

    overlay.classList.remove("hidden");

    passwordInput.value = "";
    passwordError.textContent = "";

    passwordInput.focus();
});


// Enter button
passwordButton.addEventListener("click", checkPassword);


// Enter key inside password box
passwordInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {
        checkPassword();
    }

    if (event.key === "Escape") {
        closePassword();
    }
});


function closePassword() {

    overlay.classList.add("hidden");

    passwordInput.value = "";
    passwordError.textContent = "";
}


async function checkPassword() {

    const password = passwordInput.value;

    if (password !== "Cinnamon279") {

        passwordError.textContent = "Incorrect password.";

        passwordInput.value = "";

        passwordInput.focus();

        return;
    }

    unlocked = true;

    overlay.classList.add("hidden");

    await openAlg();
}


async function openAlg() {

    try {

        // Get alg.yaml from the same directory as this page
        const response = await fetch("alg.yaml");

        if (!response.ok) {
            throw new Error(
                `Failed to load alg.yaml (${response.status})`
            );
        }

        // Treat the YAML file as plain text
        const html = await response.text();


        // Open a new about:blank tab
        const newTab = window.open("about:blank", "_blank");

        if (!newTab) {

            alert(
                "The browser blocked the new tab. " +
                "Allow popups for this site and try again."
            );

            return;
        }


        // Put the contents of alg.yaml into the new tab
        newTab.document.open();

        newTab.document.write(html);

        newTab.document.close();

    } catch (error) {

        console.error(error);

        alert(
            "Could not load alg.yaml.\n\n" +
            error.message
        );
    }
}
