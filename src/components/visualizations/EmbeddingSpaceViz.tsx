"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  clusters?: number;
  pointsPerCluster?: number;
}

export default function EmbeddingSpaceViz({
  clusters = 5,
  pointsPerCluster = 40,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const clusterColors = [
      0x6366f1, 0x06b6d4, 0x8b5cf6, 0x10b981, 0xf59e0b,
      0xef4444, 0xec4899, 0x14b8a6,
    ];

    const groups: THREE.Group[] = [];

    for (let c = 0; c < clusters; c++) {
      const group = new THREE.Group();
      const color = clusterColors[c % clusterColors.length];

      // Cluster center
      const cx = (Math.random() - 0.5) * 8;
      const cy = (Math.random() - 0.5) * 8;
      const cz = (Math.random() - 0.5) * 4;

      const centerGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const centerMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const center = new THREE.Mesh(centerGeo, centerMat);
      center.position.set(cx, cy, cz);
      group.add(center);

      // Points
      for (let p = 0; p < pointsPerCluster; p++) {
        const spread = 1.5;
        const px = cx + (Math.random() - 0.5) * spread;
        const py = cy + (Math.random() - 0.5) * spread;
        const pz = cz + (Math.random() - 0.5) * spread;

        const geo = new THREE.SphereGeometry(0.06, 8, 8);
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.4 + Math.random() * 0.4,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(px, py, pz);
        group.add(mesh);
      }

      scene.add(group);
      groups.push(group);
    }

    // Axes
    const axesMat = new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.4 });
    const axes = [
      [new THREE.Vector3(-6, 0, 0), new THREE.Vector3(6, 0, 0)],
      [new THREE.Vector3(0, -6, 0), new THREE.Vector3(0, 6, 0)],
      [new THREE.Vector3(0, 0, -4), new THREE.Vector3(0, 0, 4)],
    ];
    axes.forEach(([from, to]) => {
      const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
      scene.add(new THREE.Line(geo, axesMat));
    });

    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.005;
      scene.rotation.y = t * 0.4;
      scene.rotation.x = Math.sin(t * 0.3) * 0.15;

      // Gentle breathing
      groups.forEach((g, i) => {
        const scale = 1 + Math.sin(t * 1.5 + i) * 0.04;
        g.scale.setScalar(scale);
      });

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [clusters, pointsPerCluster]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-3 text-xs text-slate-500">
        Latent embedding space — each color represents a semantic cluster
      </div>
    </div>
  );
}
