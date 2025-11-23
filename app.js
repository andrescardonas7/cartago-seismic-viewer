import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ==========================================
// CARTAGO RESILIENTE - Main Application
// ==========================================

const FUN_FACTS = [
  '¿Sabías que Cartago ha resistido más de 255 sismos desde 1994?',
  'El sismo más superficial registrado fue a solo 0 km de profundidad',
  'El sismo más profundo alcanzó 149.7 km bajo la superficie',
  'Enero de 2024 registró la mayor actividad sísmica con múltiples eventos',
  'La magnitud más alta registrada fue de 3.4 Mi',
  'Cartago: 30 años de datos sísmicos, 30 años de resiliencia 💪',
  'Los sismos superficiales (<20km) se ven como erupciones rojas 🔴',
  'Los sismos profundos (>60km) se ven como implosiones azules 🔵',
];

class CartagoResilienteApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.controls = null;

    this.cartagoPlanet = null;
    this.earthquakes = [];
    this.earthquakeMarkers = [];
    this.particleSystems = [];

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hoveredMarker = null;

    this.currentMode = 'explorer';
    this.clickCount = 0;
    this.modeInterval = null;
    this.historyIndex = 0;

    this.lastTime = 0;
    this.frameCount = 0;
    this.fpsTime = 0;

    this.init();
  }

  async init() {
    this.updateLoading(10, 'Inicializando escena 3D...');
    await this.delay(200);

    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupComposer();
    this.setupControls();
    this.setupLights();

    this.updateLoading(30, 'Creando el universo...');
    await this.delay(200);

    this.createStarfield();
    this.createCartagoPlanet();

    this.updateLoading(50, 'Cargando memoria sísmica...');
    await this.loadEarthquakeData();

    this.updateLoading(70, 'Creando visualizaciones...');
    await this.delay(200);

    this.createEarthquakeMarkers();

    this.updateLoading(85, 'Configurando controles...');
    this.setupEventListeners();
    this.setupUI();
    await this.delay(200);

    this.updateLoading(100, '¡Listo!');
    await this.delay(500);

    this.hideLoading();
    this.animate();
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0001);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 8, 20);
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    document.getElementById('canvas-container').appendChild(this.renderer.domElement);
  }

  setupComposer() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8,  // strength
      0.4,  // radius
      0.85  // threshold
    );
    this.composer.addPass(bloomPass);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 50;
    this.controls.enablePan = false;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.5;
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x667eea, 2, 100);
    pointLight1.position.set(15, 15, 15);
    pointLight1.castShadow = true;
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf093fb, 1.5, 100);
    pointLight2.position.set(-15, -10, 15);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x764ba2, 1, 100);
    pointLight3.position.set(0, -15, -15);
    this.scene.add(pointLight3);
  }

  createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    for (let i = 0; i < 15000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      vertices.push(x, y, z);

      const colorVariation = Math.random();
      if (colorVariation > 0.8) {
        colors.push(0.6, 0.7, 1); // Blue stars
      } else if (colorVariation > 0.9) {
        colors.push(1, 0.6, 1); // Purple stars
      } else {
        colors.push(1, 1, 1); // White stars
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  createCartagoPlanet() {
    this.cartagoPlanet = new THREE.Group();

    // Planet sphere
    const geometry = new THREE.SphereGeometry(5, 128, 128);
    const material = new THREE.MeshStandardMaterial({
      color: 0x2d5a3d,
      roughness: 0.7,
      metalness: 0.3,
      emissive: 0x112211,
      emissiveIntensity: 0.2,
    });

    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    this.cartagoPlanet.add(planet);

    // Ring
    const ringGeometry = new THREE.RingGeometry(6, 6.3, 128);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x667eea,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });

    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    this.cartagoPlanet.add(ring);

    // Glow
    const glowGeometry = new THREE.SphereGeometry(5.2, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x667eea,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
    });

    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.cartagoPlanet.add(glow);

    this.scene.add(this.cartagoPlanet);
  }

  async loadEarthquakeData() {
    try {
      const response = await fetch('public/sismos_cartago.csv');
      const text = await response.text();
      const lines = text.split('\n').slice(1);

      this.earthquakes = lines
        .filter(line => line.trim())
        .map(line => {
          const parts = line.split(';');
          return {
            id: parts[0],
            fecha: parts[1],
            hora: parts[2],
            latitud: parseFloat(parts[3]),
            longitud: parseFloat(parts[4]),
            profundidad: parseFloat(parts[5]),
            magnitud: parseFloat(parts[6]),
            departamento: parts[7],
            municipio: parts[8],
          };
        });

      console.log(`📊 Loaded ${this.earthquakes.length} earthquakes`);
    } catch (error) {
      console.error('Error loading earthquake data:', error);
    }
  }

  createEarthquakeMarkers() {
    this.earthquakes.forEach(quake => {
      const phi = (90 - quake.latitud) * (Math.PI / 180);
      const theta = (quake.longitud + 180) * (Math.PI / 180);

      const radius = 5.15;
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);

      const position = new THREE.Vector3(x, y, z);
      const color = this.getColorByDepth(quake.profundidad);
      const size = 0.08 + (quake.magnitud / 3.4) * 0.25;

      const geometry = new THREE.SphereGeometry(size, 16, 16);
      const material = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.7,
        transparent: true,
        opacity: 0.9,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.userData = {
        quake,
        originalColor: color,
        originalScale: size,
        originalPosition: position.clone(),
      };

      this.scene.add(mesh);
      this.earthquakeMarkers.push(mesh);
    });
  }

  getColorByDepth(depth) {
    if (depth < 20) return 0xff4444;
    if (depth < 60) return 0xffaa00;
    return 0x4444ff;
  }

  createParticleExplosion(position, magnitude, depth) {
    const particleCount = Math.floor(magnitude * 100);
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const colors = [];

    const color = new THREE.Color(this.getColorByDepth(depth));

    for (let i = 0; i < particleCount; i++) {
      positions.push(position.x, position.y, position.z);

      const speed = 0.1 + Math.random() * 0.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;

      velocities.push(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed,
        Math.cos(phi) * speed
      );

      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.velocities = velocities;
    particles.userData.life = 1.0;

    this.scene.add(particles);
    this.particleSystems.push(particles);
  }

  updateParticles(deltaTime) {
    for (let i = this.particleSystems.length - 1; i >= 0; i--) {
      const system = this.particleSystems[i];
      const positions = system.geometry.attributes.position.array;
      const velocities = system.userData.velocities;

      for (let j = 0; j < positions.length; j += 3) {
        positions[j] += velocities[j] * deltaTime * 60;
        positions[j + 1] += velocities[j + 1] * deltaTime * 60;
        positions[j + 2] += velocities[j + 2] * deltaTime * 60;
      }

      system.geometry.attributes.position.needsUpdate = true;

      system.userData.life -= deltaTime * 0.5;
      system.material.opacity = system.userData.life;

      if (system.userData.life <= 0) {
        this.scene.remove(system);
        system.geometry.dispose();
        system.material.dispose();
        this.particleSystems.splice(i, 1);
      }
    }
  }

  // ==========================================
  // VISUALIZATION MODES
  // ==========================================

  setMode(mode) {
    this.clearModeInterval();
    this.currentMode = mode;

    // Reset markers
    this.earthquakeMarkers.forEach(marker => {
      marker.scale.set(1, 1, 1);
      marker.position.copy(marker.userData.originalPosition);
      marker.material.opacity = 0.9;
    });

    switch (mode) {
      case 'explorer':
        this.startExplorerMode();
        break;
      case 'history':
        this.startHistoryMode();
        break;
      case 'chaos':
        this.startChaosMode();
        break;
      case 'rain':
        this.startRainMode();
        break;
    }
  }

  startExplorerMode() {
    // Default mode - all visible
  }

  startHistoryMode() {
    this.earthquakeMarkers.forEach(m => m.material.opacity = 0.1);
    this.historyIndex = 0;

    this.modeInterval = setInterval(() => {
      if (this.historyIndex < this.earthquakeMarkers.length) {
        const marker = this.earthquakeMarkers[this.historyIndex];
        marker.material.opacity = 0.9;

        this.createParticleExplosion(
          marker.userData.originalPosition,
          marker.userData.quake.magnitud,
          marker.userData.quake.profundidad
        );

        const targetPos = marker.userData.originalPosition.clone().multiplyScalar(2.5);
        this.smoothCameraMove(targetPos, 0.5);

        this.historyIndex++;
      } else {
        this.historyIndex = 0;
        this.earthquakeMarkers.forEach(m => m.material.opacity = 0.1);
      }
    }, 150);
  }

  startChaosMode() {
    this.earthquakeMarkers.forEach((marker, index) => {
      this.animateMarkerPulse(marker, index);

      if (Math.random() > 0.95) {
        setTimeout(() => {
          this.createParticleExplosion(
            marker.userData.originalPosition,
            marker.userData.quake.magnitud * 0.5,
            marker.userData.quake.profundidad
          );
        }, Math.random() * 3000);
      }
    });
  }

  startRainMode() {
    this.earthquakeMarkers.forEach((marker, index) => {
      const startY = 20 + index * 0.3;
      marker.position.y = startY;

      const fallDuration = 2000 + (marker.userData.quake.magnitud / 3.4) * 2000;

      this.animateMarkerFall(marker, fallDuration, index * 50);
    });
  }

  animateMarkerPulse(marker, index) {
    const startTime = Date.now();
    const duration = 500 + Math.random() * 500;

    const pulse = () => {
      if (this.currentMode !== 'chaos') return;

      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;
      const scale = 1 + Math.sin(progress * Math.PI) * 0.5;

      marker.scale.set(scale, scale, scale);

      requestAnimationFrame(pulse);
    };

    pulse();
  }

  animateMarkerFall(marker, duration, delay) {
    setTimeout(() => {
      const startTime = Date.now();
      const startY = marker.position.y;
      const targetY = marker.userData.originalPosition.y;

      const fall = () => {
        if (this.currentMode !== 'rain') {
          marker.position.copy(marker.userData.originalPosition);
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress * progress; // Ease in

        marker.position.y = startY + (targetY - startY) * eased;

        if (progress >= 1) {
          this.createParticleExplosion(
            marker.userData.originalPosition,
            marker.userData.quake.magnitud,
            marker.userData.quake.profundidad
          );
          marker.position.copy(marker.userData.originalPosition);
        } else {
          requestAnimationFrame(fall);
        }
      };

      fall();
    }, delay);
  }

  smoothCameraMove(targetPos, duration) {
    const startPos = this.camera.position.clone();
    const startTime = Date.now();

    const move = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPos, targetPos, eased);

      if (progress < 1) {
        requestAnimationFrame(move);
      }
    };

    move();
  }

  clearModeInterval() {
    if (this.modeInterval) {
      clearInterval(this.modeInterval);
      this.modeInterval = null;
    }
  }

  // ==========================================
  // EVENT LISTENERS
  // ==========================================

  setupEventListeners() {
    window.addEventListener('resize', () => this.onWindowResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('click', (e) => this.onClick(e));
    window.addEventListener('dblclick', (e) => this.onDoubleClick(e));

    window.addEventListener('keydown', (e) => {
      const modes = ['explorer', 'history', 'chaos', 'rain'];
      const key = parseInt(e.key);
      if (key >= 1 && key <= 4) {
        this.setMode(modes[key - 1]);
        document.querySelector(`[data-mode="${modes[key - 1]}"]`).click();
      }
    });
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.earthquakeMarkers);

    if (this.hoveredMarker) {
      this.hoveredMarker.scale.set(1, 1, 1);
      this.hoveredMarker = null;
    }

    if (intersects.length > 0) {
      this.hoveredMarker = intersects[0].object;
      this.hoveredMarker.scale.set(1.8, 1.8, 1.8);
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      this.renderer.domElement.style.cursor = 'default';
    }
  }

  onClick(e) {
    if (this.hoveredMarker) {
      this.createDataConfetti(this.hoveredMarker);
      this.clickCount++;

      if (this.clickCount >= 10) {
        this.showAchievement('🎓 ¡Sismólogo Pro!', '10 sismos explorados');
        this.clickCount = 0;
      }
    }
  }

  onDoubleClick(e) {
    if (this.hoveredMarker) {
      const targetPos = this.hoveredMarker.userData.originalPosition.clone().multiplyScalar(2.2);
      this.smoothCameraMove(targetPos, 1.5);

      setTimeout(() => {
        this.createParticleExplosion(
          this.hoveredMarker.userData.originalPosition,
          this.hoveredMarker.userData.quake.magnitud * 2,
          this.hoveredMarker.userData.quake.profundidad
        );
      }, 1500);
    }
  }

  createDataConfetti(marker) {
    const quake = marker.userData.quake;
    const confettiTexts = [
      `📅 ${quake.fecha}`,
      `⏰ ${quake.hora}`,
      `📊 ${quake.magnitud} Mi`,
      `📏 ${quake.profundidad} km`,
      `📍 ${quake.municipio}`,
    ];

    const vector = marker.userData.originalPosition.clone();
    vector.project(this.camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

    confettiTexts.forEach((text, i) => {
      const div = document.createElement('div');
      Object.assign(div.style, {
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        color: '#fff',
        fontSize: '14px',
        fontWeight: 'bold',
        background: 'rgba(102, 126, 234, 0.9)',
        padding: '5px 10px',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: '999',
        transition: 'all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      });
      div.textContent = text;

      document.body.appendChild(div);

      setTimeout(() => {
        const angle = (i / confettiTexts.length) * Math.PI * 2;
        const distance = 100;
        div.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        div.style.opacity = '0';
      }, 10);

      setTimeout(() => div.remove(), 1100);
    });
  }

  // ==========================================
  // UI MANAGEMENT
  // ==========================================

  setupUI() {
    // Total quakes counter
    const totalQuakesEl = document.getElementById('total-quakes');
    this.animateCounter(totalQuakesEl, 0, this.earthquakes.length, 2000);

    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMode(btn.dataset.mode);
      });
    });

    // Toggle panel
    document.getElementById('toggle-panel').addEventListener('click', () => {
      document.getElementById('control-panel').classList.toggle('visible');
    });

    // Fun facts rotation
    this.rotateFunFacts();
  }

  rotateFunFacts() {
    setInterval(() => {
      const factEl = document.getElementById('fun-fact');
      const randomFact = FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)];

      factEl.style.opacity = '0';
      setTimeout(() => {
        factEl.textContent = randomFact;
        factEl.style.opacity = '1';
      }, 300);
    }, 10000);
  }

  showAchievement(title, desc) {
    const achievement = document.getElementById('achievement');
    document.getElementById('achievement-title').textContent = title;
    document.getElementById('achievement-desc').textContent = desc;

    achievement.classList.add('show');

    setTimeout(() => {
      achievement.classList.remove('show');
    }, 3000);
  }

  animateCounter(element, start, end, duration) {
    const startTime = Date.now();

    const update = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.floor(start + (end - start) * progress);

      element.textContent = value;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    update();
  }

  updateLoading(percent, status) {
    document.getElementById('loading-bar').style.width = `${percent}%`;
    document.getElementById('loading-status').textContent = status;
  }

  hideLoading() {
    const loading = document.getElementById('loading');
    loading.style.opacity = '0';

    setTimeout(() => {
      loading.classList.add('hidden');
      document.getElementById('control-panel').classList.add('visible');
    }, 800);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==========================================
  // ANIMATION LOOP
  // ==========================================

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now();
    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;

    // Update objects
    if (this.starfield) {
      this.starfield.rotation.y += deltaTime * 0.01;
    }

    if (this.cartagoPlanet) {
      this.cartagoPlanet.rotation.y += deltaTime * 0.05;

      // Subtle breathing effect
      const breathe = Math.sin(time * 0.001) * 0.02 + 1;
      this.cartagoPlanet.children[2].scale.setScalar(breathe);
    }

    this.updateParticles(deltaTime);

    this.controls.update();

    // FPS counter
    this.frameCount++;
    this.fpsTime += deltaTime;

    if (this.fpsTime >= 0.5) {
      const fps = this.frameCount / this.fpsTime;
      document.getElementById('fps').textContent = Math.round(fps);
      document.getElementById('objects').textContent = this.scene.children.length;

      this.frameCount = 0;
      this.fpsTime = 0;
    }

    // Render
    this.composer.render();
  }
}

// Start the application
new CartagoResilienteApp();
