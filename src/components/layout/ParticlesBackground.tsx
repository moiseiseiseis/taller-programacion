'use client';

import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);

  // Inicializamos el motor de partículas una sola vez al cargar
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 z-0 pointer-events-auto"
      options={{
        background: {
          color: { value: 'transparent' }, // El fondo crema de tu layout se verá a través
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'grab', // Al pasar el mouse, las partículas se conectan al cursor
            },
          },
          modes: {
            grab: {
              distance: 200,
              links: {
                opacity: 0.5,
                color: '#D5615B', // Las líneas hacia el cursor serán color Salmón
              },
            },
          },
        },
        particles: {
          color: { value: '#9DB6D3' }, // Color Acero (Steel) para los nodos
          links: {
            color: '#00629B', // Color Azul IEEE para las conexiones
            distance: 150,
            enable: true,
            opacity: 0.15, //suave
            width: 1,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: { default: 'bounce' }, // Si tocan el borde, rebotan suavemente
            random: false,
            speed: 0.6, // Movimiento muy lento y analítico
            straight: false,
          },
          number: {
            density: { enable: true, width: 800, height: 800 },
            value: 60, // Cantidad de nodos en pantalla
          },
          opacity: { value: 0.4 },
          shape: { type: 'circle' },
          size: {
            value: { min: 1, max: 2 }, 
          },
        },
        detectRetina: true,
      }}
    />
  );
}