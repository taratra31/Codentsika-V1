import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Bot, Database, Sparkles } from "lucide-react";
import "./Splash.css";

/**
 * Splash – premium full-screen entry experience.
 * Deep space aesthetic with layered animations, glassmorphism logo,
 * particle effects, and a cinematic exit transition.
 * Redirects to the home page after ~3 seconds.
 */

const SPLASH_DURATION = 3000;

const featurePills = [
  { icon: <Bot />, label: "AI Assistant" },
  { icon: <Database />, label: "Backend Studio" },
  { icon: <Sparkles />, label: "Smart Code Gen" },
];

const particleCount = 8;

/* ─── Staggered child variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const scaleInVariants = {
  hidden: { opacity: 0, scale: 0.8, filter: "blur(12px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const pillVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 1.2 + i * 0.1,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export const Splash: React.FC = () => {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [statusText, setStatusText] = useState("Initialisation…");

  const handleExit = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      navigate("/home", { replace: true });
    }, 600);
  }, [navigate]);

  /* Status text rotation */
  useEffect(() => {
    const texts = [
      "Initialisation…",
      "Chargement des modules IA…",
      "Préparation du studio…",
      "Presque prêt…",
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setStatusText(texts[index]);
    }, 750);
    return () => clearInterval(interval);
  }, []);

  /* Auto-navigate */
  useEffect(() => {
    const timer = setTimeout(handleExit, SPLASH_DURATION);
    return () => clearTimeout(timer);
  }, [handleExit]);

  return (
    <AnimatePresence>
      {!isExiting ? (
        <motion.div
          key="splash"
          className="splash-root"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* ── Background layers ── */}
          <div className="splash-bg" />
          <div className="splash-noise" />
          <div className="splash-grid" />

          {/* ── Floating orbs ── */}
          <div className="splash-orb splash-orb--1" />
          <div className="splash-orb splash-orb--2" />
          <div className="splash-orb splash-orb--3" />

          {/* ── Horizontal accent lines ── */}
          <div className="splash-hline splash-hline--1" />
          <div className="splash-hline splash-hline--2" />

          {/* ── Particle dots ── */}
          <div className="splash-particles">
            {Array.from({ length: particleCount }).map((_, i) => (
              <div key={i} className="splash-particle" />
            ))}
          </div>

          {/* ── Corner accents ── */}
          <div className="splash-corner splash-corner--tl" />
          <div className="splash-corner splash-corner--br" />

          {/* ── Main content ── */}
          <motion.div
            className="splash-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Logo */}
            <motion.div className="splash-logo-wrapper" variants={scaleInVariants}>
              <div className="splash-logo-ring" />
              <div className="splash-logo-box">
                <Code2 strokeWidth={1.8} />
              </div>
            </motion.div>

            {/* Brand name */}
            <motion.h1 className="splash-brand" variants={fadeUpVariants}>
              Codentsika
            </motion.h1>

            {/* Tagline */}
            <motion.p className="splash-tagline" variants={fadeUpVariants}>
              AI-Powered Development Studio
            </motion.p>

            {/* Progress bar */}
            <motion.div
              className="splash-progress"
              variants={fadeUpVariants}
            >
              <div className="splash-progress-bar" />
              <div className="splash-progress-glow" />
            </motion.div>

            {/* Status text */}
            <motion.div variants={fadeUpVariants}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={statusText}
                  className="splash-status"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {statusText}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* Feature pills */}
            <div className="splash-pills">
              {featurePills.map((pill, i) => (
                <motion.div
                  key={pill.label}
                  className="splash-pill"
                  custom={i}
                  variants={pillVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {pill.icon}
                  <span>{pill.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Version badge ── */}
          <motion.span
            className="splash-version"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            v1.0.0 — Studio Edition
          </motion.span>
        </motion.div>
      ) : (
        <motion.div
          key="splash-exit"
          className="splash-root splash-exit"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
    </AnimatePresence>
  );
};

export default Splash;
