import React, { useEffect, useRef } from 'react';
import { useTheme } from './ThemeProvider';

export function CursorTrail() {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0, active: false });
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Resize handler to keep canvas full screen
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        handleResize();

        // Mouse move handler
        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
            mouseRef.current.active = true;

            // Spawn particles on movement
            const particleCount = 2; // Number of particles to spawn per move event
            for (let i = 0; i < particleCount; i++) {
                // Generate soft lavender/violet/indigo colors matching the theme
                const colors = theme === 'dark' 
                    ? ['#A78BFA', '#C4B5FD', '#818CF8', '#C084FC'] // Lighter/glowier colors for dark mode
                    : ['#8B5CF6', '#6366F1', '#4F46E5', '#A78BFA']; // Richer lavenders for light mode
                const randomColor = colors[Math.floor(Math.random() * colors.length)];

                particlesRef.current.push({
                    x: e.clientX,
                    y: e.clientY,
                    vx: (Math.random() - 0.5) * 1.5, // Slow horizontal drift
                    vy: (Math.random() - 0.5) * 1.5 - 0.5, // Float slightly upwards
                    size: Math.random() * 8 + 4, // Particle size between 4px and 12px
                    color: randomColor,
                    opacity: 1.0,
                    decay: Math.random() * 0.02 + 0.015, // Fade speed
                    rotation: Math.random() * Math.PI,
                    rotationSpeed: (Math.random() - 0.5) * 0.05
                });
            }
        };

        const handleMouseLeave = () => {
            mouseRef.current.active = false;
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        // Drawing a beautiful 4-pointed AI sparkle star
        const drawSparkle = (context, x, y, size, color, opacity, rotation) => {
            context.save();
            context.translate(x, y);
            context.rotate(rotation);
            context.globalAlpha = opacity;
            context.fillStyle = color;
            
            // Glow effect
            context.shadowBlur = size * 1.2;
            context.shadowColor = color;

            context.beginPath();
            context.moveTo(0, -size);
            context.quadraticCurveTo(0, 0, size, 0);
            context.quadraticCurveTo(0, 0, 0, size);
            context.quadraticCurveTo(0, 0, -size, 0);
            context.quadraticCurveTo(0, 0, 0, -size);
            context.closePath();
            context.fill();
            context.restore();
        };

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.opacity -= p.decay;
                p.rotation += p.rotationSpeed;

                if (p.opacity <= 0 || p.size <= 0.5) {
                    particles.splice(i, 1);
                } else {
                    drawSparkle(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation);
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-[9999] mix-blend-multiply dark:mix-blend-screen"
            style={{ display: 'block' }}
        />
    );
}
