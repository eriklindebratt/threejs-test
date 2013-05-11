var toggleLoadingIndicator = function(show) {
  show = !!show;
  var loaderEls = document.querySelectorAll(".js-loading-indicator");
  for (var i = 0; i < loaderEls.length; i++) {
    if (loaderEls[i].style.display === "none" || show)
      loaderEls[i].style.display = "block";
    else
      loaderEls[i].style.display = "none";
  }
};

var init = function() {
  document.querySelector(".js-intro").style.display = "none";
  toggleLoadingIndicator(true);
  setTimeout(function() {
    init3D();
  }, 100);
};

var init3D = function() {
  var getMousePos = function(canvas, e) {
    var rect = canvas.getBoundingClientRect();

    var
      x = e.clientX,//x = e.movementX || e.webkitMovementX || e.clientX,
      y = e.clientY;//e.movementY || e.webkitMovementY || e.clientY;

    //console.log("%d;%d", x, y);
    return {
      x: x - rect.left,
      y: y - rect.top
    };
  };

  // set the scene size
  var
    WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    mousePos = { x: null, y: null },
    factor = { x: null, y: null },
    stars = [];

  // set some camera attributes
  var cameraOpts = {
    angle: 45,
    aspect: WIDTH / HEIGHT,
    near: 0.1,
    far: 10000,
    position: {
      x: 0,
      y: 0,
      z: 1200
    }
  };

  // create a WebGL renderer, camera
  // and a scene
  var renderer = new THREE.WebGLRenderer();
  var camera = new THREE.PerspectiveCamera(
    cameraOpts.angle,
    cameraOpts.aspect,
    cameraOpts.near,
    cameraOpts.far
  );

  var scene = new THREE.Scene();

  // add the camera to the scene
  scene.add(camera);

  // the camera starts at 0,0,0
  // so pull it back
  camera.position.z = cameraOpts.position.z;

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  document.body.appendChild(renderer.domElement);

  // set up the sphere vars
  var
    radius = 30,
    segments = 15,
    rings = 90;

  // create the obj's material
  var sphereMaterial = new THREE.MeshLambertMaterial({
    color: 0xCCCC00
  });

  // create a new mesh with
  // sphere geometry - we will cover
  // the sphereMaterial next!
  var sphere = new THREE.Mesh(
    new THREE.TorusKnotGeometry(
      radius,
      segments,
      rings
    ),
    sphereMaterial
  );

  // add the sphere to the scene
  scene.add(sphere);


  // add the "stars"
  for (var i = 0; i < 1000; i++) {
    var material = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF
    });
    var star = new THREE.Mesh(
      new THREE.SphereGeometry(2, 15, 30),
      material
    );
    star.position.x = Math.random() * WIDTH - WIDTH/2;
    star.position.y = Math.random() * HEIGHT - HEIGHT/2;
    star.position.z = Math.random() * cameraOpts.position.z;
    stars.push(star);
    scene.add(star);
  }

  // create a point light
  var pointLight = new THREE.PointLight(0xFFFFFF);

  // set its position
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 300;

  // add to the scene
  scene.add(pointLight);

  /**************************************
   * RENDER
   **************************************/
  var render = function() {
    sphere.position.z -= 2;

    sphere.rotation.x += 0.02;
    sphere.rotation.y += 0.02;
    sphere.rotation.z += 0.02;

    pointLight.position.x = 10 + 100*factor.x;//mousePos.x;
    pointLight.position.y = 50 + 100*factor.y;//mousePos.y;

    //camera.position.x = camera.position.x * factor.x;
    //camera.position.y = HEIGHT/2 - mousePos.y;
    camera.position.z += factor.y/50;//= cameraOpts.position.z - 400*factor.x;

    camera.rotation.x += factor.y/50;
    camera.rotation.y += factor.x/50;
    //camera.rotation.y = 0.3 * factor.x;

    for (var i = 0; i < stars.length; i++) {
      stars[i].position.z += 3;
      if (stars[i].position.z > camera.position.z+200)
        stars[i].position.z -= (1000 + Math.random() * 500);

      stars[i].opacity = 0.5;//if (stars[i].position.z < camera.position.z - 1500
    }

    renderer.render(scene, camera);
  };
  /**************************************/

  document.addEventListener("mousemove", function(e) {
    console.log("e: ", e);
    mousePos = getMousePos(e.target, e);
    factor = {
      x: (0.5 - mousePos.x / WIDTH) / 0.5,
      y: (0.5 - mousePos.y / HEIGHT) / 0.5
    };

    //console.log("%d;%d | %f;%f", mousePos.x, mousePos.y, factor.x, factor.y);
  }, false);

  document.addEventListener("mousewheel", function(e) {
    e.preventDefault();
    camera.position.z += e.wheelDelta / 10;
  }, false);

  document.addEventListener("keydown", function(e) {
    switch (e.keyCode) {
      case 87:  // W
        e.preventDefault();
        camera.position.z -= 10;
        break;
      case 83:  // S
        e.preventDefault();
        camera.position.z += 10;
        break;
      case 65:  // A
        e.preventDefault();
        camera.position.x -= 20;
        break;
      case 68:  // D
        e.preventDefault();
        camera.position.x += 20;
        break;
    }
  }, false);

  document.addEventListener("resize", function(e) {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;

    scene.setSize(WIDTH, HEIGHT);

    renderer.setSize(WIDTH, HEIGHT);

    renderer.domElement.width = WIDTH;
    renderer.domElement.height = HEIGHT;
  }, false);

  toggleLoadingIndicator(false);

  //document.body.requestPointerLock = document.body.requestPointerLock    ||
                                     //document.body.mozRequestPointerLock ||
                                     //document.body.webkitRequestPointerLock;
  //document.body.requestPointerLock();

  // render loop
  (function animLoop(){
    requestAnimationFrame(animLoop);
    render();
  })();
};

