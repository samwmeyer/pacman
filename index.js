
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl')

canvas.width = innerWidth
canvas.height = innerHeight

class Boundary {
    static width = 40
    static height = 40
    constructor({ position, image }) {
        this.position = position
        this.width = 40
        this.height = 40
        this.image = image
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}

class Player {
    constructor({ position, velocity }) {
        this.position = position
        this.velocity = velocity
        this.radius = 16
        this.radians = 0.75
        this.openRate = 0.08
        this.rotation = 0
    }

    draw() {
        c.save()
        c.translate(this.position.x, this.position.y)
        c.rotate(this.rotation)
        c.translate(-this.position.x, -this.position.y)
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, this.radians, Math.PI * 2 - this.radians)
        c.lineTo(this.position.x, this.position.y)
        c.fillStyle = 'yellow'
        c.fill()
        c.closePath()
        c.restore()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        if (this.radians < 0 || this.radians > 0.75) {
            this.openRate = -this.openRate
        }

        this.radians += this.openRate
    }
}

class Ghost {
    static speed = 4
    constructor({ position, velocity, color = 'red' }) {
        this.position = position
        this.velocity = velocity
        this.radius = 16
        this.color = color
        this.prevCollisions = []
        this.speed = 4
        this.scared = false
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.scared ? 'blue' : this.color
        c.fill()
        c.closePath()
    }

    update() {
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Pellet {
    constructor({ position }) {
        this.position = position
        this.radius = 3
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'white'
        c.fill()
        c.closePath()
    }
}

class powerUp {
    constructor({ position }) {
        this.position = position
        this.radius = 8
    }

    draw() {
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'lightgreen'
        c.fill()
        c.closePath()
    }
}

const pellets = []
const boundaries = []
const powerUps = []
const ghosts = [
    new Ghost({
        position: {
            x: Boundary.width * 2 + Boundary.width / 2,
            y: Boundary.height * 6 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
    }),
    new Ghost({
        position: {
            x: Boundary.width * 18 + Boundary.width / 2,
            y: Boundary.height * 6 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'aqua'
    }),
    new Ghost({
        position: {
            x: Boundary.width * 10 + Boundary.width / 2,
            y: Boundary.height * 13 + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'hotpink'
    }),
    new Ghost({
        position: {
            x: Boundary.width * 8 + Boundary.width / 2,
            y: Boundary.height + Boundary.height / 2
        },
        velocity: {
            x: Ghost.speed,
            y: 0
        },
        color: 'darkorange'
    })
]
const player = new Player({
    position: {
        x: Boundary.width * 10 + Boundary.width / 2,
        y: Boundary.height * 7 + Boundary.height / 2
    },
    velocity: {
        x: 0,
        y: 0
    }
})
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}

let lastKey = ''
let score = 0

const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', 'p', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'p', '|'],
    ['|', ' ', 'b', ' ', 'T', ' ', 'L', '2', ' ', 'L', 'V', 'R', ' ', '1', 'R', ' ', 'T', ' ', 'b', ' ', '|'],
    ['|', ' ', ' ', ' ', '|', ' ', ' ', '|', ' ', ' ', '|', ' ', ' ', '|', ' ', ' ', '|', ' ', ' ', ' ', '|'],
    ['|', ' ', 'T', ' ', '4', 'R', ' ', '4', 'R', ' ', 'B', ' ', 'L', '3', ' ', 'L', '3', ' ', 'T', ' ', '|'],
    ['|', ' ', 'B', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'B', ' ', '|'],
    ['|', ' ', ' ', ' ', 'b', ' ', 'L', 'R', ' ', 'L', '-', 'R', ' ', 'L', 'R', ' ', 'b', ' ', ' ', ' ', '|'],
    ['|', ' ', 'b', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'b', ' ', '|'],
    ['|', ' ', ' ', ' ', 'L', 'R', ' ', 'b', ' ', 'L', 'V', 'R', ' ', 'b', ' ', 'L', 'R', ' ', ' ', ' ', '|'],
    ['|', ' ', 'T', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'B', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'T', ' ', '|'],
    ['|', ' ', 'B', ' ', 'T', ' ', 'L', 'V', 'R', ' ', ' ', ' ', 'L', 'V', 'R', ' ', 'T', ' ', 'B', ' ', '|'],
    ['|', ' ', ' ', ' ', '|', ' ', ' ', '|', ' ', ' ', 'T', ' ', ' ', '|', ' ', ' ', '|', ' ', ' ', ' ', '|'],
    ['|', ' ', 'b', ' ', '4', 'R', ' ', 'B', ' ', 'L', '^', 'R', ' ', 'B', ' ', 'L', '3', ' ', 'b', ' ', '|'],
    ['|', 'p', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'p', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3'],
]

function createImage(src) {
    const image = new Image()
    image.src = src
    return image
}

map.forEach((row, i) => {
    row.forEach((symbol, j) => {
        switch (symbol) {
            case '-':
                boundaries.push(
                    new Boundary({
                        position: {
                            x: Boundary.width * j,
                            y: Boundary.height * i
                        },
                        image: createImage('./pacman_images/pipeHorizontal.png')
                    })
                )
                break
            case '|':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/pipeVertical.png')
                })
            )
            break
            case '1':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/pipeCorner1.png')
                })
            )
            break
            case '2':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/pipeCorner2.png')
                })
            )
            break
            case '3':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/pipeCorner3.png')
                })
            )
            break
            case '4':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/pipeCorner4.png')
                })
            )
            break
            case 'b':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/block.png')
                })
            )
            break
            case 'T':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/capTop.png')
                })
            )
            break
            case 'B':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/capBottom.png')
                })
            )
            break
            case 'R':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/capRight.png')
                })
            )
            break
            case 'L':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/capLeft.png')
                })
            )
            break
            case 'V':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/pipeConnectorBottom.png')
                })
            )
            break
            case '^':
            boundaries.push(
                new Boundary({
                    position: {
                        x: Boundary.width * j,
                        y: Boundary.height * i
                    },
                    image: createImage('./pacman_images/pipeConnectorTop.png')
                })
            )
            break
            case ' ':
            pellets.push(
                new Pellet({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height /2
                    },
                    image: createImage('./pacman_images/capLeft.png')
                })
            )
            break
            case 'p':
            powerUps.push(
                new powerUp({
                    position: {
                        x: Boundary.width * j + Boundary.width / 2,
                        y: Boundary.height * i + Boundary.height /2
                    },
                })
            )
            break
        }
    })
})

