import React from "react";
import styles from "./Gallery.module.scss";

const Gallery = () => {
  return (
    <div className={styles.picture}>
      <canvas></canvas>
    </div>
  );
};

export default Gallery;
