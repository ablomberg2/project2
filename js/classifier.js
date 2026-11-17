
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/gh9UV09m4/";

let model;
let webcam;
let running = false;

const startButton = document.getElementById("start-button");
const stopButton = document.getElementById("stop-button");
const webcamContainer = document.getElementById("webcam-container");
const labelContainer = document.getElementById("label-container");
const cameraStatus = document.getElementById("camera-status");
const errorMessage = document.getElementById("error-message");

startButton.addEventListener("click", startCamera);
stopButton.addEventListener("click", stopCamera);

async function startCamera() {
    try {
        startButton.disabled = true;
        cameraStatus.textContent = "Loading model...";
        errorMessage.textContent = "";

        if (!model) {
            model = await tmImage.load(
                MODEL_URL + "model.json",
                MODEL_URL + "metadata.json"
            );
        }

        webcam = new tmImage.Webcam(320, 320, true);

        await webcam.setup();
        await webcam.play();

        webcamContainer.replaceChildren(webcam.canvas);

        running = true;
        startButton.hidden = true;
        startButton.disabled = false;
        stopButton.hidden = false;

        cameraStatus.textContent = "Camera is running. Show the model a key or coin!";
        predict();
    } catch (error) {
        console.error(error);
        cameraStatus.textContent = "The camera could not be started.";
        errorMessage.textContent =
            "Check that you have allowed camera access and are using the website through HTTPS or localhost.";

        startButton.disabled = false;
    }
}

async function predict() {
    if (!running) {
        return;
    }

    try {
        webcam.update();

        const predictions = await model.predict(webcam.canvas);

        labelContainer.replaceChildren();

        predictions.forEach(prediction => {
            const percentage = (prediction.probability * 100).toFixed(1);

            const result = document.createElement("p");
            result.className = "prediction";
            result.textContent =
                prediction.className + ": " + percentage + "%";

            labelContainer.appendChild(result);
        });

        if (running) {
            requestAnimationFrame(predict);
        }
    } catch (error) {
        console.error(error);
        errorMessage.textContent = "There was a problem making a prediction.";
        stopCamera();
    }
}

function stopCamera() {
    running = false;

    if (webcam) {
        webcam.stop();
        webcamContainer.replaceChildren();
    }

    startButton.hidden = false;
    startButton.disabled = false;
    stopButton.hidden = true;

    cameraStatus.textContent = "Camera stopped.";
    labelContainer.textContent = "Start the camera to see predictions.";
}
