import React, { useEffect, useRef, useMemo } from 'react';

const SpaceBackground = ({ mode = 'static' }) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    const isMobile = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.ref;
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        let animationFrameId;
        let particles = [];
        const particleCount = mode === 'interactive' ? 100 : 150;
        const distortionRadius = 150;
        const distortionStrength = 0.5;

        const resize = () => {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvasRef.current.width,
                    y: Math.random() * canvasRef.current.height,
                    size: Math.random() * 1.5 + 0.5,
                    color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
                    originalX: 0,
                    originalY: 0,
                });
                particles[i].originalX = particles[i].x;
                particles[i].originalY = particles[i].y;
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            particles.forEach(p => {
                let drawX = p.x;
                let drawY = p.y;

                if (mode === 'interactive' && !isMobile) {
                    const dx = mouseRef.current.x - p.originalX;
                    const dy = mouseRef.current.y - p.originalY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < distortionRadius) {
                        const force = (distortionRadius - distance) / distortionRadius;
                        const distortionX = dx * force * distortionStrength;
                        const distortionY = dy * force * distortionStrength;

                        p.x += (p.originalX + distortionX - p.x) * 0.1;
                        p.y += (p.originalY + distortionY - p.y) * 0.1;
                    } else {
                        p.x += (p.originalX - p.x) * 0.1;
                        p.y += (p.originalY - p.y) * 0.1;
                    }
                }

                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Target ~30fps for interactive
            if (mode === 'interactive') {
                setTimeout(() => {
                    animationFrameId = requestAnimationFrame(draw);
                }, 1000 / 30);
            } else {
                // Just draw once or low frequency for static
                animationFrameId = requestAnimationFrame(draw);
            }
        };

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('resize', resize);
        if (mode === 'interactive' && !isMobile) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mode, isMobile]);

    return (
        <div className="fixed inset-0 -z-10 bg-space-navy pointer-events-none overflow-hidden">
            {mode === 'interactive' && (
                <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none"></div>
            )}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-radial-gradient from-transparent via-space-navy/50 to-space-navy pointer-events-none"></div>
        </div>
    );
};

export default SpaceBackground;
