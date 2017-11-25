//import THREE from 'three';

var GraphicsHelper = function () {
    this.renderer = new THREE.WebGLRenderer();
    this.sceneOutline = new THREE.Scene();
    this.sceneNormal = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.clock = new THREE.Clock();
    this.controls = {};

    this.audioLoader = new THREE.AudioLoader();
    this.listener = new THREE.AudioListener();
    this.waterSound = new THREE.Audio( this.listener );
    
    this.manager = new THREE.LoadingManager();
    this.mtlLoader = new THREE.MTLLoader(this.manager);
    this.objLoader = new THREE.OBJLoader(this.manager);
    this.textureLoader = new THREE.TextureLoader();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.currentSelection = null;
    this.colliders = [];

    this.outline = new THREE.OutlineEffect(this.renderer);

    this.game = [];
    this.clickCount = 0;
    this.win = false;
}
GraphicsHelper.prototype.init = function (selector) {
    this.container = selector;
    this.width = $(this.container).innerWidth();
    this.height = $(this.container).innerHeight();

    this.renderer.setSize(this.width, this.height, false);
    this.renderer.autoClear = false;
    this.renderer.setClearColor(0x000000);
    $(this.container).append(this.renderer.domElement);

    this.camera.fov = 45;
    this.camera.aspect = this.width / this.height;
    this.camera.near = 0.1;
    this.camera.far = 100000;
    this.camera.updateProjectionMatrix();
    this.camera.add(this.listener)

    this.camera_collider = new THREE.Mesh(new THREE.CubeGeometry(10, 10, 10), new THREE.MeshLambertMaterial({
        color: 0x000000,
        visible: false,
        wireframe: true,
        wireframeLinewidth: 20
    }));
    this.camera_collider.position.set(25, 10, 25)
    this.camera_collider.rotation.y = 45 * Math.PI / 180;
    this.camera_collider.add(this.camera);
    this.camera_collider.isCollision = false;
    this.camera_collider.oldPosition = this.camera_collider.position.clone();
    this.sceneOutline.add(this.camera_collider);
    //this.sceneOutline.add(this.camera)

    this.controls.forward = false;
    this.controls.backward = false;
    this.controls.left = false;
    this.controls.right = false;
    this.controls.turnLeft = false;
    this.controls.turnRight = false;

    this.game.push(false)
    this.game.push(false)
    this.game.push(false);

    this.load();

    //this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    //this.renderer.render(this.sceneOutline, this.camera);
}
GraphicsHelper.prototype.load = function () {
    //#region Variables

    let radian = Math.PI / 180;

    //#endregion

    //#region Skydome

    let skydome_geometry = new THREE.SphereGeometry(3000, 25, 25);
    let skydome_material = new THREE.ShaderMaterial({
        uniforms: {
            uTexture: {
                type: 't',
                value: this.textureLoader.load('../resources/img/skydome.jpg')
            }
        },
        vertexShader: $('#vsSkydome').text(),
        fragmentShader: $('#fsSkydome').text()
    })
    this.skydome = new THREE.Mesh(skydome_geometry, skydome_material);
    this.skydome.rotation.x = 180 * radian;
    this.skydome.material.side = THREE.BackSide;
    this.skydome.rotation.order = 'XZY';
    this.skydome.renderDepth = 1000.0;
    this.sceneNormal.add(this.skydome);

    //#endregion

    //#region Luz

    this.ambient = new THREE.AmbientLight(0x404040, 2);
    this.sceneOutline.add(this.ambient);

    this.directionalLight = new THREE.DirectionalLight(0xffff55, 1);
    this.directionalLight.position.set(-600, 300, 600);
    this.sceneOutline.add(this.directionalLight);

    //#endregion

    //#region Agua

    let water_normal = new THREE.ImageUtils.loadTexture('../resources/img/nm_water.jpg');
    water_normal.wrapS = water_normal.wrapT = THREE.RepeatWrapping;

    this.water = new THREE.Water(this.outline, this.camera, this.sceneOutline, {
        textureWidth: 256,
        textureHeight: 256,
        waterNormals: water_normal,
        alpha: 0.8,
        sunDirection: this.directionalLight.position.normalize(),
        sunColor: 0xffffff,
        waterColor: 0x4BC5B1,
        betaVersion: 0,
        side: THREE.DoubleSide
    });

    let water_plane = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(6000, 6000, 10, 10),
        this.water.material
    );
    water_plane.position.y = -5
    water_plane.add(this.water);
    water_plane.rotation.x = -Math.PI * 0.5;

    this.sceneOutline.add(water_plane);

    this.audioLoader.load('../resources/audio/waves.wav', (buffer) => {
        this.waterSound.setBuffer(buffer);
        this.waterSound.setLoop(true);
        this.waterSound.setVolume(0.5);
    })

    //#endregion

    //#region Terrenos

    this.objLoader.load('../resources/lowpoly/island/island_1.obj', (obj) => {
        this.island_1 = obj.children[0];
        this.island_1.material = new THREE.MeshLambertMaterial({
            color: 0xA27139
        });
        this.sceneOutline.add(this.island_1);
    })

    this.objLoader.load('../resources/lowpoly/island/island_2.obj', (obj) => {
        this.island_2 = obj.children[0];
        this.island_2.material = new THREE.MeshLambertMaterial({
            map: this.textureLoader.load('../resources/lowpoly/island/island_2.jpg')
        });
        this.island_2.position.x = -97.6;
        this.sceneOutline.add(this.island_2);
    })

    this.objLoader.load('../resources/lowpoly/island/island_3.obj', (obj) => {
        this.island_3 = obj.children[0];
        this.island_3.material = new THREE.MeshLambertMaterial({
            color: 0xA27139
        });
        this.island_3.position.x = -97;
        this.island_3.position.z = -94;
        this.sceneOutline.add(this.island_3);
    })

    //#endregion

    //#region Epígrafos

    this.objLoader.load('../resources/lowpoly/epigraph/epigraph.obj', (obj) => {
        this.epigraph_square = obj.children[0];
        this.epigraph_circle = this.epigraph_square.clone();
        this.epigraph_triangle = this.epigraph_square.clone();
        this.epigraph_hexagon = this.epigraph_square.clone();

        this.epigraph_square.material = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('../resources/lowpoly/epigraph/epigraph_square.jpg')
        });
        this.epigraph_square.position.set(-8.67, 6.28, 12.37);
        this.epigraph_square.rotation.order = 'ZYX';
        this.epigraph_square.rotation.set(-135.44 * radian, 74.95 * radian, -137.31 * radian);

        this.epigraph_circle.material = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('../resources/lowpoly/epigraph/epigraph_circle.jpg')
        });
        this.epigraph_circle.position.set(-123.63, 4.86, -24.29);
        this.epigraph_circle.rotation.order = 'ZYX';
        this.epigraph_circle.rotation.set(-29.255 * radian, 81.821 * radian, -31.13 * radian);

        this.epigraph_triangle.material = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('../resources/lowpoly/epigraph/epigraph_triangle.jpg')
        });
        this.epigraph_triangle.position.set(-78.07, 3.94, -70.99);
        this.epigraph_triangle.rotation.order = 'ZYX';
        this.epigraph_triangle.rotation.set(-8.97 * radian, -2.31 * radian, -8.02 * radian);

        this.epigraph_hexagon.material = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('../resources/lowpoly/epigraph/epigraph_hexagon.jpg')
        });
        this.epigraph_hexagon.position.set(-117.73, 5.69, -71.01);
        this.epigraph_hexagon.rotation.order = 'ZYX';
        this.epigraph_hexagon.rotation.set(-3.32 * radian, 5.92 * radian, 4.31 * radian);

        this.sceneOutline.add(this.epigraph_square);
        this.sceneOutline.add(this.epigraph_circle);
        this.sceneOutline.add(this.epigraph_triangle);
        this.sceneOutline.add(this.epigraph_hexagon);
    });

    //#endregion

    //#region Puentes

    this.objLoader.load('../resources/lowpoly/bridge/bridge.obj', (obj) => {
        this.bridge_1 = obj.children[0];
        this.bridge_1.material = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('../resources/lowpoly/bridge/bridge.JPG', (texture) => {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                texture.offset.set(0, 0);
                texture.repeat.set(10, 10);
            })
        })
        obj.children[1].material = new THREE.MeshPhongMaterial({
            color: 0x220f03
        });
        this.bridge_1.add(obj.children[1])
        this.bridge_2 = this.bridge_1.clone();

        //-9 to -50 in X
        this.bridge_1.position.set(-9, -1.7, -16);
        //-8.5 to -48 in Z
        this.bridge_2.position.set(-85, -1.7, -8.5);
        this.bridge_2.rotation.y = -90 * radian;

        this.sceneOutline.add(this.bridge_1);
        this.sceneOutline.add(this.bridge_2);
    });

    //#endregion

    //#region Botones

    this.objLoader.load('../resources/lowpoly/button/btn_table.obj', (obj) => {
        //#region Variables 

        this.btn_table = null;

        let btn_base_count = [],
            btn_count = [];

        let rgx_table = new RegExp('^_btn_table+$');
        let rgx_base = new RegExp('^_btn_table+ +_btn_base_[0-3]_[0-3]+$');
        let rgx_btn = new RegExp('^_btn_table+ +_btn_base_[0-3]_[0-3]+ +_btn_[0-3]_[0-3]+$');

        //#endregion

        //#region Materiales

        let mat_orange = new THREE.MeshPhongMaterial({
            color: 0xff1200
        });
        let mat_brown = new THREE.MeshPhongMaterial({
            color: 0x3f1e07
        });
        let mat_yellow = new THREE.MeshPhongMaterial({
            color: 0xfff800
        });

        //#endregion

        //#region Asignación de materiales

        $.each(obj.children, (index, value) => {
            if (rgx_table.test(value.name)) {
                this.btn_table = value;
                this.btn_table.material = mat_orange;
            } else if (rgx_base.test(value.name)) {
                value.name = value.name.split(" ").pop();
                value.material = mat_brown;

                btn_base_count.push(value);
            } else if (rgx_btn.test(value.name)) {
                value.name = value.name.split(" ").pop()
                value.material = mat_yellow;

                btn_count.push(value);
            }
        })

        //#endregion

        //#region Jerarquia

        $.each(btn_base_count, (index, value) => {
            value.add(btn_count[index]);

            this.btn_table.add(value);
        })

        //#endregion

        //#region Creación de colliders

        let collider = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1), new THREE.MeshLambertMaterial({
            color: 0x000000,
            visible: false,
            wireframe: true
        }))
        collider.rotation.order = 'ZYX';
        collider.rotation.set(60 * radian, 105 * radian, -15 * radian);

        let btn_0_0 = collider.clone(),
            btn_1_0 = collider.clone(),
            btn_2_0 = collider.clone(),
            btn_3_0 = collider.clone(),
            btn_0_1 = collider.clone(),
            btn_1_1 = collider.clone(),
            btn_2_1 = collider.clone(),
            btn_3_1 = collider.clone(),
            btn_0_2 = collider.clone(),
            btn_1_2 = collider.clone(),
            btn_2_2 = collider.clone(),
            btn_3_2 = collider.clone(),
            btn_0_3 = collider.clone(),
            btn_1_3 = collider.clone(),
            btn_2_3 = collider.clone(),
            btn_3_3 = collider.clone();

        btn_0_0.name = 'btn_0_0';
        btn_0_0.isDown = false;
        btn_1_0.name = 'btn_1_0';
        btn_1_0.isDown = false;
        btn_2_0.name = 'btn_2_0';
        btn_2_0.isDown = false;
        btn_3_0.name = 'btn_3_0';
        btn_3_0.isDown = false;
        btn_0_1.name = 'btn_0_1';
        btn_0_1.isDown = false;
        btn_1_1.name = 'btn_1_1';
        btn_1_1.isDown = false;
        btn_2_1.name = 'btn_2_1';
        btn_2_1.isDown = false;
        btn_3_1.name = 'btn_3_1';
        btn_3_1.isDown = false;
        btn_0_2.name = 'btn_0_2';
        btn_0_2.isDown = false;
        btn_1_2.name = 'btn_1_2';
        btn_1_2.isDown = false;
        btn_2_2.name = 'btn_2_2';
        btn_2_2.isDown = false;
        btn_3_2.name = 'btn_3_2';
        btn_3_2.isDown = false;
        btn_0_3.name = 'btn_0_3';
        btn_0_3.isDown = false;
        btn_1_3.name = 'btn_1_3';
        btn_1_3.isDown = false;
        btn_2_3.name = 'btn_2_3';
        btn_2_3.isDown = false;
        btn_3_3.name = 'btn_3_3';
        btn_3_3.isDown = false;

        btn_0_0.position.set(-94.989, 11.342, 11.643);
        btn_1_0.position.set(-95.239, 11.409, 10.677);
        btn_2_0.position.set(-95.489, 11.476, 9.711);
        btn_3_0.position.set(-95.739, 11.543, 8.745);
        btn_0_1.position.set(-94.746, 10.38, 11.514);
        btn_1_1.position.set(-94.996, 10.447, 10.548);
        btn_2_1.position.set(-95.246, 10.514, 9.582);
        btn_3_1.position.set(-95.496, 10.581, 8.616);
        btn_0_2.position.set(-94.504, 9.419, 11.384);
        btn_1_2.position.set(-94.754, 9.486, 10.418);
        btn_2_2.position.set(-95.004, 9.553, 9.452);
        btn_3_2.position.set(-95.254, 9.62, 8.486);
        btn_0_3.position.set(-94.261, 8.457, 11.255);
        btn_1_3.position.set(-94.511, 8.524, 10.289);
        btn_2_3.position.set(-94.761, 8.591, 9.323);
        btn_3_3.position.set(-95.011, 8.658, 8.357);

        this.sceneOutline.add(btn_0_0);
        this.sceneOutline.add(btn_1_0);
        this.sceneOutline.add(btn_2_0);
        this.sceneOutline.add(btn_3_0);
        this.sceneOutline.add(btn_0_1);
        this.sceneOutline.add(btn_1_1);
        this.sceneOutline.add(btn_2_1);
        this.sceneOutline.add(btn_3_1);
        this.sceneOutline.add(btn_0_2);
        this.sceneOutline.add(btn_1_2);
        this.sceneOutline.add(btn_2_2);
        this.sceneOutline.add(btn_3_2);
        this.sceneOutline.add(btn_0_3);
        this.sceneOutline.add(btn_1_3);
        this.sceneOutline.add(btn_2_3);
        this.sceneOutline.add(btn_3_3);

        //#endregion

        //#region Posicionamiento y dibujado

        this.btn_table.position.set(-95, 10, 10);
        this.btn_table.rotation.order = 'ZYX';
        this.btn_table.rotation.set(60 * radian, 105 * radian, -15 * radian)
        this.sceneOutline.add(this.btn_table);

        //#endregion
    })

    //#endregion

    //#region Columnas

    //Primero creamos nuestro objeto, el contendrá todos las columnas
    this.all_column = {
        square: {
            isComplete: false,
            start: 0,
            end: 0,
            objects: [

            ]
        },
        circle: {
            isComplete: false,
            objects: [

            ]
        },
        triangle: {
            isComplete: false,
            objects: [

            ]
        },
        hexagon: {
            isComplete: false,
            objects: [

            ]
        }
    }

    //Cargamos nuestros modelos
    this.objLoader.load('../resources/lowpoly/column/column.obj', (obj) => {
        //#region Instanciar modelos principales.

        let column_base = obj.children[0];
        let column_complete = column_base.clone();
        column_complete.add(obj.children[1]);
        column_complete.position.y = -7.5;
        let column_half_down = column_base.clone();
        column_half_down.add(obj.children[1]);
        column_half_down.position.y = -4;
        let column_half_up = obj.children[1];

        //#endregion

        //#region Instanciar los materiales

        let column_material_square = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('../resources/lowpoly/column/column_square.jpg')
        });
        let column_material_circle = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('../resources/lowpoly/column/column_circle.jpg')
        });
        let column_material_triangle = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('../resources/lowpoly/column/column_triangle.jpg')
        });
        let column_material_hexagon = new THREE.MeshPhongMaterial({
            map: this.textureLoader.load('../resources/lowpoly/column/column_hexagon.jpg')
        });

        //#endregion

        //#region Crear colliders, asignar propiedad 'animating'

        let cc_s_0 = new THREE.Mesh(new THREE.CubeGeometry(5, 7, 5), new THREE.MeshLambertMaterial({
                color: 0x000000,
                visible: false,
                wireframe: true
            })),
            cc_c_0 = new THREE.Mesh(new THREE.CubeGeometry(5, 14, 5), new THREE.MeshLambertMaterial({
                color: 0x000000,
                visible: false,
                wireframe: true
            }));

        cc_s_0.isAnimating = false;
        cc_c_0.isAnimating = false;

        let cc_c_1 = cc_c_0.clone(),
            cc_t_0 = cc_c_0.clone(),
            cc_t_1 = cc_c_0.clone(),
            cc_t_2 = cc_c_0.clone(),
            cc_h_0 = cc_c_0.clone(),
            cc_h_1 = cc_c_0.clone(),
            cc_h_2 = cc_c_0.clone(),
            cc_h_3 = cc_c_0.clone();

        //#endregion

        //#region Renombrar colliders

        cc_s_0.name = 'cc_s_0';
        cc_c_0.name = 'cc_c_0';
        cc_c_1.name = 'cc_c_1';
        cc_t_0.name = 'cc_t_0';
        cc_t_1.name = 'cc_t_1';
        cc_t_2.name = 'cc_t_2';
        cc_h_0.name = 'cc_h_0';
        cc_h_1.name = 'cc_h_1';
        cc_h_2.name = 'cc_h_2';
        cc_h_3.name = 'cc_h_3';

        //#endregion 

        //#region Asignar propiedades iniciales de rotación

        cc_s_0.currentRot = 180;
        cc_s_0.finalRot = 0;
        cc_c_0.currentRot = 0;
        cc_c_0.finalRot = 180;
        cc_c_1.currentRot = 270;
        cc_c_1.finalRot = 90;
        cc_t_0.currentRot = 180;
        cc_t_0.finalRot = 90;
        cc_t_1.currentRot = 0;
        cc_t_1.finalRot = 270;
        cc_t_2.currentRot = 90;
        cc_t_2.finalRot = 180;
        cc_h_0.currentRot = 270;
        cc_h_0.finalRot = 0;
        cc_h_1.currentRot = 0;
        cc_h_1.finalRot = 270;
        cc_h_2.currentRot = 270;
        cc_h_2.finalRot = 90;
        cc_h_3.currentRot = 90;
        cc_h_3.finalRot = 90;

        //#endregion

        //#region Llenar la variable 'all_column'

        this.all_column.square.objects.push(cc_s_0);
        this.all_column.circle.objects.push(cc_c_0);
        this.all_column.circle.objects.push(cc_c_1);
        this.all_column.triangle.objects.push(cc_t_0);
        this.all_column.triangle.objects.push(cc_t_1);
        this.all_column.triangle.objects.push(cc_t_2);
        this.all_column.hexagon.objects.push(cc_h_0);
        this.all_column.hexagon.objects.push(cc_h_1);
        this.all_column.hexagon.objects.push(cc_h_2);
        this.all_column.hexagon.objects.push(cc_h_3);

        //#endregion

        //#region Agregar a la escena 'outline'

        this.all_column.square.objects.forEach(element => {
            element.add(column_half_down.clone());
            element.children[0].traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = column_material_square;
                }
            })
            element.rotation.y = element.currentRot * radian;
            this.sceneOutline.add(element);
        });
        this.all_column.circle.objects.forEach(element => {
            element.add(column_complete.clone());
            element.children[0].traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = column_material_circle;
                }
            })
            element.rotation.y = element.currentRot * radian;
            this.sceneOutline.add(element);
        });
        this.all_column.triangle.objects.forEach(element => {
            element.add(column_complete.clone());
            element.children[0].traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = column_material_triangle;
                }
            })
            element.rotation.y = element.currentRot * radian;
            this.sceneOutline.add(element);
        });
        this.all_column.hexagon.objects.forEach(element => {
            element.add(column_complete.clone());
            element.children[0].traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material = column_material_hexagon;
                }
            })
            element.rotation.y = element.currentRot * radian;
            this.sceneOutline.add(element);
        });

        //#endregion

        //#region Acomodar columnas

        this.all_column.square.objects[0].position.set(-14, 6, -23);
        this.all_column.circle.objects[0].position.set(14, 8.5, -24);
        this.all_column.circle.objects[1].position.set(-76, 8.5, -79);
        this.all_column.triangle.objects[0].position.set(-4, 8.5, -24)
        this.all_column.triangle.objects[1].position.set(-74, 8.5, 22);
        this.all_column.triangle.objects[2].position.set(-117, 8.5, -104);
        this.all_column.hexagon.objects[0].position.set(5, 8.5, -24);
        this.all_column.hexagon.objects[1].position.set(-74, 8.5, -93);
        this.all_column.hexagon.objects[2].position.set(-115, 8.5, -78);
        this.all_column.hexagon.objects[3].position.set(-117, 8.5, -90);

        //#endregion

        //#region Apendizar palanca a la primer columna

        this.objLoader.load('../resources/lowpoly/lever/lever.obj', (obj) => {
            this.all_column.square.objects[0].add(obj);
            obj.children[1].rotation.x = -45 * Math.PI / 180;
            obj.position.z = 1.8;
            obj.position.y = 2.3;
            this.lever_collider = new THREE.Mesh(new THREE.CubeGeometry(2.5, 2.5, 1), new THREE.MeshLambertMaterial({
                color: 0x000000,
                visible: false,
                wireframe: true
            }))
            this.lever_collider.position.set(-14, 8.3, -20)
            this.lever_collider.name = 'lever';
            this.lever_collider.isActivate = false;
            this.sceneOutline.add(this.lever_collider)
        })

        //#endregion

        //#region Escenografía restante

        column_half_up.material = column_material_square;
        column_half_up.position.set(-10, -1, -23);
        column_half_up.rotation.order = 'ZYX';
        column_half_up.rotation.set(0, -90 * radian, 67.028 * radian)
        this.sceneOutline.add(column_half_up);

        //#endregion
    });

    //#endregion

    //#region Door

    this.objLoader.load('../resources/lowpoly/door/door.obj', (obj) => {
        this.door = obj.children[0];
        this.door.material = new THREE.MeshPhongMaterial({
            color: 0x220f03
        });
        this.door.position.set(-78, 7, -111)
        this.door.rotation.order = 'ZYX';
        this.door.rotation.set(0, -73 * Math.PI / 180, 0);
        this.sceneOutline.add(this.door);
    })

    //#endregion

    //#region Particulas

    this.particle_count = 500;
    this.particles = new THREE.Geometry();
    this.particle_material = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.5,
        map: this.textureLoader.load('../resources/img/particle.png'),
        blending: THREE.AdditiveBlending,
        transparent: true,
    });

    for (let i = 0; i < this.particle_count; i++) {
        let px = Math.random() * 8 - 4,
            py = Math.random() * 10 - 5,
            pz = Math.random() * 3 - 1.5,
            particle = new THREE.Vector3(px, py, pz);

        particle.velocity = new THREE.Vector3(0, -Math.random(), 0);

        this.particles.vertices.push(particle);
    }

    this.particleSystem = new THREE.Points(this.particles, this.particle_material);
    this.particleSystem.position.set(-78, 7, -111)
    this.particleSystem.rotation.order = 'ZYX';
    this.particleSystem.rotation.set(0, -73 * Math.PI / 180, 0);
    this.particleSystem.sortParticles = true;
    this.particleSystem.draw = true;

    //#endregion

    //#region Colisiones de escenario

    /*let first = new THREE.Mesh(new THREE.CubeGeometry(70, 10, 70), new THREE.MeshLambertMaterial({
        color: 0xFF0000,
        wireframe: true
    }));
    first.rotation.x = 90 * radian;
    this.colliders.push(first);
    this.sceneOutline.add(first);*/


    //#endregion
}
GraphicsHelper.prototype.loop = function () {
    let time = this.clock.getElapsedTime();
    let delta = this.clock.getDelta();

    //checamos si el juego termino
    if(this.game[0] && this.game[1] && this.game[2]){
        if (this.particleSystem.draw == true) {
            this.sceneNormal.add(this.particleSystem);
            this.particleSystem.draw = false;
        }
        let pCount = this.particle_count;
        while (pCount--) {
            let particle = this.particles.vertices[pCount];

            if (particle.y < -5) {
                particle.y = 5;
                particle.velocity.y = 0;
            } else {
                particle.velocity.y -= Math.random() * .01;
                particle.y += particle.velocity.y;
            }

            this.particleSystem.geometry.verticesNeedUpdate = true;
        }

        this.win = true;
    }

    this.skydome.rotation.y += (2 * Math.PI) / (24 * 60 * 60);
    this.water.material.uniforms.time.value += 1.0 / 60.0;

    rotatePillar(this.all_column.square, 0);
    rotatePillar(this.all_column.circle, 0);
    rotatePillar(this.all_column.circle, 1);
    rotatePillar(this.all_column.triangle, 0);
    rotatePillar(this.all_column.triangle, 1);
    rotatePillar(this.all_column.triangle, 2);
    rotatePillar(this.all_column.hexagon, 0);
    rotatePillar(this.all_column.hexagon, 1);
    rotatePillar(this.all_column.hexagon, 2);
    rotatePillar(this.all_column.hexagon, 3);

    if (this.all_column.square.objects[0].currentRot == this.all_column.square.objects[0].finalRot) {
        this.all_column.square.isComplete = true;
    } else {
        this.all_column.square.isComplete = false;
    }
    if (this.all_column.circle.objects[0].currentRot == this.all_column.circle.objects[0].finalRot &&
        this.all_column.circle.objects[1].currentRot == this.all_column.circle.objects[1].finalRot) {
        this.all_column.circle.isComplete = true;
    } else {
        this.all_column.circle.isComplete = false;
    }
    if (this.all_column.triangle.objects[0].currentRot == this.all_column.triangle.objects[0].finalRot &&
        this.all_column.triangle.objects[1].currentRot == this.all_column.triangle.objects[1].finalRot &&
        this.all_column.triangle.objects[2].currentRot == this.all_column.triangle.objects[2].finalRot) {
        this.all_column.triangle.isComplete = true;
    } else {
        this.all_column.triangle.isComplete = false;
    }
    if (this.all_column.hexagon.objects[0].currentRot == this.all_column.hexagon.objects[0].finalRot &&
        this.all_column.hexagon.objects[1].currentRot == this.all_column.hexagon.objects[1].finalRot &&
        this.all_column.hexagon.objects[2].currentRot == this.all_column.hexagon.objects[2].finalRot &&
        this.all_column.hexagon.objects[3].currentRot == this.all_column.hexagon.objects[3].finalRot) {
        this.all_column.hexagon.isComplete = true;
    } else {
        this.all_column.hexagon.isComplete = false;
    }

    //Primer puente
    if (this.lever_collider.isActivate) {
        this.bridge_1.position.x -= 0.5;

        if (this.bridge_1.position.x <= -50)
            this.bridge_1.position.x = -50;

        this.game[0] = true;
    } else {
        this.bridge_1.position.x += 0.5;

        if (this.bridge_1.position.x >= -9)
            this.bridge_1.position.x = -9;

        this.game[0] = false;
    }

    //Segundo puente
    if (this.sceneOutline.getObjectByName('btn_0_0').isDown == true &&
        this.sceneOutline.getObjectByName('btn_1_0').isDown == false &&
        this.sceneOutline.getObjectByName('btn_2_0').isDown == false &&
        this.sceneOutline.getObjectByName('btn_3_0').isDown == true &&
        this.sceneOutline.getObjectByName('btn_0_1').isDown == true &&
        this.sceneOutline.getObjectByName('btn_1_1').isDown == true &&
        this.sceneOutline.getObjectByName('btn_2_1').isDown == true &&
        this.sceneOutline.getObjectByName('btn_3_1').isDown == true &&
        this.sceneOutline.getObjectByName('btn_0_2').isDown == false &&
        this.sceneOutline.getObjectByName('btn_1_2').isDown == true &&
        this.sceneOutline.getObjectByName('btn_2_2').isDown == false &&
        this.sceneOutline.getObjectByName('btn_3_2').isDown == true &&
        this.sceneOutline.getObjectByName('btn_0_3').isDown == false &&
        this.sceneOutline.getObjectByName('btn_1_3').isDown == true &&
        this.sceneOutline.getObjectByName('btn_2_3').isDown == false &&
        this.sceneOutline.getObjectByName('btn_3_3').isDown == false) {

        this.bridge_2.position.z -= 0.5;

        if (this.bridge_2.position.z <= -48)
            this.bridge_2.position.z = -48;
        
        this.game[1] = true;
    } else {
        this.bridge_2.position.z += 0.5;

        if (this.bridge_2.position.z >= -8.5)
            this.bridge_2.position.z = -8.5;

        this.game[1] = false;
    }

    //Columnas
    if (this.all_column.square.isComplete == true &&
        this.all_column.circle.isComplete == true &&
        this.all_column.triangle.isComplete == true &&
        this.all_column.hexagon.isComplete == true) {
        this.game[2] = true;
    }else{
        this.game[2] = false;
    }

    /*if(!this.camera.isCollision)
        this.camera_collider.oldPosition = this.camera_collider.position.clone();*/
    cameraUpdate(this.controls, this.camera_collider)
    //checkCameraCollision(this.camera_collider, this.colliders);

    this.display();
}
GraphicsHelper.prototype.display = function () {
    //this.controls.update();
    this.water.render();
    this.renderer.clear();
    this.renderer.clearDepth();
    this.outline.render(this.sceneOutline, this.camera);
    this.renderer.render(this.sceneNormal, this.camera);
}
GraphicsHelper.prototype.onMouseMove = function (e) {
    this.mouse.x = (e.clientX / this.width) * 2 - 1;
    this.mouse.y = -((e.clientY - $('#header').innerHeight()) / this.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    let intersects = this.raycaster.intersectObjects(this.sceneOutline.children);

    this.currentSelection = (intersects.length > 0) ? intersects[0] : null;
}
GraphicsHelper.prototype.onWindowResize = function (e) {
    this.width = $(this.container).innerWidth();
    this.height = $(this.container).innerHeight();
    this.renderer.setSize(this.width, this.height, false);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
}
GraphicsHelper.prototype.onClick = function (e) {
    if (this.currentSelection) {
        let pillar = null;
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
            case "cc_s_0":
                pillar = this.currentSelection.object;
                pillar.isAnimating = true;
                this.all_column.square.start = pillar.currentRot;
                this.all_column.square.end = pillar.currentRot + 90;
                console.log(pillar)
                break;
            case "cc_c_0":
            case "cc_c_1":
                pillar = this.currentSelection.object;
                pillar.isAnimating = true;
                this.all_column.circle.start = pillar.currentRot;
                this.all_column.circle.end = pillar.currentRot + 90;
                console.log(pillar)
                break;
            case "cc_t_0":
            case "cc_t_1":
            case "cc_t_2":
                pillar = this.currentSelection.object;
                pillar.isAnimating = true;
                this.all_column.triangle.start = pillar.currentRot;
                this.all_column.triangle.end = pillar.currentRot + 90;
                console.log(pillar)
                break;
            case "cc_h_0":
            case "cc_h_1":
            case "cc_h_2":
            case "cc_h_3":
                pillar = this.currentSelection.object;
                pillar.isAnimating = true;
                this.all_column.hexagon.start = pillar.currentRot;
                this.all_column.hexagon.end = pillar.currentRot + 90;
                console.log(pillar)
                break;
            case 'btn_0_0':
            case 'btn_1_0':
            case 'btn_2_0':
            case 'btn_3_0':
            case 'btn_0_1':
            case 'btn_1_1':
            case 'btn_2_1':
            case 'btn_3_1':
            case 'btn_0_2':
            case 'btn_1_2':
            case 'btn_2_2':
            case 'btn_3_2':
            case 'btn_0_3':
            case 'btn_1_3':
            case 'btn_2_3':
            case 'btn_3_3':
                button = this.currentSelection.object;
                button.isDown = !button.isDown;
                toggleButton(button, this.sceneOutline);
                break;
            case 'lever':
                if (this.all_column.square.isComplete == true) {
                    let collider = this.currentSelection.object,
                        lever = this.sceneOutline.getObjectByName('_lever_base _lever');
                    collider.isActivate = !collider.isActivate;
                    console.log(collider);

                    lever.rotation.x *= -1;
                }
                break;
            default:
                break;
        }
        this.clickCount += 1;
    }
}
GraphicsHelper.prototype.checkCenterDot = function () {
    this.mouse.x = 0
    this.mouse.y = 0

    this.raycaster.setFromCamera(this.mouse, this.camera);
    let intersects = this.raycaster.intersectObjects(this.sceneOutline.children);

    this.currentSelection = (intersects.length > 0) ? intersects[0] : null;
}
GraphicsHelper.prototype.onKeyDown = function (e) {
    switch (e.which) {
        case 87: //w
            this.controls.forward = true;
            break;
        case 65: //a
            this.controls.left = true;
            break;
        case 83: //s
            this.controls.backward = true;
            break;
        case 68: //d
            this.controls.right = true;
            break;
        case 37: //<-
            this.controls.turnLeft = true;
            break;
        case 39: //->        
            this.controls.turnRight = true;
            break;
    }
}
GraphicsHelper.prototype.onKeyUp = function (e) {
    switch (e.which) {
        case 87: //w
            this.controls.forward = false;
            break;
        case 65: //a
            this.controls.left = false;
            break;
        case 83: //s
            this.controls.backward = false;
            break;
        case 68: //d
            this.controls.right = false;
            break;
        case 37: //<-
            this.controls.turnLeft = false;
            break;
        case 39: //->        
            this.controls.turnRight = false;
            break;
    }
}

