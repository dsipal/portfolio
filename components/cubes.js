import React, { Component } from "react"
import * as THREE from "three"

class Cubes extends Component {
    render() {
        return (
            <canvas id={`animation`} style={{
                width: `100%`,
                position: `relative`,
                margin: `auto`,
            }}>

            </canvas>
        )
    }

    componentDidMount() {
        function onWindowResize() {
            const width = container.offsetWidth

            renderer.setSize(width, width)
        }

        function pastelColor() {
            let r = (Math.round(Math.random() * 127) + 127).toString(16)
            let g = (Math.round(Math.random() * 127) + 127).toString(16)
            let b = (Math.round(Math.random() * 127) + 127).toString(16)
            return `#` + r + g + b
        }

        function genCube(amount) {
            for (let i = 0; i < amount; i++) {
                let cube = new THREE.Mesh(
                    new THREE.BoxGeometry(1, 1, 1),
                    new THREE.MeshBasicMaterial({
                        color: pastelColor(),
                        transparent: true,
                        opacity: Math.random() * (0.95 - 0.6) + 0.6,
                    }))

                cube.castShadow = true
                cubes.push(cube)

                cube.rotation.x = (60 * i)
                cube.rotation.y = (60 * i)
                scene.add(cubes[i])
                changed[i] = false
            }
        }

        function init() {
            window.addEventListener(`resize`, onWindowResize, false)
            genCube(cubesAmt)
        }

        //main render loop
        function render() {
            requestAnimationFrame(render)

            cubes.map((cube, key) => {
                if (key % 2 == 0) {
                    cube.rotation.y += Math.random() * (0.03 - 0.01) + 0.01
                } else {
                    cube.rotation.x += Math.random() * (0.03 - 0.01) + 0.01
                }
            })

            renderer.render(scene, camera)
        }

        //threejs variables
        const cubesAmt = 3
        let cubes = []
        let changed = []
        const container = document.getElementById(`decor`)
        const scene = new THREE.Scene()
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            canvas: document.getElementById(`animation`),
        })

        const canvas = renderer.domElement
        renderer.setSize(container.offsetWidth, container.offsetWidth)
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
        camera.position.z = 2

        renderer.setClearColor(0x000000, 0)
        init()
        render()
    }
}

export default Cubes