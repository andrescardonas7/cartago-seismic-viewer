import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ==========================================
// CARTAGO RESILIENTE - Geographically Accurate Map
// Cartago, Valle del Cauca, Colombia
// ==========================================

const FUN_FACTS = [
  '¿Sabías que Cartago ha resistido más de 255 sismos desde 1994?',
  'El sismo más superficial registrado fue a solo 0 km de profundidad',
  'El sismo más profundo alcanzó 149.7 km bajo la superficie',
  'Enero de 2024 registró la mayor actividad sísmica',
  'La magnitud más alta registrada fue de 3.4 Mi',
  'Cartago: 30 años de datos sísmicos, 30 años de resiliencia 💪',
  'Sismos superficiales (<20km) = erupciones rojas 🔴',
  'Sismos profundos (>60km) = implosiones azules 🔵',
  'Cartago está en 4.75°N, 75.91°W en el Valle del Cauca',
  'La visualización muestra coordenadas geográficas REALES',
];

class CartagoResilienteApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.composer = null;
    this.controls = null;

    // REAL geographic bounds for Cartago region
    this.geoBounds = {
      minLat: 4.61,
      maxLat: 4.82,
      minLng: -76.01,
      maxLng: -75.82
    };

    this.mapScale = 100;

    this.cartagoMap = null;
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

    this.updateLoading(30, 'Creando mapa de Cartago...');
    await this.delay(200);

    this.createStarfield();
    this.createCartagoMap();
    this.createDepthIndicators();

    this.updateLoading(50, 'Cargando memoria sísmica...');
    await this.loadEarthquakeData();

    this.updateLoading(70, 'Posicionando sismos geográficamente...');
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
    this.scene.fog = new THREE.FogExp2(0x000814, 0.002);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(50, 80, 100);
    this.camera.lookAt(0, 0, 0);
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
      0.6, 0.4, 0.85
    );
    this.composer.addPass(bloomPass);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 30;
    this.controls.maxDistance = 200;
    this.controls.maxPolarAngle = Math.PI / 2.2;
    this.controls.target.set(0, 0, 0);
  }

  setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(50, 100, 50);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    this.scene.add(dirLight);

    const pointLight1 = new THREE.PointLight(0x667eea, 1.5, 150);
    pointLight1.position.set(-30, 40, -30);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xf093fb, 1.2, 150);
    pointLight2.position.set(30, 40, 30);
    this.scene.add(pointLight2);
  }

  createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];

    for (let i = 0; i < 8000; i++) {
      const x = (Math.random() - 0.5) * 1000;
      const y = Math.random() * 500 + 100;
      const z = (Math.random() - 0.5) * 1000;
      vertices.push(x, y, z);

      const colorVar = Math.random();
      if (colorVar > 0.8) {
        colors.push(0.6, 0.7, 1);
      } else if (colorVar > 0.9) {
        colors.push(1, 0.6, 1);
      } else {
        colors.push(1, 1, 1);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  createCartagoMap() {
    this.cartagoMap = new THREE.Group();

    const mapWidth = this.mapScale;
    const mapHeight = this.mapScale;

    // Terrain plane
    const geometry = new THREE.PlaneGeometry(mapWidth, mapHeight, 50, 50);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const noise = (Math.random() - 0.5) * 0.5;
      positions.setZ(i, noise);
    }
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color: 0x1a4d2e,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide,
    });

    const terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    this.cartagoMap.add(terrain);

    // Grid overlay
    const gridHelper = new THREE.GridHelper(mapWidth, 20, 0x667eea, 0x334477);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.3;
    this.cartagoMap.add(gridHelper);

    // Border
    const borderGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(mapWidth, 0.5, mapHeight));
    const borderMat = new THREE.LineBasicMaterial({
      color: 0x667eea,
      transparent: true,
      opacity: 0.8
    });
    const border = new THREE.LineSegments(borderGeom, borderMat);
    border.position.y = 0.25;
    this.cartagoMap.add(border);

    // Cartago city marker
    const markerGeom = new THREE.CylinderGeometry(0.8, 0.8, 2, 16);
    const markerMat = new THREE.MeshStandardMaterial({
      color: 0xf093fb,
      emissive: 0xf093fb,
      emissiveIntensity: 0.5,
    });
    const cityMarker = new THREE.Mesh(markerGeom, markerMat);

    const centerPos = this.latLngToXZ(4.746, -75.912);
    cityMarker.position.set(centerPos.x, 1, centerPos.z);
    this.cartagoMap.add(cityMarker);

    this.createLabel('CARTAGO', centerPos.x, 3, centerPos.z);

    this.scene.add(this.cartagoMap);
  }

  createDepthIndicators() {
    const maxDepth = -50;

    for (let i = 0; i <= 5; i++) {
      const depth = (maxDepth / 5) * i;
      const realDepth = (150 / 5) * i;

      const planeGeom = new THREE.PlaneGeometry(this.mapScale * 1.2, this.mapScale * 1.2);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x0a1628,
        transparent: true,
        opacity: 0.05 + i * 0.03,
        side: THREE.DoubleSide,
        wireframe: true,
      });
      const plane = new THREE.Mesh(planeGeom, planeMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = depth;
      this.scene.add(plane);

      this.createLabel(realDepth + 'km', this.mapScale * 0.6, depth, this.mapScale * 0.6, 0.5);
    }

    // North arrow
    const arrowGeom = new THREE.ConeGeometry(0.8, 3, 8);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
    const arrow = new THREE.Mesh(arrowGeom, arrowMat);
    arrow.position.set(-this.mapScale * 0.55, 2, -this.mapScale * 0.55);
    arrow.rotation.x = -Math.PI / 2;
    this.scene.add(arrow);

    this.createLabel('N', -this.mapScale * 0.55, 4, -this.mapScale * 0.55, 1);
  }

  createLabel(text, x, y, z, size = 0.8) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 128;

    context.fillStyle = 'rgba(102, 126, 234, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'Bold 48px Orbitron';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.position.set(x, y, z);
    sprite.scale.set(size * 4, size * 2, 1);

    this.scene.add(sprite);
  }

  latLngToXZ(lat, lng) {
    const { minLat, maxLat, minLng, maxLng } = this.geoBounds;

    const normLat = (lat - minLat) / (maxLat - minLat);
    const normLng = (lng - minLng) / (maxLng - minLng);

    const x = (normLng - 0.5) * this.mapScale;
    const z = -(normLat - 0.5) * this.mapScale;

    return { x, z };
  }

  depthToY(depth) {
    return -(depth / 150) * 50;
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
      console.log(`📍 Bounds:`, this.geoBounds);
    } catch (error) {
      console.error('Error loading earthquake data:', error);
    }
  }

  createEarthquakeMarkers() {
    this.earthquakes.forEach(quake => {
      const { x, z } = this.latLngToXZ(quake.latitud, quake.longitud);
      const y = this.depthToY(quake.profundidad);

      const position = new THREE.Vector3(x, y, z);
      const color = this.getColorByDepth(quake.profundidad);
      const size = 0.3 + (quake.magnitud / 3.4) * 0.8;

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
      mesh.castShadow = true;

      // Depth line
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0, z),
        new THREE.Vector3(x, y, z)
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      this.scene.add(line);

      mesh.userData = {
        quake,
        originalColor: color,
        originalScale: size,
        originalPosition: position.clone(),
        depthLine: line,
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

      const speed = 0.15 + Math.random() * 0.4;
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
      size: 0.2,
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

  setMode(mode) {
    if (this.modeInterval) {
      clearInterval(this.modeInterval);
      this.modeInterval = null;
    }

    this.currentMode = mode;

    this.earthquakeMarkers.forEach(marker => {
      marker.scale.set(1, 1, 1);
      marker.position.copy(marker.userData.originalPosition);
      marker.material.opacity = 0.9;
      marker.userData.depthLine.material.opacity = 0.3;
    });

    if (mode === 'history') this.startHistoryMode();
    if (mode === 'chaos') this.startChaosMode();
    if (mode === 'rain') this.startRainMode();
  }

  startHistoryMode() {
    this.earthquakeMarkers.forEach(m => {
      m.material.opacity = 0.1;
      m.userData.depthLine.material.opacity = 0.05;
    });
    this.historyIndex = 0;

    this.modeInterval = setInterval(() => {
      if (this.historyIndex < this.earthquakeMarkers.length) {
        const marker = this.earthquakeMarkers[this.historyIndex];
        marker.material.opacity = 0.9;
        marker.userData.depthLine.material.opacity = 0.5;

        this.createParticleExplosion(
          marker.userData.originalPosition,
          marker.userData.quake.magnitud,
          marker.userData.quake.profundidad
        );

        this.historyIndex++;
      } else {
        this.historyIndex = 0;
        this.earthquakeMarkers.forEach(m => {
          m.material.opacity = 0.1;
          m.userData.depthLine.material.opacity = 0.05;
        });
      }
    }, 120);
  }

  startChaosMode() {
    this.earthquakeMarkers.forEach((marker) => {
      const startTime = Date.now();
      const duration = 500 + Math.random() * 500;

      const pulse = () => {
        if (this.currentMode !== 'chaos') return;

        const elapsed = Date.now() - startTime;
        const progress = (elapsed % duration) / duration;
        const scale = 1 + Math.sin(progress * Math.PI) * 0.7;

        marker.scale.set(scale, scale, scale);
        marker.userData.depthLine.material.opacity = 0.3 + Math.sin(progress * Math.PI) * 0.3;

        requestAnimationFrame(pulse);
      };

      pulse();

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
      const startY = 80 + index * 0.5;
      marker.position.y = startY;

      const fallDuration = 1500 + (marker.userData.quake.magnitud / 3.4) * 1500;

      setTimeout(() => {
        const startTime = Date.now();
        const targetY = marker.userData.originalPosition.y;

        const fall = () => {
          if (this.currentMode !== 'rain') {
            marker.position.copy(marker.userData.originalPosition);
            return;
          }

          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / fallDuration, 1);
          const eased = progress * progress;

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
      }, index * 30);
    });
  }

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
      this.hoveredMarker.userData.depthLine.material.opacity = 0.3;
      this.hoveredMarker = null;
    }

    if (intersects.length > 0) {
      this.hoveredMarker = intersects[0].object;
      this.hoveredMarker.scale.set(2, 2, 2);
      this.hoveredMarker.userData.depthLine.material.opacity = 0.8;
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
      const targetPos = this.hoveredMarker.userData.originalPosition.clone();
      targetPos.y += 25;

      const startPos = this.camera.position.clone();
      const startTime = Date.now();

      const move = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / 1000, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        this.camera.position.lerpVectors(startPos, targetPos, eased);

        if (progress < 1) {
          requestAnimationFrame(move);
        }
      };

      move();

      setTimeout(() => {
        this.createParticleExplosion(
          this.hoveredMarker.userData.originalPosition,
          this.hoveredMarker.userData.quake.magnitud * 2,
          this.hoveredMarker.userData.quake.profundidad
        );
      }, 1000);
    }
  }

  createDataConfetti(marker) {
    const quake = marker.userData.quake;
    const texts = [
      `📅 ${quake.fecha}`,
      `⏰ ${quake.hora}`,
      `📊 ${quake.magnitud} Mi`,
      `📏 ${quake.profundidad} km`,
      `📍 ${quake.latitud.toFixed(3)}°N`,
      `📍 ${quake.longitud.toFixed(3)}°W`,
    ];

    const vector = marker.userData.originalPosition.clone();
    vector.project(this.camera);

    const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const y = (vector.y * -0.5 + 0.5) * window.innerHeight;

    texts.forEach((text, i) => {
      const div = document.createElement('div');
      Object.assign(div.style, {
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        color: '#fff',
        fontSize: '13px',
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
        const angle = (i / texts.length) * Math.PI * 2;
        const distance = 100;
        div.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        div.style.opacity = '0';
      }, 10);

      setTimeout(() => div.remove(), 1100);
    });
  }

  setupUI() {
    const totalQuakesEl = document.getElementById('total-quakes');
    this.animateCounter(totalQuakesEl, 0, this.earthquakes.length, 2000);

    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMode(btn.dataset.mode);
      });
    });

    document.getElementById('toggle-panel').addEventListener('click', () => {
      document.getElementById('control-panel').classList.toggle('visible');
    });

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

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now();
    const deltaTime = (time - this.lastTime) / 1000;
    this.lastTime = time;

    if (this.starfield) {
      this.starfield.rotation.y += deltaTime * 0.005;
    }

    this.updateParticles(deltaTime);
    this.controls.update();

    this.frameCount++;
    this.fpsTime += deltaTime;

    if (this.fpsTime >= 0.5) {
      const fps = this.frameCount / this.fpsTime;
      document.getElementById('fps').textContent = Math.round(fps);
      document.getElementById('objects').textContent = this.scene.children.length;

      this.frameCount = 0;
      this.fpsTime = 0;
    }

    this.composer.render();
  }
}

new CartagoResilienteApp();
