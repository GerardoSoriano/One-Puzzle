var GraphicsHelper = function(){
    this.renderer = new THREE.WebGLRenderer();
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();

    this.manager = new THREE.LoadingManager(); 
    this.loader = new THREE.OBJLoader(this.manager);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.currentSelection = null;

    this.depthMaterial = null;
    this.normalMaterial = null;
    this.outlineMaterial = null;
    this.cartoonMaterial = null;

    this.depthTexture = null;
    this.normalTexture = null;
    this.outlineTexture = null;
}
GraphicsHelper.prototype.init = function(selector){
    this.container = selector;
    this.width = $(this.container).innerWidth();
    this.height = $(this.container).innerHeight();

    this.renderer.setSize(this.width, this.height, false);
    this.renderer.setClearColor( 0x6bb8e5);
    $(this.container).append(this.renderer.domElement);

    this.camera.fov = 45;
    this.camera.aspect = this.width / this.height;
    this.camera.near = 0.1;
    this.camera.far = 1000;
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    this.camera.updateProjectionMatrix();
    this.scene.add(this.camera)

    this.load();


    /**
     * Plugin de camara.
     *
     * CODIGO:
     *  this.controls = new THREE.PointerLockControls(this.camera);
     *  this.scene.add(this.controls.getObject())
     */
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    this.renderer.render(this.scene, this.camera);
}
GraphicsHelper.prototype.load = function(){
    //#region Plano
    /*let plane_geometry = new THREE.PlaneGeometry(1000,1000,10,10);

    let plane_texture = new THREE.ImageUtils.loadTexture('resources/materials/stone/ground_piled_stone_basecolor.png');
    plane_texture.wrapS = plane_texture.wrapT = THREE.RepeatWrapping;
    plane_texture.repeat.set(10,10);
    
    let plane_bumpmap = new THREE.ImageUtils.loadTexture('resources/materials/stone/ground_piled_stone_height.png');
    plane_bumpmap.wrapS = plane_bumpmap.wrapT = THREE.RepeatWrapping;
    plane_bumpmap.repeat.set(10,10);
    
    let plane_lightmap = new THREE.ImageUtils.loadTexture('resources/materials/stone/ground_piled_stone_roughness.png');
    plane_lightmap.wrapS = plane_lightmap.wrapT = THREE.RepeatWrapping;
    plane_lightmap.repeat.set(10,10);
    
    let plane_material = new THREE.MeshPhongMaterial({
        map: plane_texture,
        bumpMap: plane_bumpmap,
        lightMap: plane_lightmap,
        side: THREE.DoubleSide
    });
    
    this.plane = new THREE.Mesh(plane_geometry, plane_material);
    this.plane.rotation.x = 90 * Math.PI / 180 ;
    this.plane.name = "plano";

    this.scene.add(this.plane);*/
    //#endregion

    //#region Figura
    /*let figure_geometry = new THREE.Geometry();
        
    let figure_vertex = [[2,7,0],[7,2,0],[12,7,0],[12,17,0],[7,12,0],[2,17,0],[2,7,0],
                    [2,7,2],[7,2,2],[12,7,2],[12,17,2],[7,12,2],[2,17,2],[2,7,2]];
    for(let i = 0; i < figure_vertex.length; i++){
        let x = figure_vertex[i][0];
        let y = figure_vertex[i][1];
        let z = figure_vertex[i][2];

        let figure_vector = new THREE.Vector3(x,y,z);
        figure_geometry.vertices.push(figure_vector);
    }

    let figure_material = new THREE.ParticleBasicMaterial({ color: 0xff0000 });
    
    this.figure = new THREE.Line(figure_geometry, figure_material);
    
    this.scene.add(this.figure);*/
    //#endregion

    //#region Luz
    this.ambient = new THREE.AmbientLight( 0x404040, 2 );
    this.scene.add(this.ambient);
    this.light = new THREE.PointLight(0xffffff, 1, 100);
    this.light.position.set(0, 50, 0);
    this.scene.add(this.light);
    //#endregion

    //#region Figuras
    this.cube = new THREE.Mesh( new THREE.CubeGeometry( 5, 5, 5 ), new THREE.MeshLambertMaterial({ color: 0xFFFF00}) );
    this.cube.position.set( 25, 25, 25 );
    this.cube.name = "cubomil";
    this.scene.add( this.cube );
    
    this.sphere = new THREE.Mesh( new THREE.SphereGeometry( 5 ), new THREE.MeshLambertMaterial({ color: 0xFFFF00}) );
    this.sphere.position.set( -25, 25, 25 );
    this.scene.add( this.sphere );
    
    this.icosahedron = new THREE.Mesh( new THREE.IcosahedronGeometry( 5 ), new THREE.MeshLambertMaterial({ color: 0xFFFF00}) );
    this.icosahedron.position.set( 25, 25, -25 );
    this.scene.add( this.icosahedron );
    
    this.torus = new THREE.Mesh( new THREE.TorusGeometry( 5, 3 ), new THREE.MeshLambertMaterial({ color: 0xFFFF00}) );
    this.torus.position.set( -25, 25, -25 );
    this.scene.add( this.torus );
    
    this.cylinder = new THREE.Mesh( new THREE.CylinderGeometry( 5, 5, 5 ), new THREE.MeshLambertMaterial({ color: 0xFFFF00}) );
    this.cylinder.position.set( 25, -25, 25 );
    this.scene.add( this.cylinder );
    
    this.circle = new THREE.Mesh( new THREE.CircleGeometry( 5 ), new THREE.MeshLambertMaterial({ color: 0xFFFF00}) );
    this.circle.position.set( -25, -25, 25 );
    this.scene.add( this.circle );
    
    this.octahedron = new THREE.Mesh( new THREE.OctahedronGeometry( 5 ), new THREE.MeshLambertMaterial({ color: 0xFFFF00}) );
    this.octahedron.position.set( 25, -25, -25 );
    this.scene.add( this.octahedron );
    
    this.torusKnot = new THREE.Mesh( new THREE.TorusKnotGeometry( 5, 1 ), new THREE.MeshLambertMaterial({ color: 0xFFFF00}) );
    this.torusKnot.position.set( -25, -25, -25 );
    this.scene.add( this.torusKnot );
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
}   
GraphicsHelper.prototype.loop = function(){
    this.controls.update();

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