function rotatePillar(type, number) {
    if (type.objects[number].isAnimating) {
        let pillar = type.objects[number];
        pillar.rotation.y = (type.start * Math.PI / 180);
        type.start += 5;

        let actualRot = pillar.rotation.y * 180 / Math.PI;

        if (actualRot >= type.end) {
            pillar.isAnimating = false
            pillar.currentRot = (actualRot == 360) ? 0 : actualRot;
        }
    }
}

function toggleButton(collider, scene) {
    let button = scene.getObjectByName('_' + collider.name)
    if (collider.isDown) {
        button.position.y = -0.15
    } else {
        button.position.y = 0
    }
}

function cameraUpdate(controls, camera) {
    if (controls.forward) {
        camera.translateZ(-1);
    }
    if (controls.left) {
        camera.translateX(-1)
    }
    if (controls.backward) {
        camera.translateZ(1);
    }
    if (controls.right) {
        camera.translateX(1);
    }
    if (controls.turnLeft) {
        camera.rotateY(1 * Math.PI / 180);
    }
    if (controls.turnRight) {
        camera.rotateY(-1 * Math.PI / 180);
    }
}

function checkCameraCollision(camera, colliders) {
    for (let vertexIndex = 0; vertexIndex < camera.geometry.vertices.length; vertexIndex++) {
        let localVertex = camera.geometry.vertices[vertexIndex].clone();
        let globalVertex = localVertex.applyMatrix4(camera.matrix);
        let directionVector = globalVertex.sub(camera.position);

        let ray = new THREE.Raycaster(camera.position, directionVector.clone().normalize());
        let collisionResults = ray.intersectObjects(colliders);
        if (collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()) {
            camera.isCollision = true;
            camera.position = camera.oldPosition;
        } else {
            camera.isCollision = false;
        }
    }
}