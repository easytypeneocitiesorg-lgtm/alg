<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>Phone Remote</title>


<style>

html,
body {

    width: 100%;
    height: 100%;

    margin: 0;

    background: #050505;

    color: white;

    font-family: Arial, sans-serif;

    overflow: hidden;
}


#topbar {

    height: 45px;

    display: flex;

    align-items: center;

    justify-content: space-between;

    padding: 0 15px;

    box-sizing: border-box;

    background: #111;

    border-bottom: 1px solid #222;
}


#status {

    font-size: 13px;

    color: #888;
}


#status.connected {

    color: #6cff6c;
}


#phoneArea {

    position: absolute;

    top: 45px;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;

    justify-content: center;

    align-items: center;

    background: #000;
}


#phone {

    max-width: 100%;
    max-height: 100%;

    object-fit: contain;

    user-select: none;

    cursor: default;
}


#message {

    position: absolute;

    left: 50%;
    top: 50%;

    transform:
        translate(-50%, -50%);

    color: #777;

    text-align: center;
}

</style>

</head>


<body>


<div id="topbar">

    <div>
        Phone Remote
    </div>

    <div id="status">
        Connecting...
    </div>

</div>


<div id="phoneArea">

    <div id="message">
        Connecting to phone...
    </div>

    <video
        id="phone"
        autoplay
        playsinline
        muted
    ></video>

</div>


<script>


// ============================================================
// CONFIG
// ============================================================

const SERVER =
    "https://albert-risks-appeals-wilson.trycloudflare.com";


// ============================================================
// ELEMENTS
// ============================================================

const video =
    document.getElementById("phone");

const status =
    document.getElementById("status");

const message =
    document.getElementById("message");


// ============================================================
// WEBRTC
// ============================================================

let pc;

let socket;

let phoneWidth = 1080;
let phoneHeight = 2340;


async function connect() {

    try {

        status.textContent =
            "Connecting...";


        // ---------------------------------------------
        // Get phone information
        // ---------------------------------------------

        const health =
            await fetch(
                SERVER + "/health"
            );


        const info =
            await health.json();


        phoneWidth =
            info.phone_width;

        phoneHeight =
            info.phone_height;


        // ---------------------------------------------
        // WebSocket
        // ---------------------------------------------

        socket =
            new WebSocket(
                SERVER
                    .replace(
                        "https://",
                        "wss://"
                    )
                    .replace(
                        "http://",
                        "ws://"
                    )
                + "/ws"
            );


        socket.onopen =
            () => {

                console.log(
                    "WebSocket connected"
                );

            };


        socket.onclose =
            () => {

                status.textContent =
                    "Disconnected";

                status.classList.remove(
                    "connected"
                );

            };


        // ---------------------------------------------
        // WebRTC
        // ---------------------------------------------

        pc =
            new RTCPeerConnection();


        pc.ontrack =
            (event) => {

                video.srcObject =
                    event.streams[0];

                message.style.display =
                    "none";

                status.textContent =
                    "Connected";

                status.classList.add(
                    "connected"
                );
            };


        pc.onconnectionstatechange =
            () => {

                console.log(
                    "WebRTC:",
                    pc.connectionState
                );

            };


        // Tell server we want video.
        pc.addTransceiver(
            "video",
            {
                direction: "recvonly"
            }
        );


        const offer =
            await pc.createOffer();


        await pc.setLocalDescription(
            offer
        );


        // ---------------------------------------------
        // Send WebRTC offer
        // ---------------------------------------------

        const response =
            await fetch(
                SERVER + "/offer",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        sdp:
                            pc.localDescription.sdp,

                        type:
                            pc.localDescription.type
                    })
                }
            );


        const answer =
            await response.json();


        await pc.setRemoteDescription(
            answer
        );


    } catch (error) {

        console.error(error);

        status.textContent =
            "Connection failed";

        message.textContent =
            "Could not connect to phone.";

    }

}


// ============================================================
// COORDINATE CONVERSION
// ============================================================

function phoneCoordinates(event) {

    const rect =
        video.getBoundingClientRect();


    const x =
        (event.clientX - rect.left)
        / rect.width
        * phoneWidth;


    const y =
        (event.clientY - rect.top)
        / rect.height
        * phoneHeight;


    return {
        x: Math.round(x),
        y: Math.round(y)
    };

}


// ============================================================
// MOUSE → TOUCH
// ============================================================

let touchStart = null;


video.addEventListener(
    "mousedown",
    (event) => {

        event.preventDefault();

        touchStart =
            phoneCoordinates(event);

    }
);


video.addEventListener(
    "mouseup",
    (event) => {

        event.preventDefault();

        if (!touchStart) {
            return;
        }


        const end =
            phoneCoordinates(event);


        const dx =
            Math.abs(
                end.x -
                touchStart.x
            );


        const dy =
            Math.abs(
                end.y -
                touchStart.y
            );


        if (
            dx < 20 &&
            dy < 20
        ) {

            send({
                type: "tap",

                x: end.x,
                y: end.y
            });

        } else {

            send({
                type: "swipe",

                x1: touchStart.x,
                y1: touchStart.y,

                x2: end.x,
                y2: end.y,

                duration: 250
            });

        }


        touchStart = null;

    }
);


// ============================================================
// KEYBOARD
// ============================================================

document.addEventListener(
    "keydown",
    (event) => {

        // Don't send browser shortcuts.
        if (
            event.ctrlKey ||
            event.altKey ||
            event.metaKey
        ) {
            return;
        }


        let androidKey = null;


        const keys = {

            "Backspace": "KEYCODE_DEL",

            "Enter": "KEYCODE_ENTER",

            "Escape": "KEYCODE_ESCAPE",

            "ArrowUp": "KEYCODE_DPAD_UP",

            "ArrowDown": "KEYCODE_DPAD_DOWN",

            "ArrowLeft": "KEYCODE_DPAD_LEFT",

            "ArrowRight": "KEYCODE_DPAD_RIGHT",

            "Tab": "KEYCODE_TAB",

            " ": "KEYCODE_SPACE"
        };


        if (
            keys[event.key]
        ) {

            androidKey =
                keys[event.key];

        }


        if (androidKey) {

            send({
                type: "key",
                key: androidKey
            });

            event.preventDefault();

            return;
        }


        // Regular printable characters
        if (
            event.key.length === 1
        ) {

            send({
                type: "text",
                text: event.key
            });

            event.preventDefault();

        }

    }
);


// ============================================================
// SEND COMMAND
// ============================================================

function send(data) {

    if (
        socket &&
        socket.readyState ===
        WebSocket.OPEN
    ) {

        socket.send(
            JSON.stringify(data)
        );

    }

}


// ============================================================
// START
// ============================================================

connect();

</script>

</body>

</html>
