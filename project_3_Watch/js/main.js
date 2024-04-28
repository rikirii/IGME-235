"use strict";

const app = new PIXI.Application({
    width: 1024,
    height: 768
});
document.body.appendChild(app.view);

// constants
const sceneWidth = app.view.width;
const sceneHeight = app.view.height

// app.loader.add([
//     "assets/uninfected.png",
//     "assets/attack_ready.png",
//     "assets/attack_cd.png",
//     "assets/enemy.png"
// ]);
// app.loader.onProgress.add(e => {console.log(`progress=${e.progress}`) });
// app.loader.onComplete.add(setup);
// app.loader.load();


// <!------ local storage, save leaderboard ------!>
let scoreBoard = [];

const prefix = "ry5665";
let listID = "ry5665-score-board";

window.onload = (e) => {
    let items = localStorage.getItem(listID);
    if (items != null){
        scoreBoard = JSON.parse(items);
        console.log(scoreBoard);
    }

    
}
// <!------ end ------!>


//let stage
let stage;

// game variables
let startScene, leaderboardScene;
let gameScene, player, scoreLabel, hpLabel,startSound, attackSound, lowHPSound, hitSound;
let setNewScoreScene;
let gameOverScene, gameOverScoreLabel;

//sound id
let startSoundID;
let attackSoundID;
let lowHPSoundID;
let hitSoundID;

let mousePosition;

let enemyList = [];
let score = 0;

//unfortunately won't be used
//let life = 3;

let hp = 100;
let speed = 2.0;
let attackRange;
let attackAnimation = 0.5;
let attackCD;
let toAttack = false;

let gameStart = false;
let paused = false;


// start label
let startLabel1, startLabel2;

// leader board label
let score1;

let checkScoreStatus = false;
let doneCheckingScore = false;
let haveNewScore = false;

let userPrompt;
let userName;


// important, stores keys
let keys={

}


function setup(){
    stage = app.stage;
    
    // #1 - Create the `start` scene
    startScene = new PIXI.Container();
    stage.addChild(startScene);

    leaderboardScene = new PIXI.Container();
    leaderboardScene.visible = false;
    stage.addChild(leaderboardScene);

    // #2 - Create the main `game` scene and make it invisible
    gameScene = new PIXI.Container();
    gameScene.visible = false;
    stage.addChild(gameScene);

    // #3 - Create the `gameOver` scene and make it invisible
    setNewScoreScene = new PIXI.Container();
    setNewScoreScene.visible = false;
    stage.addChild(setNewScoreScene);

    gameOverScene = new PIXI.Container();
    gameOverScene.visible = false;
    stage.addChild(gameOverScene);

    userPrompt = document.querySelector("#prompt");
    userPrompt.style.display = "none";

    // #4 - Create labels for all 3 scenes
    creatLabelsAndButtons();
	
	// #5 - Create ship
    player = new Sprites(sceneWidth/2,sceneHeight/2,"assets/uninfected.png");
    gameScene.addChild(player);

    attackRange = new Sprites(sceneWidth/2,sceneHeight/2,"assets/attack_ready.png");
    attackRange.visible = false;
    gameScene.addChild(attackRange);

    attackCD = new Sprites(sceneWidth/2,sceneHeight/2,"assets/attack_cd.png");
    attackCD.visible = false;
    gameScene.addChild(attackCD);

    
    	
	// #6 - Load Sounds
	startSound = new Howl({
        src: ['assets/sound/power_outage.wav']
    });

    attackSound = new Howl({
        src: ['assets/sound/sword_sound.wav'],
        volume: 0.3
    });

    lowHPSound = new Howl({
        src: ['assets/sound/heartbeat.wav'],
        loop: true,
        volume: 2
    });

    hitSound = new Howl({
        src: ['assets/sound/hurt_sound.wav']
        
    });


	// #7 - Load sprite sheet
	//playerSpreadSheet = loadSpriteSheet();

	// #8 - Start update loop
    app.ticker.add(gameLoop);
    app.ticker.add(checkNewHighScore);

	// #9 - Start listening for click events on the canvas
	window.addEventListener("keydown", keysDown);
    window.addEventListener("keyup", keysUp);

    window.addEventListener("blur", pause);
    window.addEventListener("focus", unPause);
    
    app.view.onclick = attack;
    
    mousePosition = app.renderer.plugins.interaction.mouse.global;

	// Now our `startScene` is visible
	// Clicking the button calls startGame()
}

