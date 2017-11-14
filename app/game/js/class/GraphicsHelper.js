//import THREE from 'three';

var GraphicsHelper = function(){
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.clock = new THREE.Clock();

    this.manager = new THREE.LoadingManager(); 
    this.objLoader = new THREE.OBJLoader(this.manager);
    this.textureLoader = new THREE.TextureLoader();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.currentSelection = null;
}
GraphicsHelper.prototype.init = function(selector){
    this.container = selector;
    this.width = $(this.container).innerWidth();
    this.height = $(this.container).innerHeight();

    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setClearColor( 0x000000 );
    $(this.container).append(this.renderer.domElement);

    this.camera.fov = 45;
    this.camera.aspect = this.width / this.height;
    this.camera.near = 0.1;
    this.camera.far = 100000;
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    this.camera.updateProjectionMatrix();
    this.scene.add(this.camera)

    this.load();

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    this.renderer.render(this.scene, this.camera);
}
GraphicsHelper.prototype.load = function(){
    //#region Skydome

    let skydome_geometry = new THREE.SphereGeometry(3000, 25, 25);
    let skydome_material = new THREE.ShaderMaterial({
        uniforms: {
            texture: {
                type: 't',
                value: this.textureLoader.load('../resources/img/skydome.jpg')
            }
        },
        vertexShader: $('#vsSkydome').text(),
        fragmentShader: $('#fsSkydome').text()
    })
    this.skydome = new THREE.Mesh(skydome_geometry,skydome_material);
    this.skydome.material.side = THREE.BackSide;
    this.skydome.rotation.order = 'XZY';
    this.skydome.renderDepth  = 1000.0;
    this.scene.add(this.skydome);

    //#endregion

    //#region Luz

    this.ambient = new THREE.AmbientLight( 0x404040, 2 );
    this.scene.add(this.ambient);

    this.pointLight = new THREE.PointLight(0xffffff, 1, 100);
    this.pointLight.position.set(0, 50, 0);
    this.scene.add(this.pointLight);

    this.directionalLight = new THREE.DirectionalLight(0xffff55, 1);
    this.directionalLight.position.set(-600, 300, 600);
    this.scene.add(this.directionalLight);

    //#endregion

    //#region Modelo
    // let column_texture_square = new THREE.ImageUtils.loadTexture('resources/lowpoly/column/column_square.jpg');
    // column_texture_square.wrapS = column_texture_square.wrapT = THREE.RepeatWrapping;

    // this.myShader = new THREE.ShaderMaterial( {
    //     uniforms: {
    //         uLightPos: {
    //             value: this.light.position
    //         },
    //         uColor: {
    //             value: new THREE.Vector4(1, 0, 1, 1)
    //         }
    //     },
    //     vertexShader: document.getElementById( 'vsCelShading' ).textContent,
    //     fragmentShader: document.getElementById( 'fsCelShading' ).textContent
    // } );

    // this.column_collider = new THREE.Mesh( new THREE.CubeGeometry( 5, 14, 5 ), new THREE.MeshLambertMaterial({ color: 0x000000, wireframe: true, visible: true}) );
    // this.column_collider.name = "pillar_triangle_1"

    // this.scene.add(this.column_collider);
    
    // this.loader.load('resources/lowpoly/column/column.obj', (obj) => {
    //     obj.traverse((child) => {
    //         if(child instanceof THREE.Mesh){
    //             child.material = new THREE.MeshLambertMaterial({ color: 0x00FF00})
    //         }
    //     })
    //     this.column_base = obj.children[0];
    //     this.column_complete = obj.children[1];
    //     this.column_half_down = obj.children[2];

    //     this.column_base.add(this.column_complete);
        
    //     this.column_collider.add(this.column_base);
    // })
    //#endregion

    //#region Agua
    let water_normal = new THREE.ImageUtils.loadTexture('../resources/img/nm_water.jpg');
    water_normal.wrapS = water_normal.wrapT = THREE.RepeatWrapping; 

    this.water = new THREE.Water(this.renderer, this.camera, this.scene, {
        textureWidth: 256,
        textureHeight: 256,
        waterNormals: water_normal,
        alpha: 	1.0,
        sunDirection: this.directionalLight.position.normalize(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        betaVersion: 0,
        side: THREE.DoubleSide
    });

    let water_plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(6000, 6000, 10, 10), 
        this.water.material
    );
    water_plane.add(this.water);
    water_plane.rotation.x = - Math.PI * 0.5;
    
    this.scene.add(water_plane);
    //#endregion

    //#region Terrenos
    this.objLoader.load('../resources/lowpoly/island/island_1.obj', (obj) => {
        obj.traverse((child) => {
            if(child instanceof THREE.Mesh){
                child.material = new THREE.MeshLambertMaterial({ color: 0xA27139 });
            }
        })

        this.island_1 = obj.children[0];
        this.scene.add(this.island_1);
    })
    //#endregion
}   
GraphicsHelper.prototype.loop = function(){
    let time = this.clock.getElapsedTime();
    let delta = this.clock.getDelta();

    this.skydome.rotation.y += (2 * Math.PI) / (24 * 60 * 60);
    this.water.material.uniforms.time.value += 1.0 / 60.0;

    this.display();
}
GraphicsHelper.prototype.display = function(){
    this.controls.update();
    this.water.render();
    this.renderer.render(this.scene, this.camera);
}
GraphicsHelper.prototype.onMouseMove = function(e){
    this.mouse.x = (e.clientX / this.width) * 2 - 1;
    this.mouse.y = - ((e.clientY - $('#header').innerHeight()) / this.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    let intersects = this.raycaster.intersectObjects(this.scene.children);

    this.currentSelection = (intersects.length > 0) ? intersects[0]:null;
}
GraphicsHelper.prototype.onWindowResize = function(e){
    this.width = $(this.container).innerWidth();
    this.height = $(this.container).innerHeight();
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
}
GraphicsHelper.prototype.onClick = function(e){
    if(this.currentSelection){
        switch (this.currentSelection.object.name) {
            case "plano":
            this.currentSelection.object.rotation.z += 10 * Math.PI / 180
                break;
            case "pillar1":
            this.currentSelection.object.rotation.y += 10 * Math.PI / 180;
            console.log(this.currentSelection.object.children)
                break;
            case "lever1":
            this.currentSelection.object.children[0].children[0].rotation.x *= -1;
                break;
            default:
                break;
        }
    }
}
GraphicsHelper.prototype.checkCenterDot = function(){
    this.mouse.x = 0
    this.mouse.y = 0

    this.raycaster.setFromCamera(this.mouse, this.camera);
    let intersects = this.raycaster.intersectObjects(this.scene.children);

    this.currentSelection = (intersects.length > 0) ? intersects[0]:null;
}