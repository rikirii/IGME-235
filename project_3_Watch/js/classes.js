class Player extends PIXI.Sprite{
    constructor(x =0 , y=0, spritePath) {
        super(app.loader.resources[spritePath].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.5);
        this.x = x;
        this.y = y;
        this.toAttack = false;
    }
}

class Sprites extends PIXI.Sprite{
    constructor(x =0 , y=0, spritePath) {
        super(app.loader.resources[spritePath].texture);
        this.anchor.set(0.5,0.5);
        this.scale.set(0.5);
        this.x = x;
        this.y = y;
    }
}

class Enemy extends PIXI.Sprite{
    constructor( x= 0, y =0, spritePath){     
        super(app.loader.resources[spritePath].texture)        
        this.anchor.set(0.5,1);
        this.scale.set(0.8);
        this.x = x;
        this.y = y;

        //variables
        this.fwd = getRandomUnitVector();
        this.speed = 50;
        this.isAlive = true;
    }

    // abstract method - declared, but no implementation
	activate(){
	  
	}

    move(dt=1/60){
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.fwd.y * this.speed * dt;
    }

    _chase(dt){
        let t = this.target;
        let amt = 3.0 * dt;
        let newX = cosineInterpolate(this.x, t.x, amt);
        let newY = cosineInterpolate(this.y, t.y, amt);
        this.x = newX;
        this.y = newY;
    }

    reflectX(){
        this.fwd.x *= -1;
    }

    reflectY(){
        this.fwd.y *= -1;
    }

}

class SeekingEnemy extends Enemy{
    activate(target){
        this.target = target;
    }

    move(dt){
        super._chase(dt);
    }
}