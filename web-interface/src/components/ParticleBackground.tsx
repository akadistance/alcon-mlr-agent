import React, { useEffect, useRef, useState } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseSize: number;
  speedX: number;
  speedY: number;
  baseSpeedX: number;
  baseSpeedY: number;
  opacity: number;
  targetOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  lifespan: number;
  maxLifespan: number;
  colorIndex: number;
  noiseOffsetX: number;
  noiseOffsetY: number;
}

// Simple noise function for organic movement (simplified Perlin-like)
const noise = (x: number, y: number, time: number, frequency: number): number => {
  const n = Math.sin(x * frequency + time * frequency * 0.05) + Math.cos(y * frequency + time * frequency * 0.05);
  return (n + 2) / 4; // Normalize to 0-1
};

interface ParticleBackgroundProps {
  hideWhenChatting?: boolean;
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ hideWhenChatting = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<NodeJS.Timeout>();
  const timeRef = useRef<number>(0);
  const observerRef = useRef<MutationObserver | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  const IDLE_THRESHOLD = 3000; // 3 seconds
  const FADE_IN_SPEED = 0.015; // Smooth fade in over ~2 seconds
  const FADE_OUT_SPEED = 0.05;
  const MIN_OPACITY = 0.35;
  const MAX_OPACITY = 1.0;
  const MIN_SIZE = 0.5; // Increased for star-like appearance
  const MAX_SIZE = 1; // Increased for star-like appearance
  const MIN_SPEED = 0.05; // Much slower
  const MAX_SPEED = 0.15; // Much slower
  const DAMPING = 0.98; // Gradual slowdown
  const NOISE_AMPLITUDE = 0.1; // Reduced noise for slower movement
  const NOISE_FREQUENCY = 0.005;
  const LIFESPAN_MIN = 10000; // 10 seconds
  const LIFESPAN_MAX = 30000; // 30 seconds
  const TWINKLE_SPEED = 0.15; // Faster twinkling for star effect
  const STAR_SHINE_INTENSITY = 0.8; // Intensity of star shine effect


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Grok-style particle configuration - reduced count and more spread
    const getParticleCount = () => {
      const area = window.innerWidth * window.innerHeight;
      const density = isIdle ? 0.15 : 0.08; // Much lower density - more spread out
      return Math.min(Math.max(Math.floor((area / 10000) * density), 100), 400);
    };

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Adjust particle count based on new size
      const targetCount = getParticleCount();
      const currentCount = particlesRef.current.length;
      