function circleCollidesWithRectangle({ circle, rectangle }) {
    const padding = Boundary.width / 2 - circle.radius - 1
    return (
        circle.position.y - circle.radius + circle.velocity.y <= rectangle.position.y + rectangle.height + padding &&
        circle.position.x + circle.radius + circle.velocity.x >= rectangle.position.x - padding &&
        circle.position.y + circle.radius + circle.velocity.y >= rectangle.position.y - padding &&
        circle.position.x - circle.radius + circle.velocity.x <= rectangle.position.x + rectangle.width + padding
    )
}

let animationId
function animate() {
    animationId = requestAnimationFrame(animate)
    c.clearRect(0,0, canvas.width, canvas.height)
    
    if (keys.w.pressed && lastKey === 'w') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {
                        x: 0,
                        y: -4
                    }},
                    rectangle: boundary
                })
            ) {
                player.velocity.y = 0
                break
            } 
            else {
                player.velocity.y = -4
            }
        }
    }
    else if (keys.a.pressed && lastKey === 'a') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {
                        x: -4,
                        y: 0
                    }},
                    rectangle: boundary
                })
            ) {
                player.velocity.x = 0
                break
            } 
            else {
                player.velocity.x = -4
            }
        }
    }
    else if (keys.s.pressed && lastKey === 's') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {
                        x: 0,
                        y: 4
                    }},
                    rectangle: boundary
                })
            ) {
                player.velocity.y = 0
                break
            } 
            else {
                player.velocity.y = 4
            }
        }
    }
    else if (keys.d.pressed && lastKey === 'd') {
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i]
            if (
                circleCollidesWithRectangle({
                    circle: {...player, velocity: {
                        x: 4,
                        y: 0
                    }},
                    rectangle: boundary
                })
            ) {
                player.velocity.x = 0
                break
            } 
            else {
                player.velocity.x = 4
            }
        }
    }

    // detect collision between ghosts and player
    for (let i = ghosts.length - 1; 0 <= i; i--) {
        const ghost = ghosts[i]
        if (Math.hypot(ghost.position.x - player.position.x, ghost.position.y - player.position.y) < ghost.radius + player.radius) {
            if (ghost.scared) {
                ghosts.splice(i, 1)
            }
            else {
                cancelAnimationFrame(animationId)
            }
        }
    }
    
    // WIN CONDITION
    if (pellets.length === 0) {
        cancelAnimationFrame(animationId)
        window.location.reload()
    }

    for (let i = powerUps.length - 1; 0 <= i; i--) {
        const powerUp = powerUps[i]
        powerUp.draw()

        if (Math.hypot(powerUp.position.x - player.position.x, powerUp.position.y - player.position.y) < powerUp.radius + player.radius) {
            powerUps.splice(i, 1)
            ghosts.forEach(ghost => {
                ghost.scared = true
                
                setTimeout(() => {
                    ghost.scared = false
                }, 6000)
            })
        }
    }

    for (let i = pellets.length - 1; 0 <= i; i--) {
        const pellet = pellets[i]
        pellet.draw()

        if (Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < pellet.radius + player.radius) {
            pellets.splice(i, 1)
            score += 10
            scoreEl.innerHTML = score
        }
    }
        
    boundaries.forEach((boundary) => {
        boundary.draw()
        
        if (
            circleCollidesWithRectangle({
                circle: player,
                rectangle: boundary
            })
        ) {
            player.velocity.x = 0
            player.velocity.y = 0
        }
    })
    player.update()

    ghosts.forEach(ghost => {
        ghost.update()

        const collisions = []
        boundaries.forEach(boundary => {
            if (
                !collisions.includes('right') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: ghost.speed,
                        y: 0
                    }},
                    rectangle: boundary
                })
            ) {
                collisions.push('right')
            }
            if (
                !collisions.includes('left') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: -ghost.speed,
                        y: 0
                    }},
                    rectangle: boundary
                })
            ) {
                collisions.push('left')
            }
            if (
                !collisions.includes('up') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: 0,
                        y: -ghost.speed
                    }},
                    rectangle: boundary
                })
            ) {
                collisions.push('up')
            }
            if (
                !collisions.includes('down') &&
                circleCollidesWithRectangle({
                    circle: {...ghost, velocity: {
                        x: 0,
                        y: ghost.speed
                    }},
                    rectangle: boundary
                })
            ) {
                collisions.push('down')
            }
        })
        if (collisions.length > ghost.prevCollisions.length) {
            ghost.prevCollisions = collisions
        }
        if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
            if (ghost.velocity.x > 0) {
                ghost.prevCollisions.push('right')
            }
            else if (ghost.velocity.x < 0) {
                ghost.prevCollisions.push('left')
            }
            else if (ghost.velocity.y < 0) {
                ghost.prevCollisions.push('up')
            }
            else if (ghost.velocity.y > 0) {
                ghost.prevCollisions.push('down')
            }
            const pathways = ghost.prevCollisions.filter(collision => {
                return !collisions.includes(collision)
            })
            const direction = pathways[Math.floor(Math.random() * pathways.length)]

            switch (direction) {
                case 'down':
                    ghost.velocity.y = ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'up':
                    ghost.velocity.y = -ghost.speed
                    ghost.velocity.x = 0
                    break
                case 'right':
                    ghost.velocity.y = 0
                    ghost.velocity.x = ghost.speed
                    break
                case 'left':
                    ghost.velocity.y = 0
                    ghost.velocity.x = -ghost.speed
                    break
            }

            ghost.prevCollisions = []
        }
    })

    if (player.velocity.x > 0) {
        player.rotation = 0
    }
    else if (player.velocity.x < 0) {
        player.rotation = Math.PI
    }
    else if (player.velocity.y > 0) {
        player.rotation = Math.PI / 2
    }
    else if (player.velocity.y < 0) {
        player.rotation = Math.PI * 1.5
    }
}

animate()

window.addEventListener('keydown', function(e) {
    if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);

addEventListener('keypress', ({ key }) => {
    if (event.key == 'r') {
        window.location.reload()
    }
})

addEventListener('keydown', ({ key }) => {
    switch (event.key) {
        case 'ArrowUp':
            keys.w.pressed = true 
            lastKey = 'w'
            break
        case 'ArrowLeft':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 'ArrowDown':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'ArrowRight':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})

addEventListener('keyup', ({ key }) => {
    switch (key) {
        case 'ArrowUp':
            keys.w.pressed = false
            break
        case 'ArrowLeft':
            keys.a.pressed = false
            break
        case 'ArrowDown':
            keys.s.pressed = false
            break
        case 'ArrowRight':
            keys.d.pressed = false
            break
    }
})

function restartGame() {
    document.getElementById("restart").innerHTML.addEventListener('click', function() {
        window.location.reload()
        return false;
    })
    window.location.reload()
}