function pause(){
    if (startSoundID != null && startSoundID != "")
    {
        if (startSound.playing(startSoundID)){
            startSound.pause();
        }
    }
    if (lowHPSoundID != null && lowHPSoundID != "")
    {
        if (lowHPSound.playing(lowHPSoundID)){
            lowHPSound.pause();
        }
    }
    

    paused = true;
}

function unPause(){
    if (startSoundID != null && startSoundID != "")
    {
        startSound.play(startSoundID);
    }
    if (lowHPSoundID != null && lowHPSoundID != "")
    {
        lowHPSound.play(lowHPSoundID);
    }
    paused = false;
}

function keysDown(e){
    keys[e.keyCode] = true;
}

function keysUp(e){
    keys[e.keyCode] = false;
}

function creatLabelsAndButtons(){

    

    // 1 - set up 'startScene'
    // 1A - make top start label
    let startLabel1 = new PIXI.Text("Watch");
    startLabel1.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 96,
        fontFamily: "Indie Flower",
        stroke: 0xFF0000,
        strokeThickness: 6
    });

    startLabel1.x = (sceneWidth/2);
    startLabel1.y = (sceneHeight/2)/2;
    startLabel1.anchor.set(0.5,0.5);
    startScene.addChild(startLabel1);

    // 1B - make middle start label
    let startLabel2 = new PIXI.Text("Come...Play...");
    startLabel2.style = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 32,
        fontFamily: "Gruppo",
        fontStyle: "italic",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    startLabel2.x = 185;
    startLabel2.y = 300;
    startScene.addChild(startLabel2);
    

    let buttonStyle = new PIXI.TextStyle({
        fill: 0xFF0000,
        fontSize: 40,
        fontFamily: "Press Start 2P"
    });

    // start screen buttons
    let startButton = new PIXI.Text("With ME");
    startButton.style = buttonStyle;
    startButton.x = 80;
    startButton.y = sceneHeight - 100;
    startButton.interactive = true;
    startButton.buttonMode = true;
    startButton.on("pointerup", startGame); //starts game when button is pressed
    startButton.on('pointerover', e => e.target.alpha = 0.7);
    startButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScene.addChild(startButton);

    buttonStyle = new PIXI.TextStyle({
        fill: 0x386E93,
        fontSize: 40,
        fontFamily: "Press Start 2P"
    });
    
    let leaderBoard = new PIXI.Text("Leaderboard");
    leaderBoard.style = buttonStyle;
    leaderBoard.x = startButton.x + startButton.width + 200;
    leaderBoard.y = startButton.y;
    leaderBoard.interactive = true;
    leaderBoard.buttonMode = true;
    leaderBoard.on("pointerup", showLeaderboard); //starts game when button is pressed
    leaderBoard.on('pointerover', e => e.target.alpha = 0.7);
    leaderBoard.on('pointerout', e => e.currentTarget.alpha = 1.0);
    startScene.addChild(leaderBoard);

    const backGround = new PIXI.Graphics();
    backGround.beginFill(0x05314F);
    backGround.drawRect(0,0,app.view.width, app.view.height);
    leaderboardScene.addChild(backGround);

    buttonStyle = new PIXI.TextStyle({
        fill: 0x83AE26,
        fontSize: 30,
        fontFamily: "Press Start 2P"
    });

    //back button (can be universal if needed)
    let backButton = new PIXI.Text("BACK");
    backButton.style = buttonStyle;
    backButton.x = 10;
    backButton.y = 10;
    backButton.interactive = true;
    backButton.buttonMode = true;
    backButton.on("pointerup", showStartScene); //starts game when button is pressed
    backButton.on('pointerover', e => e.target.alpha = 0.7);
    backButton.on('pointerout', e => e.currentTarget.alpha = 1.0);
    leaderboardScene.addChild(backButton);
    

    

    // <!------ leaderboard scoring------!>
    let textStyle = new PIXI.TextStyle({
        fill: 0x40CBB0,
        fontSize: 40,
        fontFamily: "Press Start 2P",
    });

    let scoreTitle = new PIXI.Text("Score");
    scoreTitle.style = textStyle;
    scoreTitle.x = sceneWidth/2 - scoreTitle.width/2;
    scoreTitle.y = sceneHeight/2 - 300;
    leaderboardScene.addChild(scoreTitle);

    textStyle = new PIXI.TextStyle({
        fill: 0x40CBB0,
        fontSize: 40,
        fontFamily: "Playfair Display",
    });

    score1 = new PIXI.Text();
    score1.style = textStyle;
    score1.x = sceneWidth/2 - 100;
    score1.y = sceneHeight/2 - 150;
    leaderboardScene.addChild(score1);



    

    // <!------ end ------!>

    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 18,
        fontFamily: "Futura",
        stroke: 0xFF0000,
        strokeThickness: 4
    });

    //in game labels
    scoreLabel = new PIXI.Text();
    scoreLabel.style = textStyle;
    scoreLabel.x = 5;
    scoreLabel.y = 5;
    gameScene.addChild(scoreLabel);
    increaseScoreBy(0);

    hpLabel = new PIXI.Text();
    hpLabel.style = textStyle;
    hpLabel.x = 5;
    hpLabel.y = 26;
    gameScene.addChild(hpLabel);
    decreaseLifeBy(0);


    // hp label was originally used to display what keys are pressed
    //showKeys(keys);

    textStyle = new PIXI.TextStyle({
        fill: 0x40CBB0,
        fontSize: 40,
        fontFamily: "Press Start 2P",
    });

    /// new high score scene
    let newHighScoreLabel = new PIXI.Text("Congrats! High Score\nEnter your name\nin the text box\ndown below");
    newHighScoreLabel.style = textStyle;
    newHighScoreLabel.x = (sceneWidth/2) - newHighScoreLabel.width / 2;
    newHighScoreLabel.y = sceneHeight / 2 - newHighScoreLabel.height / 2
    setNewScoreScene.addChild(newHighScoreLabel);


    // Game Over screen
    let gameOverText = new PIXI.Text("Game Over!\n");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 70,
        fontFamily: "Indie Flower",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverText.style = textStyle;
    gameOverText.anchor.set(0.5,0.5);
    gameOverText.x = sceneWidth/2;
    gameOverText.y = sceneHeight/2 - 160;
    gameOverScene.addChild(gameOverText);

    gameOverScoreLabel = new PIXI.Text("Your Final Score: ");
    textStyle = new PIXI.TextStyle({
        fill: 0xFFFFFF,
        fontSize: 35,
        fontFamily: "Gruppo",
        stroke: 0xFF0000,
        strokeThickness: 6
    });
    gameOverScoreLabel.style = textStyle;
    gameOverScoreLabel.x = 140;
    gameOverScoreLabel.y = sceneHeight/2 + 50;
    gameOverScene.addChild(gameOverScoreLabel);



    // 3B - make "play again?" button
    let playAgainButton = new PIXI.Text("Play Again?");
    playAgainButton.style = buttonStyle;
    playAgainButton.x = 150;
    playAgainButton.y = sceneHeight - 100;
    playAgainButton.interactive = true;
    playAgainButton.buttonMode = true;
    playAgainButton.on("pointerup", startGame); // startGame is a function reference
    playAgainButton.on('pointerover', e => e.target.alpha = 0.7); // concise arrow function with no brackets
    playAgainButton.on('pointerout', e => e.currentTarget.alpha = 1.0); // ditto
    gameOverScene.addChild(playAgainButton);

    let toStartScene = new PIXI.Text("Start Menu");
    toStartScene.style = buttonStyle;
    toStartScene.x = 10;
    toStartScene.y = 10;
    toStartScene.interactive = true;
    toStartScene.buttonMode = true;
    toStartScene.on("pointerup", showStartScene); //starts game when button is pressed
    toStartScene.on('pointerover', e => e.target.alpha = 0.7);
    toStartScene.on('pointerout', e => e.currentTarget.alpha = 1.0);
    gameOverScene.addChild(toStartScene);
}


