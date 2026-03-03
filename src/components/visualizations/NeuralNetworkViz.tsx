"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  layers?: number[];
  animated?: boolean;
  title?: string;
}

export default function NeuralNetworkViz({
  layers = [4, 6, 8, 6, 4, 2],
  animated = true,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const w = mount.clientWidth;
    const h = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
    camera.position.set(0, 0, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // Build network geometry
    const nodeRadius = 0.25;
    const layerSpacing = (layers.length - 1) > 0 ? 16 / (layers.length - 1) : 1;
    const nodePositions: THREE.Vector3[][] = [];

    const nodeMeshes: THREE.Mesh[] = [];
    const edgeMeshes: THREE.Line[] = [];

    layers.forEach((nodeCount, li) => {
      const layerNodes: THREE.Vector3[] = [];
      const x = -8 + li * layerSpacing;
      const maxNodes = Math.max(...layers);
      const spacing = Math.min(3, 10 / nodeCount);

      for (let ni = 0; ni < nodeCount; ni++) {
        const y = ((nodeCount - 1) / 2 - ni) * spacing;
        const pos = new THREE.Vector3(x, y, 0);
        layerNodes.push(pos);

        // Color: input=cyan, hidden=indigo/violet, output=emerald
        let color: THREE.Color;
        if (li === 0) color = new THREE.Color(0x06b6d4);
        else if (li === layers.length - 1) color = new THREE.Color(0x10b981);
        else color = new THREE.Color(0x6366f1);

        const geo = new THREE.SphereGeometry(nodeRadius, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(pos);
        scene.add(mesh);
        nodeMeshes.push(mesh);
      }
      nodePositions.push(layerNodes);
    });

    // Edges
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });

    for (let li = 0; li < layers.length - 1; li++) {
      nodePositions[li].forEach((from) => {
        nodePositions[li + 1].forEach((to) => {
          const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
          const line = new THREE.Line(geo, edgeMat.clone());
          scene.add(line);
          edgeMeshes.push(line);
        });
      });
    }

    // Signal pulse animation
    const pulses: { layer: number; node: number; progress: number; color: THREE.Color }[] = [];
    let pulseTimer = 0;

    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.01;
      pulseTimer += 0.02;

      if (animated) {
        // Gentle rotation
        scene.rotation.y = Math.sin(t * 0.3) * 0.2;
        scene.rotation.x = Math.sin(t * 0.2) * 0.05;

        // Node pulsing
        nodeMeshes.forEach((mesh, i) => {
          const scale = 1 + Math.sin(t * 2 + i * 0.7) * 0.12;
          mesh.scale.setScalar(scale);
        });

        // Animate edge opacity
        if (Math.floor(pulseTimer) % 3 === 0) {
          edgeMeshes.forEach((line) => {
            const mat = line.material as THREE.LineBasicMaterial;
            mat.opacity = 0.08 + Math.sin(t * 3 + Math.random()) * 0.07;
          });
        }
      }

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
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [layers, animated]);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
          Input
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
          Hidden
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Output
        </span>
      </div>
    </div>
  );
}
