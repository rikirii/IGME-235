// http://paulbourke.net/miscellaneous/interpolation/

// we use this to interpolate the ship towards the mouse position
function lerp(start, end, amt) {
    return start * (1 - amt) + amt * end;
}

// we didn't use this one
function cosineInterpolate(y1, y2, amt) {
    let amt2 = (1 - Math.cos(amt * Math.PI)) / 2;
    return (y1 * (1 - amt2)) + (y2 * amt2);
}

// we use this to keep the ship on the screen
function clamp(val, min, max) {
    return val < min ? min : (val > max ? max : val);
}

// bounding box collision detection - it compares PIXI.Rectangles
function rectsIntersect(a, b) {
    let ab = a.getBounds();
    let bb = b.getBounds();
    return ab.x + ab.width > bb.x && ab.x < bb.x + bb.width && ab.y + ab.height > bb.y && ab.y < bb.y + bb.height;
}

// these 2 helpers are used by classes.js
function getRandomUnitVector() {
    let x = getRandom(-1, 1);
    let y = getRandom(-1, 1);
    let length = Math.sqrt(x * x + y * y);
    if (length == 0) { // very unlikely
        x = 1; // point right
        y = 0;
        length = 1;
    } else {
        x /= length;
        y /= length;
    }

    return { x: x, y: y };
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}


function checkingScore(newScore)
{
    if (scoreBoard.length == 0 )
    {
        
        return true;
    }
    else
    {
        let a = false;

        for (let i = 0; i < scoreBoard.length; i++)
        {
            //checks if this score is smaller than the new score
            if (scoreBoard[i][1] < newScore)
            {
                a = true;
                //no need to check the other scores. just break this loop
                break;
            }

        }

        return a;
    }
}

// scoreboard should be in [[name, score], [name, score]] format
function setNewScore(playerName, newScore){

    // this checks for if there is nothing in the scoreboard yet.
    // no need for loop. just push it
    if (scoreBoard.length == 0)
    {
        let a = [playerName, newScore];

        scoreBoard.push(a);

        return true;
    }

    // if there is something in the scoreBoard
    // if so: do below
    // cut off before the point of where the newScore is bigger than the currently checked score
    // concat afterwards
    else if (scoreBoard.length > 0){
        for (let i = 0; i <scoreBoard.length; i++)
        {
            //checks if this score is smaller than the new score
            if (scoreBoard[i][1] < newScore)
            {
                let right = scoreBoard.splice(i, scoreBoard.length -i);
                scoreBoard.push( [playerName, newScore] );
                scoreBoard = scoreBoard.concat(right);

                //no need to check the other scores. just break this loop
                break;
            }

        }

        //trim it. only the top 3
        if (scoreBoard.length > 3) {
            scoreBoard.splice(3, scoreBoard.length - 3);

            //if this conditional activate, that means there is a new high score
            //return true here
            return true;
        }
        else
        {
            //return false, because nothing happened.
            return false;
        }

        
    }
    // for WHATEVER reason that just happened, just stop. false to break loop in main.js
    else
    {
        return false;
    }

    
}