// SHOW START SCENE
function showStartScene(){
    startScene.visible = true;
    leaderboardScene.visible = false;
    setNewScoreScene.visible = false;
    gameScene.visible = false;
    gameOverScene.visible = false;
    
}

// SHOW LEADERBOARD
function showLeaderboard(){
    startScene.visible = false;
    leaderboardScene.visible = true;
    setNewScoreScene.visible = false;
    gameScene.visible = false;
    gameOverScene.visible = false;
    
    // scoreboard should be in [[name, score], [name, score]] format
    //checks to see if there is anything to use
    if (scoreBoard.length > 0)
    {
        score1.text = "";

        for (let i = 0; i< scoreBoard.length; i++)
        {
            score1.text += `${i+1}. ${scoreBoard[i][0]}:  ${scoreBoard[i][1]}`;
            if (i != scoreBoard.length-1)
            {
                score1.text += "\n\n\n";
            }
        }
    }
}

// START THE GAME
function startGame(){
    startScene.visible = false;
    leaderboardScene.visible = false;
    setNewScoreScene.visible = false;
    gameOverScene.visible = false;
    gameScene.visible = true;

    score = 0;
    hp = 100;
    increaseScoreBy(0);
    decreaseLifeBy(0);

    paused = false;
    gameStart = true;

    startSoundID = startSound.play();
}


