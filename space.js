class Vector2D {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
		return this;
	}
	subtract(vector, scale) {
		return new Vector2D(vector.x * scale, vector.y * scale)
	}
	multiply(scale) {
		return new Vector2D(this.x * scale, this.y * scale)
	}
	magnitude() {
		return Math.sqrt(this.x ** 2 + this.y ** 2);
	}
	normalise() {
		let mag = this.magnitude()
		this.x /= mag;
		this.y /= mag;
	}
	dot(vector) {
		return this.x * vector.x + this.y * vector.y
	}
}
class Ball {
	color = 'orange'
	collision = true;
	mass = 1;

	constructor(pos, vel, radius, color) {
		this.pos = pos;
		this.vel = vel;
		this.radius = radius;
		this.color = color;

        this.mass = this.radius**2;
	}
	draw() {
		c.fillStyle = this.color;
        c.strokeStyle = 'grey';
		c.beginPath();
		c.arc(this.pos.x, canvas.height - this.pos.y, this.radius, 0, 2 * Math.PI);
		c.fill();
	}
	updatePosition(time) {
		
		const dx = this.vel.x * time;
		const dy = this.vel.y * time;

        let newX = this.pos.x+dx;
        let newY = this.pos.y+dy;

        if (newX-this.radius < 0  || newX+this.radius > width) {
            this.vel.x *= -1;
            
            if (newX-this.radius < 0) this.pos.x = Math.abs(newX-this.radius)+this.radius;
            else if (newX+this.radius > width) this.pos.x = 700 - 2*this.radius - (newX - 700);
        }
        if (newY-this.radius < 0  || newY+this.radius > width) {
            this.vel.y *= -1;
            
            if (newY-this.radius < 0) this.pos.y = Math.abs(newY-this.radius)+this.radius;
            else if (newY+this.radius > width) this.pos.y = 700 - 2*this.radius - (newY - 700);
        }
		
        this.pos.x+=dx;
        this.pos.y+=dy;
	}
	
	isCollision(ball) {
		let distance2 = (this.pos.x - ball.pos.x) ** 2 + (this.pos.y - ball.pos.y) ** 2
		return distance2 <= (this.radius + ball.radius) ** 2 && ball !== this && this.collision;
	}
	collide(ballB) {    
		const unitNormal = new Vector2D((ballB.pos.x - this.pos.x), (ballB.pos.y - this.pos.y));
		unitNormal.normalise();

		const unitTangent = new Vector2D(-unitNormal.y, unitNormal.x);

		const totalMass = this.mass + ballB.mass;

		const v1n = unitNormal.dot(this.vel);
		const v1t = unitTangent.dot(this.vel);
		const v2n = unitNormal.dot(ballB.vel);
		const v2t = unitTangent.dot(ballB.vel);

		const v1nDelta = (v1n * (this.mass - ballB.mass) + 2 * ballB.mass * v2n) / totalMass;
		const v2nDelta = (v2n * (ballB.mass - this.mass) + 2 * this.mass * v1n) / totalMass;



		this.vel = unitNormal.multiply(v1nDelta);
		this.vel.add(unitTangent.multiply(v1t));

		ballB.vel = unitNormal.multiply(v2nDelta);
		this.vel.add(unitTangent.multiply(v2t));


	}
    applyGravity(pos, mass) {
        let direction = new Vector2D((pos.x-this.pos.x), (pos.y-this.pos.y))
        direction = direction.multiply(mass/(direction.magnitude()**2));
      
        this.vel.add(direction);
    }
}

const inputRadius = document.getElementById('radius');
const inputColor = document.getElementById('color');
const canvas = document.getElementById('c');
const c = canvas.getContext('2d');
canvas.width = 700;
canvas.height = 700;
const width = canvas.width;
const height = canvas.height;

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    let x = (e.clientX - rect.left);
    let y = (e.clientY - rect.top);

    let vmax = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight;
    let scale = canvas.width/(vmax*0.5);

    x*=scale;
    y*=scale;
    console.log("test");

    let radius = parseFloat(inputRadius.value); 
    let color = inputColor.value;
    console.log({x:x, y:height-y});
    const ball = new Ball({x: x, y: height-y}, new Vector2D(0, 0), radius, color);  
    balls.push(ball);
});

var elapsedTime = 0;
var timeSinceCall = 0;
var timeSinceFrame = 0;  
const framesPerSecond = 60;

var balls = [];

function init() {
    balls = [
    ];
    main();
}

var game = 0;

function main(time = 0) {
    elapsedTime = (time-timeSinceCall)/1000;
    timeSinceFrame += elapsedTime;

    if (timeSinceFrame >= 1 /framesPerSecond) {
        timeSinceFrame = 0;
        c.fillStyle = '#000';
        c.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < balls.length; i++) {
            balls[i].updatePosition(1/framesPerSecond);
            balls[i].draw();
        }
    
        for (let i = 0; i < balls.length; i++) {
            for (let n = 0; n < balls.length; n++) {
                if (balls[i] == balls[n]) continue;
                balls[n].applyGravity(balls[i].pos, balls[i].mass);
            }
        }
        for (let i = 0; i < balls.length; i++) {
            for (let a = i+1; a < balls.length; a++) {
                if (balls[i].isCollision(balls[a])) balls[i].collide(balls[a]);
            }
        }
    }
    timeSinceCall = time;
    game = window.requestAnimationFrame(main);
}

function distanceSquared(pos1, pos2) {
    return (pos1.x - pos2.x)**2 + (pos1.y - pos2.y)**2
}   
init();

