import { useEffect, useRef } from "react";
import * as THREE from "three";

function pastelColor() {
  const r = (Math.round(Math.random() * 127) + 127).toString(16).padStart(2, "0");
  const g = (Math.round(Math.random() * 127) + 127).toString(16).padStart(2, "0");
  const b = (Math.round(Math.random() * 127) + 127).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

const Cubes = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = document.getElementById("decor");
    const canvas = canvasRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
    renderer.setClearColor(0x000000, 0);

    const width = container.offsetWidth;
    renderer.setSize(width, width);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2;

    const cubes = [];
    for (let i = 0; i < 3; i++) {
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({
          color: pastelColor(),
          transparent: true,
          opacity: Math.random() * (0.95 - 0.6) + 0.6,
        })
      );
      cube.rotation.x = 60 * i;
      cube.rotation.y = 60 * i;
      scene.add(cube);
      cubes.push(cube);
    }

    const onWindowResize = () => {
      const w = container.offsetWidth;
      renderer.setSize(w, w);
    };
    window.addEventListener("resize", onWindowResize, false);

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      cubes.forEach((cube, i) => {
        if (i % 2 === 0) {
          cube.rotation.y += Math.random() * 0.01;
        } else {
          cube.rotation.x += Math.random() * (0.02 - 0.01) + 0.01;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onWindowResize, false);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} style={{ margin: "auto" }} />;
};

export default Cubes;