// ============================== IN GAME FUNCTIONS ==============================================

//show what keys are currently pressed
// function showKeys(value){

//     hpLabel.text = JSON.stringify(value);
// }

function increaseScoreBy(value){
    score += value;
    scoreLabel.text = `Score   ${score}`;
}

function decreaseLifeBy(value){
    hp -= value;
    hp = parseInt(hp);
    hpLabel.text = `HP     ${hp}%`;
}


function rotateToPoint(x,y,mousex, mousey){
    let dx = mousex - x;
    let dy = mousey-y;
    let angle = Math.atan2(dy,dx) + 30;
    return angle;
    
}

function attack(){
    if (gameStart && !paused){
        player.toAttack = true;
        attackSound.play();//play sound effects
    }
}

function createEnemy(numEnemies){
    for(let i=0;i<numEnemies;i++){
        let enemy = new SeekingEnemy(0,0,"assets/enemy.png");
        enemy.x = Math.random() * (sceneWidth - enemy.width) + 25;
        enemy.y = Math.random() * (sceneWidth - enemy.height) + 25;
        if (enemy.x < (player.x + 50) && enemy.x > (player.x-50) ){
            enemy.x = sceneWidth + enemy.width;
        }

        if (enemy.y < (player.y+ 50 + enemy.height) && enemy.y > (player.y-50 - enemy.height))
        {
            enemy.y = sceneHeight + enemy.height;
        }
        
        
        enemy.speed = 500;
        enemy.activate(player);
        enemyList.push(enemy);
        gameScene.addChild(enemy);
    }
}


