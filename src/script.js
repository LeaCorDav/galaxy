import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

THREE.ColorManagement.enabled = false

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/* ------------------------------ GALAXIA ------------------------------ */
// Array de parametros que el usuario podrá modificar
const parameters = {}
parameters.count = 50000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 5
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = "#ff6030"
parameters.outsideColor = "#1b3984"
parameters.sunScale = 0.17

// Instancia variables para que existan fuera de la funcion generateGalaxy
let geometry = null
let material = null
let points = null
let sun = null


// Funcion para generar una galaxia
const generateGalaxy = () => {
    /* ------------------- Elimina antigua galaxia ------------------- */
    if(points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }
    /* ------------------- Elimina antigua galaxia ------------------- */
    
    /* ------------------- Geometria ------------------- */
    geometry = new THREE.BufferGeometry()

    // Array de valores para las posiciones XYZ
    const positions = new Float32Array(parameters.count * 3)
    
    // Array de valores para los colores RGB
    const colors = new Float32Array(parameters.count * 3)
    // Convierte los colores a RGB
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    // Le da una valor random a cada valor del array
    for(let i = 0; i < parameters.count; i++) {
        /* --------------- POSICION --------------- */
        // Para agrupar valores del array de 3 en 3
        const i3 = i * 3

        // Tamaño de galaxia
        const positionRadius = Math.random() * parameters.radius

        // Angulo de de posicion para los brazos
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2

        // Angulo de retorcido del brazo
        const spinAngle = positionRadius * parameters.spin

        // Randomness de la ubicacion de las particulas
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        positions[i3] = Math.cos(branchAngle + spinAngle) * positionRadius + randomX
        positions[i3 + 1] = 0 + randomY
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * positionRadius + randomZ
        /* --------------- POSICION --------------- */
        
        /* --------------- COLORES --------------- */
        // Color mixeado
        const mixedColors = colorInside.clone()
        mixedColors.lerp(colorOutside, positionRadius / parameters.radius)

        // Setea los valores de RGB
        colors[i3] = mixedColors.r
        colors[i3 + 1] = mixedColors.g
        colors[i3 + 2] = mixedColors.b
        /* --------------- COLORES --------------- */
    }

    // Añade los atributos a la geometria
    geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3)
    )
    geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3)
    )
    /* ------------------- Geometria ------------------- */


    /* ------------------- Material ------------------- */
    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })
    /* ------------------- Material ------------------- */

    // Points
    points = new THREE.Points(geometry, material)
    scene.add(points)
}
generateGalaxy()
/* ------------------------------ GALAXIA ------------------------------ */


/* ------------------------------ SOL ------------------------------ */
const updateSun = () => {
    /* ------------------- Elimina antigua sol ------------------- */
     if(sun !== null) {
        sun.geometry.dispose()
        sun.material.dispose()
        scene.remove(sun)
    }
    /* ------------------- Elimina antigua sol ------------------- */

    // Const para escalado de esfera
    const sunRadius = 1 * parameters.sunScale
    
    // Mesh
    sun = new THREE.Mesh( 
        new THREE.SphereGeometry( sunRadius, 32, 16 ), 
        new THREE.MeshPhysicalMaterial({
            color: "#ffffff",
            transmission: 1,
            opacity: 1,
            metalness: 0,
            roughness: 0,
            ior: 1.5,
            thickness: 2.3,
            attenuationColor: parameters.insideColor,
            attenuationDistance: 0.155,
            specularIntensity: 1,
            specularColor: "#ffffff",
            envMapIntensity: 1,
        }) 
    )
    
    scene.add( sun )
}
updateSun()
/* ------------------------------ SOL ------------------------------ */

/* ------------------------------ GUI ------------------------------ */
gui.add(parameters, "sunScale").min(0.01).max(2).step(0.01).name("Sun Scale").onFinishChange(updateSun)
gui.add(parameters, "count").min(100).max(100000).step(10).onFinishChange(generateGalaxy).name("Stars Number")
gui.add(parameters, "size").min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy).name("Stars Size")
gui.add(parameters, "radius").min(1).max(20).step(0.1).onFinishChange(generateGalaxy).name("Galaxy Size")
gui.add(parameters, "branches").min(2).max(20).step(1).onFinishChange(generateGalaxy).name("Galaxy Branches")
gui.add(parameters, "spin").min(-5).max(5).step(0.1).onFinishChange(generateGalaxy).name("Galaxy Spin")
gui.add(parameters, "randomness").min(0).max(2).step(0.01).onFinishChange(generateGalaxy).name("Stars Randomness")
gui.add(parameters, "randomnessPower").min(1).max(10).step(0.01).onFinishChange(generateGalaxy).name("Stars Near Branch")
gui.addColor(parameters, "insideColor").onFinishChange(generateGalaxy).name("Galaxy Inside Color")
gui.addColor(parameters, "outsideColor").onFinishChange(generateGalaxy).name("Galaxy Outside Color")
/* ------------------------------ GUI ------------------------------ */


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Anima la galaxia
    points.rotation.y = elapsedTime * 0.1
    points.rotation.z = elapsedTime * 0.02

    // Actualiza sol
    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()