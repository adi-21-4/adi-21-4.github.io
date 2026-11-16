import * as THREE from './assets/vendor/three.min.js';

const canvas = document.querySelector('#hero-scene');
const frame = canvas?.closest('.scene-frame');
const fallback = frame?.querySelector('.scene-fallback');
const pauseButton = document.querySelector('#scene-toggle');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

if (canvas && frame) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) {
    console.info('3D story map is using its CSS fallback.', error);
  }

  if (renderer) {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(37, 1, .1, 40);
    camera.position.set(0, 0, 6.2);
    const rig = new THREE.Group();
    scene.add(rig);
    const ambientLight = new THREE.AmbientLight(0x98a9c3, 1.25);
    scene.add(ambientLight);
    const key = new THREE.DirectionalLight(0xf5f7ff, 2.5);
    key.position.set(-2.5, 3.5, 4);
    scene.add(key);
    const limeLight = new THREE.PointLight(0xc8ff36, 5, 5, 2);
    limeLight.position.set(.2, .8, 2.2);
    scene.add(limeLight);
    const blueLight = new THREE.PointLight(0x638cff, 4, 4, 2);
    blueLight.position.set(-1.7, -.2, 1.5);
    scene.add(blueLight);

    const themePalette = new Map([[0x172231,0xf1f0e8],[0x080e18,0xd0d5cd],[0x0c121c,0xfffefa],[0x638cff,0x2855d9],[0xc8ff36,0x426f00],[0xcbd8ec,0x3c4654],[0x53657c,0x586473],[0x73e5e0,0x007c79],[0xf2c779,0x8a5b0b],[0x243315,0xdce6c6],[0x19220c,0xc5d0a8],[0x182333,0xe4e8ea],[0x293516,0xd8e2bd],[0x263513,0xc1d1a1],[0x7ebc24,0x567d16],[0x426b13,0xc6d4a9],[0x9dacbf,0x647384],[0x93a5c0,0x5d6e82],[0x0a1019,0xe7e8e4],[0x202a39,0xc4ccd4]]);
    const themeMaterials = [];
    const themeMaterial = (material, lightColor = themePalette.get(material.color.getHex()), lightEmissive = themePalette.get(material.emissive?.getHex())) => {
      material.userData.themeColors = { dark: material.color.getHex(), light: lightColor ?? material.color.getHex() };
      if (material.emissive) material.userData.themeEmissive = { dark: material.emissive.getHex(), light: lightEmissive ?? material.emissive.getHex() };
      themeMaterials.push(material);
      return material;
    };
    const mat = (color, extra = {}) => themeMaterial(new THREE.MeshStandardMaterial({ color, metalness: .34, roughness: .38, ...extra }));
    const basic = (color, options = {}) => themeMaterial(new THREE.MeshBasicMaterial({ color, toneMapped: false, ...options }));
    const dark = mat(0x172231, { metalness: .48, roughness: .32, emissive: 0x080e18, emissiveIntensity: .5 });
    const screenMat = basic(0x0c121c);
    const edgeBlue = basic(0x638cff);
    const edgeLime = basic(0xc8ff36);
    const pale = basic(0xcbd8ec);
    const dim = basic(0x53657c);
    const cyan = basic(0x73e5e0);
    const gold = basic(0xf2c779);

    const addBox = (parent, size, position, material, bevel = 0) => {
      const geometry = new THREE.BoxGeometry(...size);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      parent.add(mesh);
      return mesh;
    };
    const addLine = (parent, points, material, radius = .009) => {
      const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, radius, 6, false), material);
      parent.add(tube);
      return { curve, mesh: tube };
    };

    // Three miniature scenes make the work legible: a student question, connected knowledge, and a usable result.
    const input = new THREE.Group();
    input.position.set(-1.54, .03, .06);
    rig.add(input);
    addBox(input, [.86, 1.03, .12], [0, 0, 0], dark);
    addBox(input, [.76, .92, .018], [0, 0, .067], screenMat);
    addBox(input, [.52, .025, .014], [-.02, .31, .082], edgeBlue);
    addBox(input, [.54, .11, .018], [.055, .12, .085], mat(0x243315, { emissive: 0x19220c, emissiveIntensity: .45 }));
    addBox(input, [.43, .018, .015], [.0, .14, .1], edgeLime);
    addBox(input, [.34, .018, .015], [-.045, .08, .1], pale);
    addBox(input, [.28, .018, .015], [-.075, -.12, .1], dim);
    addBox(input, [.38, .018, .015], [-.025, -.2, .1], dim);
    const questionMark = new THREE.Mesh(new THREE.TorusGeometry(.075, .014, 6, 24, Math.PI * 1.5), edgeLime);
    questionMark.position.set(.22, -.38, .1);
    questionMark.rotation.z = Math.PI * .15;
    input.add(questionMark);
    const qDot = new THREE.Mesh(new THREE.SphereGeometry(.014, 8, 8), edgeLime);
    qDot.position.set(.22, -.49, .1);
    input.add(qDot);

    const output = new THREE.Group();
    output.position.set(1.54, .03, .06);
    rig.add(output);
    addBox(output, [.86, 1.03, .12], [0, 0, 0], dark);
    addBox(output, [.76, .92, .018], [0, 0, .067], screenMat);
    addBox(output, [.51, .025, .014], [-.015, .31, .082], edgeLime);
    const resultRows = [
      { y: .14, color: edgeBlue, width: .49 },
      { y: -.035, color: cyan, width: .39 },
      { y: -.21, color: gold, width: .44 },
    ];
    resultRows.forEach(({ y, color, width }) => {
      addBox(output, [.6, .13, .018], [0, y, .085], mat(0x182333, { roughness: .8 }));
      addBox(output, [.035, .07, .014], [-.25, y, .1], color);
      addBox(output, [width * .55, .014, .012], [.055, y + .02, .102], pale);
      addBox(output, [width * .35, .012, .012], [-.005, y - .025, .102], dim);
    });
    addBox(output, [.52, .035, .018], [0, -.39, .087], mat(0x293516, { emissive: 0x263513, emissiveIntensity: .5 }));

    const graph = new THREE.Group();
    graph.position.set(0, .02, .18);
    rig.add(graph);
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.29, 1), mat(0x7ebc24, { metalness: .48, roughness: .26, emissive: 0x426b13, emissiveIntensity: .72, flatShading: true }));
    graph.add(core);
    const coreRing = new THREE.Mesh(new THREE.TorusGeometry(.39, .008, 5, 80), basic(0xc8ff36, { transparent: true, opacity: .56 }));
    coreRing.rotation.x = .82;
    graph.add(coreRing);
    const graphPoints = [
      new THREE.Vector3(-.52, .48, -.05), new THREE.Vector3(.48, .49, -.04),
      new THREE.Vector3(-.58, -.37, .02), new THREE.Vector3(.55, -.43, -.02),
      new THREE.Vector3(0, .72, -.2), new THREE.Vector3(0, -.7, -.18),
    ];
    const graphNodes = [];
    const graphLines = [];
    graphPoints.forEach((point, index) => {
      const branchCurve = new THREE.QuadraticBezierCurve3(point, point.clone().multiplyScalar(.42), new THREE.Vector3(0, 0, 0));
      const line = new THREE.Mesh(new THREE.TubeGeometry(branchCurve, 22, .006, 5, false), basic(index % 2 ? 0x638cff : 0x9dacbf, { transparent: true, opacity: .38 }));
      graph.add(line);
      const node = new THREE.Mesh(new THREE.SphereGeometry(index > 3 ? .065 : .085, 14, 14), index % 2 ? edgeBlue : pale);
      node.position.copy(point);
      graph.add(node);
      graphNodes.push({ mesh: node, phase: index * .73 });
      graphLines.push(line);
    });

    const routeMaterial = basic(0x93a5c0, { transparent: true, opacity: .48 });
    const routeGlow = basic(0xc8ff36, { transparent: true, opacity: .68 });
    const routeIn = addLine(rig, [[-.96, .03, .23], [-.72, .03, .35], [-.48, .03, .35]], routeMaterial, .009);
    const routeOut = addLine(rig, [[.48, .03, .35], [.72, .03, .35], [.96, .03, .23]], routeMaterial, .009);
    addLine(rig, [[-.96, .03, .23], [-.72, .03, .35], [-.48, .03, .35]], routeGlow, .0025);
    addLine(rig, [[.48, .03, .35], [.72, .03, .35], [.96, .03, .23]], routeGlow, .0025);
    const routes = [routeIn.curve, routeOut.curve];
    const particleGeometry = new THREE.SphereGeometry(.027, 10, 10);
    const particleMaterials = [edgeLime, edgeBlue, cyan, gold];
    const packets = [];
    routes.forEach((curve, routeIndex) => {
      for (let i = 0; i < 3; i += 1) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterials[(i + routeIndex) % particleMaterials.length]);
        rig.add(particle);
        packets.push({ particle, curve, phase: i / 3 + routeIndex * .28, routeIndex });
      }
    });

    // Soft landing plane and technical grid anchor the small objects without spinning the whole composition.
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 3.1), basic(0x0a1019, { transparent: true, opacity: .32 }));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, -1.03, -.4);
    rig.add(ground);
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.58, .035, .62), mat(0x202a39, { metalness: .52, roughness: .42 }));
    base.position.set(0, -.62, -.22);
    rig.add(base);
    const annotations = new Map([...frame.querySelectorAll('[data-stage-label]')].map((el) => [el.dataset.stageLabel, el]));
    const stageAnchors = [
      { id: 'input', object: input, offsetY: -58 },
      { id: 'graph', object: graph, offsetY: -96 },
      { id: 'output', object: output, offsetY: -58 },
    ];
    const projected = new THREE.Vector3();

    let width = 1, height = 1, lastTime = 0, elapsed = 0, visible = true;
    let paused = motionPreference.matches || pauseButton?.getAttribute('aria-pressed') === 'true';
    let goalX = 0, goalY = 0;
    const resize = () => {
      const rect = frame.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      camera.aspect = width / height;
      camera.position.z = width < 420 ? 6.55 : width < 700 ? 6.25 : 5.9;
      rig.scale.setScalar(width < 420 ? .84 : width < 700 ? .92 : 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      positionAnnotations();
      renderer.render(scene, camera);
    };
    const applySceneTheme = () => {
      const light = document.documentElement.dataset.theme === 'light';
      themeMaterials.forEach((material) => {
        const colors = material.userData.themeColors;
        material.color.setHex(light ? colors.light : colors.dark);
        const emissive = material.userData.themeEmissive;
        if (emissive) material.emissive.setHex(light ? 0x000000 : emissive.dark);
      });
      ambientLight.color.setHex(light ? 0x63717e : 0x98a9c3);
      ambientLight.intensity = light ? 1.45 : 1.25;
      key.color.setHex(light ? 0xffffff : 0xf5f7ff);
      key.intensity = light ? 1.35 : 2.5;
      limeLight.color.setHex(light ? 0x426f00 : 0xc8ff36);
      limeLight.intensity = light ? 1.4 : 5;
      blueLight.color.setHex(light ? 0x2855d9 : 0x638cff);
      blueLight.intensity = light ? 1.1 : 4;
      renderer.toneMappingExposure = light ? .94 : 1.12;
      renderer.render(scene, camera);
    };
    const themeObserver = new MutationObserver(applySceneTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const positionAnnotations = () => stageAnchors.forEach(({ id, object, offsetY }) => {
      const annotation = annotations.get(id);
      if (!annotation) return;
      object.getWorldPosition(projected);
      projected.project(camera);
      const x = (projected.x * .5 + .5) * width;
      const y = (-projected.y * .5 + .5) * height + offsetY * Math.min(width / 560, 1.2);
      annotation.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) translate(-50%,-50%)`;
      annotation.style.opacity = projected.z > 1 ? '0' : '1';
    });
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(frame);
    resize();
    applySceneTheme();
    if (fallback) fallback.hidden = true;

    const render = (time = 0) => {
      const dt = Math.min((time - lastTime) / 1000 || 0, .05);
      lastTime = time;
      if (!paused && visible && !document.hidden) {
        elapsed += dt;
        // Deliberately calm product motion: a question enters, crosses a live graph, and resolves into a UI.
        rig.rotation.y += (goalY + Math.sin(elapsed * .23) * .018 - rig.rotation.y) * (1 - Math.exp(-2.4 * dt));
        rig.rotation.x += (goalX + Math.sin(elapsed * .31) * .012 - rig.rotation.x) * (1 - Math.exp(-2.4 * dt));
        graph.rotation.y = Math.sin(elapsed * .38) * .08;
        graph.rotation.x = Math.sin(elapsed * .27) * .035;
        core.rotation.y = elapsed * .16;
        core.rotation.x = Math.sin(elapsed * .55) * .08;
        core.scale.setScalar(1 + Math.sin(elapsed * 1.1) * .025);
        coreRing.material.opacity = .43 + (Math.sin(elapsed * 1.1) + 1) * .12;
        coreRing.rotation.z = elapsed * .14;
        graphNodes.forEach(({ mesh, phase }) => {
          const glow = .85 + (Math.sin(elapsed * 1.8 + phase) + 1) * .35;
          mesh.scale.setScalar(glow);
        });
        packets.forEach(({ particle, curve, phase, routeIndex }) => {
          const progress = (elapsed * .18 + phase) % 1;
          particle.position.copy(curve.getPointAt(progress));
          particle.scale.setScalar(.7 + Math.sin(progress * Math.PI) * .5);
          if (routeIndex === 0) particle.material = progress > .45 ? edgeLime : cyan;
          else particle.material = progress > .45 ? edgeLime : edgeBlue;
        });
        limeLight.intensity = document.documentElement.dataset.theme === 'light'
          ? .9 + Math.sin(elapsed * 1.25) * .12
          : 4.2 + Math.sin(elapsed * 1.25) * .8;

        positionAnnotations();

        renderer.render(scene, camera);
      }
      if (!visible || document.hidden) lastTime = time;
    };
    renderer.render(scene, camera);
    if (!paused) renderer.setAnimationLoop(render);

    frame.addEventListener('pointermove', (event) => {
      if (motionPreference.matches) return;
      const rect = frame.getBoundingClientRect();
      goalY = ((event.clientX - rect.left) / rect.width - .5) * .025;
      goalX = ((event.clientY - rect.top) / rect.height - .5) * -.018;
    }, { passive: true });
    frame.addEventListener('pointerleave', () => { goalX = 0; goalY = 0; }, { passive: true });

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      lastTime = 0;
      renderer.setAnimationLoop(!paused && visible && !document.hidden ? render : null);
    }, { threshold: 0 });
    visibilityObserver.observe(frame);
    const refreshMotion = () => {
      paused = motionPreference.matches || pauseButton?.getAttribute('aria-pressed') === 'true';
      if (pauseButton) {
        const userPaused = pauseButton.getAttribute('aria-pressed') === 'true';
        pauseButton.querySelector('span:last-child').textContent = userPaused ? 'Resume motion' : 'Pause motion';
        pauseButton.setAttribute('aria-label', userPaused ? 'Resume 3D animation' : 'Pause 3D animation');
      }
      renderer.setAnimationLoop(!paused && visible && !document.hidden ? render : null);
      renderer.render(scene, camera);
    };
    pauseButton?.addEventListener('click', () => {
      pauseButton.setAttribute('aria-pressed', String(pauseButton.getAttribute('aria-pressed') !== 'true'));
      refreshMotion();
    });
    motionPreference.addEventListener?.('change', refreshMotion);
    document.addEventListener('visibilitychange', () => {
      lastTime = 0;
      renderer.setAnimationLoop(!paused && visible && !document.hidden ? render : null);
    });

    addEventListener('pagehide', () => {
      renderer.setAnimationLoop(null);
      visibilityObserver.disconnect();
      sizeObserver.disconnect();
      themeObserver.disconnect();
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => {
          for (const key in material) if (material[key]?.isTexture) material[key].dispose();
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.forceContextLoss();
    }, { once: true });
  }
}











// A scroll-linked 3D timeline mirrors the real roles listed in the experience section.
const journeyCanvas = document.querySelector('#journey-scene');
const journeyFrame = journeyCanvas?.closest('.journey-flight');
const careerSection = journeyFrame?.closest('.experience-section');
const journeyFallback = journeyFrame?.querySelector('.journey-fallback');
const journeyStages = [...(journeyFrame?.querySelectorAll('[data-journey-stage]') ?? [])];
const careerEntries = [...(careerSection?.querySelectorAll('.timeline-item') ?? [])];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (journeyCanvas && journeyFrame) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: journeyCanvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch (error) {
    console.info('Career timeline is using its CSS fallback.', error);
  }

  if (renderer) {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.25));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-5, 5, 1.4, -1.4, .1, 30);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
    const rig = new THREE.Group();
    scene.add(rig);
    const ambientLight = new THREE.AmbientLight(0xaab8cb, 1.3);
    scene.add(ambientLight);
    const keyLight = new THREE.DirectionalLight(0xf4f7ff, 2.1);
    keyLight.position.set(-2, 3, 5);
    scene.add(keyLight);
    const limeLight = new THREE.PointLight(0xc8ff36, 2, 5, 2);
    limeLight.position.set(0, .2, 2);
    scene.add(limeLight);

    const themePalette = new Map([[0x152131,0xf2f1e9],[0x080e17,0xd0d5cc],[0x0a111a,0xfffefa],[0xcbd8e8,0x3c4654],[0x64748a,0x5b6673],[0x638cff,0x2855d9],[0xa98cff,0x6840a8],[0x73e5e0,0x007c79],[0xc8ff36,0x426f00],[0x1a2939,0xe2e6e8],[0x899bb3,0x657384],[0x8191a7,0x5c6978],[0x9ccf38,0x547d16],[0x91bb16,0x405f0e]]);
    const themeMaterials = [];
    const themeMaterial = (material, lightColor = themePalette.get(material.color.getHex())) => {
      material.userData.themeColors = { dark: material.color.getHex(), light: lightColor ?? material.color.getHex() };
      if (material.emissive) material.userData.themeEmissive = material.emissive.getHex();
      themeMaterials.push(material);
      return material;
    };
    const basic = (color, opacity = 1) => themeMaterial(new THREE.MeshBasicMaterial({ color, transparent: opacity < 1, opacity, toneMapped: false }));
    const panelMaterial = themeMaterial(new THREE.MeshStandardMaterial({ color: 0x152131, metalness: .4, roughness: .4, emissive: 0x080e17, emissiveIntensity: .34 }));
    const screenMaterial = basic(0x0a111a);
    const pale = basic(0xcbd8e8);
    const dim = basic(0x64748a);
    const blue = basic(0x638cff);
    const violet = basic(0xa98cff);
    const aqua = basic(0x73e5e0);
    const lime = basic(0xc8ff36);
    const addBox = (parent, w, h, d, x, y, z, material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      parent.add(mesh);
      return mesh;
    };

    // Each station is a dimensional cue for a real step in the experience below.
    const stationX = [-4.05, -1.35, 1.35, 4.05];
    const stationY = [-.14, .18, -.04, .28];
    const stationColors = [lime, aqua, violet, blue];
    stationX.forEach((x, index) => {
      const station = new THREE.Group();
      station.position.set(x, stationY[index], 0);
      rig.add(station);
      addBox(station, 1.24, .76, .15, 0, 0, 0, panelMaterial);
      addBox(station, 1.14, .66, .02, 0, 0, .085, screenMaterial);
      addBox(station, .72, .022, .012, 0, .245, .104, stationColors[index]);

      if (index === 0) {
        // Current frontend role: responsive pages assembled from clear blocks.
        addBox(station,.17,.38,.018,-.34,-.01,.12,blue);
        addBox(station,.49,.07,.018,.11,.13,.12,basic(0x1a2939));
        addBox(station,.45,.23,.018,.1,-.08,.12,basic(0x1a2939));
        addBox(station,.2,.12,.018,-.2,-.24,.12,lime);
        addBox(station,.21,.12,.018,.14,-.24,.12,aqua);
      } else if (index === 1) {
        // AI/ML internship: model output and measured signal.
        const heights=[.14,.25,.19,.35,.28];
        heights.forEach((height,bar)=>{
          addBox(station,.075,height,.018,-.29+bar*.14,-.19+height/2,.12,bar%2?aqua:blue);
        });
        const trendPoints=[[-.34,-.03,.14],[-.19,.04,.14],[-.05,.01,.14],[.11,.15,.14],[.3,.1,.14]].map(p=>new THREE.Vector3(...p));
        const trend=new THREE.CatmullRomCurve3(trendPoints);
        station.add(new THREE.Mesh(new THREE.TubeGeometry(trend,32,.008,5,false),lime));
      } else if (index === 2) {
        // GenAI internship: linked knowledge and data.
        const nodes = [[-.3,.04],[.28,.04],[-.2,-.17],[.2,-.17],[0,.16]];
        const lineMaterial = basic(0x899bb3,.62);
        [[0,1],[0,2],[1,3],[2,3],[0,4],[1,4],[4,3]].forEach(([a,b]) => {
          const from=nodes[a],to=nodes[b];
          const curve=new THREE.LineCurve3(new THREE.Vector3(from[0],from[1],.13),new THREE.Vector3(to[0],to[1],.13));
          station.add(new THREE.Mesh(new THREE.TubeGeometry(curve,8,.007,4,false),lineMaterial));
        });
        nodes.forEach((point,nodeIndex)=>{
          const dot=new THREE.Mesh(new THREE.SphereGeometry(nodeIndex === 4 ? .065 : .045,10,10),nodeIndex === 4 ? violet : pale);
          dot.position.set(point[0],point[1],.16);
          station.add(dot);
        });
      } else {
        // Backend workshop: a compact code editor.
        addBox(station,.045,.3,.012,-.43,-.025,.108,blue);
        [-.14,-.045,.05,.145].forEach((y,row)=>{
          addBox(station,[.42,.32,.5,.38][row],.018,.01,-.05+(row%2)*.05,y,.11,row===0?violet:pale);
        });
        addBox(station,.2,.02,.01,.2,-.25,.11,dim);
      }
    });    // A rising rail and marker follow the newest-to-oldest order of the experience list.
    const points=[
      new THREE.Vector3(-4.8,-.58,.25),new THREE.Vector3(-4.05,-.55,.32),
      new THREE.Vector3(-2.7,-.35,.36),new THREE.Vector3(-1.35,-.2,.4),
      new THREE.Vector3(0,.02,.44),new THREE.Vector3(1.35,.13,.4),
      new THREE.Vector3(2.7,.3,.36),new THREE.Vector3(4.05,.43,.32),
      new THREE.Vector3(4.8,.48,.25),
    ];
    const careerPath=new THREE.CatmullRomCurve3(points);
    rig.add(new THREE.Mesh(new THREE.TubeGeometry(careerPath,140,.012,6,false),basic(0x8191a7,.42)));
    rig.add(new THREE.Mesh(new THREE.TubeGeometry(careerPath,140,.0035,5,false),basic(0xc8ff36,.72)));
    const marker=new THREE.Mesh(new THREE.OctahedronGeometry(.105,0),themeMaterial(new THREE.MeshStandardMaterial({color:0xc8ff36,emissive:0x91bb16,emissiveIntensity:1.1,metalness:.32,roughness:.2}),0x426f00));
    rig.add(marker);
    const markerHalo=new THREE.Mesh(new THREE.TorusGeometry(.19,.006,5,32),basic(0xc8ff36,.62));
    rig.add(markerHalo);
    const trail=Array.from({length:5},(_,index)=>{
      const bead=new THREE.Mesh(new THREE.SphereGeometry(.025-index*.003,8,8),basic(0x9ccf38,.66-index*.1));
      rig.add(bead);
      return bead;
    });

    const applyJourneyTheme = () => {
      const light = document.documentElement.dataset.theme === 'light';
      themeMaterials.forEach((material) => {
        const colors = material.userData.themeColors;
        material.color.setHex(light ? colors.light : colors.dark);
        if (material.userData.themeEmissive !== undefined) material.emissive.setHex(light ? 0x000000 : material.userData.themeEmissive);
      });
      ambientLight.color.setHex(light ? 0x687582 : 0xaab8cb);
      ambientLight.intensity = light ? 1.45 : 1.3;
      keyLight.color.setHex(light ? 0xffffff : 0xf4f7ff);
      keyLight.intensity = light ? 1.2 : 2.1;
      limeLight.color.setHex(light ? 0x426f00 : 0xc8ff36);
      limeLight.intensity = light ? .8 : 2;
      renderer.toneMappingExposure = light ? .94 : 1.08;
      renderer.render(scene, camera);
    };
    const journeyThemeObserver = new MutationObserver(applyJourneyTheme);
    journeyThemeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let viewportWidth=1;
    let viewportHeight=1;
    let progress=.5;
    let targetProgress=.5;
    let visible=false;
    let disposed=false;
    let lastTime=0;
    let reduce=reduceMotion.matches;
    const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
    const updateScrollProgress=()=>{
      if(careerEntries.length){
        const focusY=innerHeight*.46;
        const centers=careerEntries.map(entry=>{const rect=entry.getBoundingClientRect();return rect.top+rect.height*.5;});
        const first=centers[0],last=centers[centers.length-1];
        targetProgress=clamp((first-focusY)/(first-last||1),0,1);
        let nearest=0;
        centers.forEach((center,index)=>{if(Math.abs(center-focusY)<Math.abs(centers[nearest]-focusY))nearest=index;});
        journeyStages.forEach((stage,index)=>stage.dataset.active=String(index===nearest));
      }else{
        const rect=careerSection.getBoundingClientRect();
        targetProgress=clamp((innerHeight*.75-rect.top)/(rect.height+innerHeight*.5),0,1);
      }
    };
    const placeMarker=(p)=>{
      const at=clamp(p,.001,.999);
      marker.position.copy(careerPath.getPointAt(at));
      const tangent=careerPath.getTangentAt(at);
      marker.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tangent);
      markerHalo.position.copy(marker.position);
      markerHalo.rotation.set(tangent.y*.65,-tangent.x*.65,at*Math.PI*1.2);
      trail.forEach((bead,index)=>bead.position.copy(careerPath.getPointAt(clamp(at-(index+1)*.022,.001,.999))));

    };
    const resize=()=>{
      const rect=journeyFrame.getBoundingClientRect();
      viewportWidth=Math.max(1,rect.width);
      viewportHeight=Math.max(1,rect.height);
      const small=viewportWidth<600;
      const worldWidth=small?6.25:10.1;
      const aspect=viewportWidth/viewportHeight;
      camera.left=-worldWidth/2;
      camera.right=worldWidth/2;
      camera.top=worldWidth/aspect/2;
      camera.bottom=-camera.top;
      camera.updateProjectionMatrix();
      rig.scale.setScalar(small ? .62 : 1);
      renderer.setSize(viewportWidth,viewportHeight,false);
      placeMarker(reduce ? .5 : progress);
      renderer.render(scene,camera);
    };
    const frameLoop=(time=0)=>{
      if(disposed||!visible||document.hidden||reduce){renderer.setAnimationLoop(null);return;}
      const dt=Math.min((time-lastTime)/1000||0,.05);
      lastTime=time;
      updateScrollProgress();
      progress+=(targetProgress-progress)*(1-Math.exp(-8*dt));
      if(Math.abs(targetProgress-progress)<.001)progress=targetProgress;
      placeMarker(progress);
      marker.rotation.y+=dt*1.4;
      renderer.render(scene,camera);
      if(Math.abs(targetProgress-progress)<.001)renderer.setAnimationLoop(null);
    };
    const startTimeline=()=>{
      if(disposed||reduce||!visible||document.hidden)return;
      updateScrollProgress();
      if(Math.abs(targetProgress-progress)>.001){lastTime=0;renderer.setAnimationLoop(frameLoop);}
    };
    const visibilityObserver=new IntersectionObserver(([entry])=>{
      visible=entry.isIntersecting;
      if(visible)startTimeline();
      else renderer.setAnimationLoop(null);
    },{threshold:0});
    visibilityObserver.observe(careerSection);
    const handleMotionPreference=()=>{
      reduce=reduceMotion.matches;
      renderer.setAnimationLoop(null);
      if(reduce){progress=.5;targetProgress=.5;placeMarker(.5);renderer.render(scene,camera);}
      else startTimeline();
    };
    reduceMotion.addEventListener?.('change',handleMotionPreference);
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden)startTimeline();
      else renderer.setAnimationLoop(null);
    });
    resize();
    applyJourneyTheme();
    if(journeyFallback)journeyFallback.hidden=true;
    if(reduce){progress=.5;placeMarker(.5);renderer.render(scene,camera);}
    addEventListener('resize',resize,{passive:true});
    const handleScroll=()=>{if(!reduce){updateScrollProgress();startTimeline();}};
    addEventListener('scroll',handleScroll,{passive:true});
    document.addEventListener('scroll',handleScroll,{passive:true,capture:true});
    addEventListener('pagehide',()=>{
      disposed=true;
      renderer.setAnimationLoop(null);
      visibilityObserver.disconnect();
      journeyThemeObserver.disconnect();
      removeEventListener('resize',resize);
      removeEventListener('scroll',handleScroll);
      document.removeEventListener('scroll',handleScroll,true);
      scene.traverse(object=>{
        object.geometry?.dispose();
        const materials=Array.isArray(object.material)?object.material:[object.material];
        materials.filter(Boolean).forEach(material=>material.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss();
    },{once:true});
  }
}
