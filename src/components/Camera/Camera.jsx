import React, { useEffect, useState } from "react";
import styles from "./Camera.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

const Camera = () => {
  useEffect(() => {
    initStream();
    initZoom();
  });

  const [set, setSet] = useState({ idName: "", type: "", userId: "" });

  const initStream = () => {
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      let constraints = {
        video: { width: 720, height: 340, facingMode: "user" },
        audio: false,
      };
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        const videoPlayer = document.querySelector("video");
        videoPlayer.srcObject = stream;
        videoPlayer.play();
      });
    } else {
      alert("Keine Kamera angeschlossen");
    }
  };

  const initZoom = () => {
    let constraints = {
      video: { width: 720, height: 340 },
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(async (mediaStream) => {
        const videoFeed = document.querySelector("video");
        videoFeed.srcObject = mediaStream;

        await sleep(1000);
        const track = mediaStream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        const settings = track.getSettings();

        const slider = document.querySelector("input");

        if (!("zoom" in capabilities)) {
          return Promise.reject("Zoom ist nicht unterstützt " + track.label);
        }
        slider.min = capabilities.zoom.min;
        slider.max = capabilities.zoom.max;
        slider.step = capabilities.zoom.step;
        slider.value = settings.zoom;
        slider.oninput = (event) => {
          track.applyConstraints({
            advanced: [{ zoom: event.target.value }],
          });
        };
        slider.hidden = false;
      })
      .catch((error) => console.log("Zoom Fehler", error.name || error));

    const sleep = (ms = 0) => new Promise((r) => setTimeout(r, ms));
  };

  const takePicture = () => {
    const picture = document.querySelector("canvas");
    picture.width = 720;
    picture.height = 340;
    const ctx = picture.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      document.querySelector("video"),
      0,
      0,
      picture.width,
      picture.height
    );
    const img = document.createElement("img");
    const pictureAsJPEG = (img.src = picture.toDataURL("image/jpeg"));
    sendPicture(pictureAsJPEG);
  };

  const sendPicture = (pictureAsJPEG) => {
    console.log(pictureAsJPEG);
    fetch("/rest/v1/masterdata/storephoto", {
      body: JSON.stringify({
        byteStream: `${pictureAsJPEG}`,
        idName: `${set.idName}`,
        typeName: `${set.type}`,
        userId: `${set.userId}`,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    });
  };

  const icon = {
    marginRight: "6px",
  };

  return (
    <div className={styles.camera}>
      <video autoPlay className={styles.feed}></video>
      <div className={styles.sliderWrapper}>
        <input className={styles.slider} type="range" min="0" max="10" />
      </div>

      <button onClick={takePicture} className={styles.btnVaadin}>
        <FontAwesomeIcon icon={faCamera} style={icon} />
        Foto aufnehmen
      </button>
    </div>
  );
};

export default Camera;