      if (targetCount > currentCount) {
        // Add particles
        for (let i = currentCount; i < targetCount; i++) {
          particlesRef.current.push(createParticle(canvas.width, canvas.height));
        }
      } else if (targetCount < currentCount) {
        // Remove excess particles
        particlesRef.current = particlesRef.current.slice(0, targetCount);
      }
    };

    const createParticle = (width: number, height: number): Particle => {
      // Spawn from bottom right but spread more across the screen
      // Use a wider spawn area for better distribution
      const spawnX = width * 0.5 + (Math.random() - 0.5) * width * 0.8; // Spread across 80% of width
      const spawnY = height * 0.5 + (Math.random() - 0.5) * height * 0.8; // Spread across 80% of height
      
      // Movement direction: upward and leftward
      const angle = Math.random() * Math.PI * 0.75 + Math.PI * 0.5;
      const speed = Math.random() * (MAX_SPEED - MIN_SPEED) + MIN_SPEED;
      
      return {
        x: spawnX,
        y: spawnY,
        size: Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE,
        baseSize: Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        baseSpeedX: Math.cos(angle) * speed,
        baseSpeedY: Math.sin(angle) * speed,
        opacity: 0,
        targetOpacity: Math.random() * (MAX_OPACITY - MIN_OPACITY) + MIN_OPACITY,
        twinkleSpeed: TWINKLE_SPEED + Math.random() * 0.05,
        twinklePhase: Math.random() * Math.PI * 2,
        lifespan: 0,
        maxLifespan: Math.random() * (LIFESPAN_MAX - LIFESPAN_MIN) + LIFESPAN_MIN,
        colorIndex: 0, // Always use first (and only) color
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
      };
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const count = getParticleCount();
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle(canvas.width, canvas.height));
      }
    };

    initParticles();

    // Idle detection
    const handleInteraction = () => {
      clearTimeout(idleTimerRef.current);
      setIsIdle(false);

      idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
      }, IDLE_THRESHOLD);
    };

    // Initial idle check
    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, IDLE_THRESHOLD);

    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('scroll', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    // Watch for theme changes
    observerRef.current = new MutationObserver(() => {
      const darkMode = document.documentElement.classList.contains('dark');
      if (darkMode !== isDarkMode) {
        setIsDarkMode(darkMode);
        // Regenerate particles with new colors
        const count = getParticleCount();
        particlesRef.current = [];
        for (let i = 0; i < count; i++) {
          particlesRef.current.push(createParticle(canvas.width, canvas.height));
        }
      }
    });

    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Animation loop
    const animate = () => {
      if (!ctx) return;

      timeRef.current += 16; // Approximate frame time
      const currentTime = timeRef.current;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Hide particles if chat has started
      if (hideWhenChatting) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update lifespan
        particle.lifespan += 16;
        
        // Respawn if lifespan exceeded
        if (particle.lifespan > particle.maxLifespan) {
          const newParticle = createParticle(canvas.width, canvas.height);
          particlesRef.current[index] = newParticle;
          return;
        }

        // Apply noise for organic movement
        const noiseX = noise(particle.x + particle.noiseOffsetX, particle.y, currentTime, NOISE_FREQUENCY);
        const noiseY = noise(particle.y + particle.noiseOffsetY, particle.x, currentTime, NOISE_FREQUENCY);
        
        // Update speed with noise influence
        const noiseInfluenceX = (noiseX - 0.5) * NOISE_AMPLITUDE;
        const noiseInfluenceY = (noiseY - 0.5) * NOISE_AMPLITUDE;
        
        particle.speedX = particle.baseSpeedX + noiseInfluenceX;
        particle.speedY = particle.baseSpeedY + noiseInfluenceY;
        
        // Apply damping for gradual slowdown (more in idle)
        const dampingFactor = isIdle ? DAMPING : 0.99;
        particle.speedX *= dampingFactor;
        particle.speedY *= dampingFactor;

        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around or respawn from bottom right
        if (particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
          const newParticle = createParticle(canvas.width, canvas.height);
          particlesRef.current[index] = newParticle;
          return;
        }

        // Twinkling effect (size and opacity pulse)
        const twinkle = Math.sin(currentTime * particle.twinkleSpeed * 0.001 + particle.twinklePhase) * 0.3 + 1;
        particle.size = particle.baseSize * twinkle;

        // Update opacity based on idle state
        if (isIdle) {
          // Fade in when idle
          if (particle.opacity < particle.targetOpacity) {
            particle.opacity = Math.min(
              particle.opacity + FADE_IN_SPEED,
              particle.targetOpacity
            );
          }
        } else {
          // Fade out when active
          particle.opacity = Math.max(particle.opacity - FADE_OUT_SPEED, 0);
        }

        // Draw particle
        if (particle.opacity > 0) {
          // Get color based on current theme
          const themeColors = isDarkMode 
            ? [{ r: 255, g: 255, b: 255 }] // White for dark mode
            : [{ r: 0, g: 53, b: 149 }]; // Alcon blue for light mode
          const color = themeColors[0]; // Always use first (and only) color
          
          // Enhanced twinkling with multiple frequencies for star-like effect
          const fastTwinkle = Math.sin(currentTime * particle.twinkleSpeed * 0.002 + particle.twinklePhase) * 0.3 + 0.7;
          const slowTwinkle = Math.sin(currentTime * particle.twinkleSpeed * 0.0005 + particle.twinklePhase * 2) * 0.2 + 0.8;
          const opacityPulse = fastTwinkle * slowTwinkle;
          const currentOpacity = particle.opacity * opacityPulse;
          
          // Star shine effect - brighter pulses
          const shineIntensity = Math.sin(currentTime * particle.twinkleSpeed * 0.003 + particle.twinklePhase * 1.5) * STAR_SHINE_INTENSITY + (1 - STAR_SHINE_INTENSITY);
          
          // Outer glow - larger and softer for star effect
          const outerGradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 4
          );
          
          outerGradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${currentOpacity * shineIntensity * 0.8})`);
          outerGradient.addColorStop(0.3, `rgba(${color.r}, ${color.g}, ${color.b}, ${currentOpacity * shineIntensity * 0.5})`);
          outerGradient.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, ${currentOpacity * shineIntensity * 0.2})`);
          outerGradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
          
          ctx.fillStyle = outerGradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
          ctx.fill();
          
          // Main star body with glow
          const gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 2.5
          );
          
          // Center: very bright for star shine
          gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${currentOpacity * shineIntensity})`);
          // Mid: fade
          gradient.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${currentOpacity * shineIntensity * 0.7})`);
          // Outer: more fade
          gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, ${currentOpacity * shineIntensity * 0.4})`);
          gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Bright center core - star point
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${currentOpacity * shineIntensity})`;
          ctx.fill();
          
          // Add sparkle effect - occasional bright flashes
          if (Math.random() < 0.1) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 0.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * shineIntensity * 0.9})`;
            ctx.fill();
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearTimeout(idleTimerRef.current);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isIdle, isDarkMode, hideWhenChatting]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-0 ${hideWhenChatting ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleBackground;