// ============================== GAMELOOP ==============================================
function gameLoop(){
	if (paused || !gameStart) {
        if (keys["87"]){
            keys["87"] =false;
        }
    
        // a key pressed
        if (keys["65"]){
            keys["65"] =false;
        }
    
        // s key pressed
        if (keys["83"]){
            keys["83"] =false;
        }
    
        // d key pressed
        if (keys["68"]){
            keys["68"] =false;
        }
        return;
    } // keep this commented out for now
	
    //showKeys(keys);

	// #1 - Calculate "delta time"
	let dt = 1/app.ticker.FPS;
    if (dt > 1/12) dt=1/12;
	
	// #2 - Move player

    player.rotation = rotateToPoint(mousePosition.x, mousePosition.y, player.x, player.y);
    

    if (!player.toAttack){
        attackCD.visible = false;
        attackRange.visible = true;

        attackRange.x = player.x + Math.cos(player.rotation+30)*50;
        attackRange.y = player.y + Math.sin(player.rotation+30)*50;
        attackRange.rotation = rotateToPoint(player.x, player.y, attackRange.x, attackRange.y)-60;
    }
    else
    {
        attackRange.visible = false;
        attackCD.visible = true;

        attackCD.x = player.x + Math.cos(player.rotation+30)*50;
        attackCD.y = player.y + Math.sin(player.rotation+30)*50;
        attackCD.rotation = rotateToPoint(player.x, player.y, attackCD.x, attackCD.y)-60;

        if (attackAnimation <= 0){
            player.toAttack = false;
            attackAnimation = 0.5;
        }
        else
        {
            attackAnimation -= 1* dt;
        }
        
    }

    // w key pressed
    if (keys["87"]){
        player.y -= (speed);
    }

    // a key pressed
    if (keys["65"]){
        player.x -= (speed);
    }

    // s key pressed
    if (keys["83"]){
        player.y += (speed);
    }

    // d key pressed
    if (keys["68"]){
        player.x += (speed);
    }

    

    let amt = 6 * dt; //at 60FPS would move about 10% of distance per update

    // lerp (linear interpolate) the x & y values with lerp()
    let newX = lerp(player.x, player.x, amt);
    let newY = lerp(player.y, player.y, amt);

    // keep the ship on the screen with clamp()
    let w2 = player.width/2;
    let h2 = player.height/2;
    player.x = clamp(newX, 0+w2, sceneWidth-w2);
    player.y = clamp(newY, 0+h2, sceneHeight-h2);
	
	
    for (let enemy of enemyList){
        enemy.move(dt);
        if(enemy.x <= enemy.radius || enemy.x >= sceneWidth-enemy.radius){
            enemy.reflectX();
            enemy.move(dt);
        }

        if (enemy.y <= enemy.radius || enemy.y >= sceneHeight-enemy.radius){
            enemy.reflectY();
            enemy.move(dt);
        }
    }
	
	// #5 - Check for Collisions
	for (let enemy of enemyList){

        // attack range and enemy
        if (rectsIntersect(enemy, attackCD) && player.toAttack ){
            
            gameScene.removeChild(enemy);
            enemy.isAlive = false;
            increaseScoreBy(1);
        }

        //player and enemy
        if (enemy.isAlive && rectsIntersect(enemy, player) )
        {
            hitSound.play(); //play sound effects
            gameScene.removeChild(enemy);
            enemy.isAlive = false;
            decreaseLifeBy(20);
        }

    }
    
    
	// #6 - Now do some clean up
	enemyList = enemyList.filter( enemy => enemy.isAlive);
	
	// #7 - Is game over?
    if (hp <= 50 && hp > 0)
    {
        if (!lowHPSound.playing()){
            lowHPSoundID = lowHPSound.play();
        }
    }
	else if (hp <= 0){
        lowHPSound.stop();
        //clear sound id
        startSoundID = "";
        lowHPSoundID = "";

        //your dead. make score checking status true;
        checkScoreStatus = true;
        doneCheckingScore = false;
        
        //do this 
        checkNewHighScore();
        return; // return here so we skip #8 below
    }
	
	// #8 - random enemy based on current enemy and time
    if (enemyList.length == 0){
        let chance = Math.floor(Math.random() * 10);
        let numEnemy = Math.floor(Math.random() * 100);
        if (chance <= 3)
        {
            createEnemy(numEnemy);
        }
        else
        {
            createEnemy(1);
        }

    }
 
}

//check to see if there is a new high score.
function checkNewHighScore(){    
    if (!checkScoreStatus) return; //If I'm not checking score status

    //disable game scene NOW!
    gameScene.visible = false;
    gameStart = false;

    // make sure game over scene is NOT visible
    gameOverScene.visible = false;

    
    // if i'm checking score.
    if (!doneCheckingScore) {

        //check for new score.
        if (checkingScore(score)) {
            //if new score, set newscorescene to true
            
            haveNewScore = true;
            userPrompt.style.display = "block";
        }

        //either no new score, or I'm done checking
        doneCheckingScore = true;


    }
    //if I'm done checking score and have a new score to record, get user name
    else if (haveNewScore) {

        setNewScoreScene.visible = true;

        if (userName != null && userName != "") {
            setNewScore(userName, score)
            haveNewScore = false;
        }
    }
    else {
        //If no new score or I'm done getting user name, call gameover screen.
        checkScoreStatus = false;
        end();
    }
    

    
}

function enterName(){
    userName = document.querySelector("#name").value;
}


function end(){
    gameStart = false;
    
    gameOverScoreLabel.text = "Your Final Score: " + score;

    

    // clear out level
    enemyList.forEach(c=>gameScene.removeChild(c)); //concise arrow function with no brackets and no return
    enemyList = [];


    gameOverScene.visible = true;
    gameScene.visible = false;
    setNewScoreScene.visible = false;
    
    document.querySelector("#name").value = "";
    userPrompt.style.display = "none";
    userName = "";

    // save to local storage
    let items = JSON.stringify(scoreBoard);
    localStorage.setItem(listID, items);
    
}
