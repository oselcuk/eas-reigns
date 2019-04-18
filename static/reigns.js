/* jshint esversion:6 */

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
var cvWidth = canvas.width;
var cvHeight = canvas.height;

var currentCardImage = new Image();
let sessionId = makeid(10);
currentCardImage.onload = () => {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", '/move?data=' + sessionId, true); // true for asynchronous
    xmlHttp.send(null);
    requestAnimationFrame(animate);
};

let cards_data = [
    ["adviser", ["Swipe left or right to make a decision", ["Left", 0, 0, 0], ["Right...", 0, 0, 0]]],
    ["adviser", ["Don't let your money or popularity reach 0. Good luck!", ["Ok...", 0, 0, 0], ["Wait...", 0, 0, 0]]],
    ["economic", ["Some guy is saying he can double our textile production and halve the cost", ["We don't need more textiles or money", -100, 0, 0], ["Invest in the guy's workshop", 50, -0, -50]]],
    ["economic", ["Should we use steam engines to transport goods", ["No, keep having horses pull wagons", -25, 25, 0], ["Yes, let's move some merchandise", 50, -25, -50]]],
    ["economic", ["All the trains going around are scaring the townsfolk", ["Keep the number of trains in check", -25, 25, 0], ["Build walls around tracks", 0, 25, -50]]],
    ["economic", ["Moths seem to be turning black...", ["Maybe we should cut down on coal usage a little", -50, -50, 50], ["So?", 0, 0, 0]]],
    ["economic", ["Should we regulate the number of steam boats?", ["Yes, they might be bad for the fish", -50, -25, 0], ["No, I want to see the rivers filled with them!", 25, 25, -50]]],
    ["economic", ["They found some weird oil while digging for brine in America", ["I don't care unless you can cook with it", 0, -25, 0], ["Invest in oil", 100, 25, -50]]],
    ["economic", ["Guy named Gesner says he invented something called Kerosene", ["We shall turn night into day with it!", 100, 50, -50], ["Ignore him and keep using more expensive whale oil and alcohol", -25, -50, 0]]],
    ["economic", ["People are drinking petrol as medicine, and it seems to be working...", ["That's crazy talk! Have them stop!", 0, -50, 25], ["Bring me a pint too!", 25, 50, -50]]],
    ["economic", ["Oil spills in lakes and rivers are killing fish", ["Regulate oil companies", -50, -50, 100], ["Plenty of fish in the sea", 0, 0, -100]]],
    ["economic", ["Someone figured out how to use gasoline to power cars, should we prefer them over horses?", ["Finally we can stop having horse manure in the streets!", 50, 50, -50], ["But I like horses", -25, -25, 50]]],
    ["economic", ["Our scientists figured out that we can use natural gas instead of just flaring it", ["Finally some good news!", 50, 50, 50], ["Finally some good news!", 50, 50, 50]]],
    ["economic", ["Oil companies are getting pretty big, should we try to split them up?", ["Yes, let's bring some competition", -50, 25, 25], ["I kinda like their \"gifts\" though...", 100, -25, -50]]],
    ["economic", ["Our engineers found a way to enlarge oil wells with hydraulics to extract gas more cheaply", ["Let's get fracking!", 50, 25, -100], ["Maybe we should study its environmental effects first?", -50, -25, 50]]],
    ["economic", ["Is it getting a bit hot in here?", ["Just turn on the AC", 0, 0, -25], ["Have our scientists look into it", -50, 25, 50]]],
    ["economic", ["National Academy of Science is saying they need money to research climate change", ["Eh maybe later", 0, -25, -100], ["Sure", -100, 25, 50]]],
    ["economic", ["There has been more research on climate change, results ain't pretty (environment meter unlocked)", ["What...", 0, -25, 0], ["Who...", 0, -25, 0]]],
    ["economic", ["NASA wants funding for some program called Global Habitability", ["We don't have money for that!", 25, -25, -25], ["Whatever they need", -50, 25, 25]]],
    ["economic", ["Should we invest in renewable energies?", ["And lose out on the coal market? I think not!", 50, 50, -100], ["Our sponsors won't be happy about this...", -50, -25, 50]]],
    ["economic", ["Intergovernmental Panel on Climate Change is warning us that global temparatures have risen around 1 F over the last century", ["Good, that should lower our heating costs", 0, 0, -100], ["Enact a carbon tax", 25, -100, 50]]],
    ["economic", ["IPCC is 95% sure that humans are the \"dominant cause\" of global warming", ["I just don't think there is any sicence to support that, buddy", 0, -25, -50], ["Subsidize sustainable energy companies?", -150, 0, 50]]],
    ["adviser", ["You've survived into the present day! Hopefully the game made you think about climate change a bit. Thanks for playing!", ["Take a short survey", 0, 0, 0], ["Start over", 0, 0, 0]]]
];

let game_over = [
    "We're bankrupt! Banks are seizing all our assets!",
    "The people are revolting! Better flee before they get to us!",
    "Half the country is swallowed by rising sea levels! We better abandon the capital and move to the mountains!"
];

var year = -1;
function getNextCard() {
    year++;
    data = cards_data[year];
    currentCardImage.src = '/static/' + data[0] + '.png';
    return data[1];
}

var currentCard = getNextCard();

var stats = [250, 250, 250];
var show = [true, true, false];
var names = ['Wealth', 'Popularity', 'Environment'];
let symbolHeight = 0.1 * cvHeight;
var images = names.map((name) => {
    img = new Image();
    img.src = '/static/' + name + '.svg';
    return img;
});

let arrows = [new Image(), new Image()];
arrows[0].src = '/static/ArrowDown.svg';
arrows[1].src = '/static/ArrowUp.svg';

var dragOriginX = null;
var dragDeltaX = 0;
var stage = 0;

canvas.onmousedown = function(e) {
    dragOriginX = e.screenX;
    requestAnimationFrame(animate);
};
canvas.ontouchstart = canvas.onmousedown;
canvas.onmouseup = function(e) {
    dragOriginX = null;
    if (Math.abs(stage) >= 0.9) {
        updateState();
    }
    dragDeltaX = 0;
    stage = 0;
    requestAnimationFrame(animate);
};
canvas.ontouchend = canvas.onmouseup;
canvas.onmousemove = function(e) {
    if (dragOriginX != null) {
        dragDeltaX = dragOriginX - e.screenX;
        stage = Math.min(Math.max(dragDeltaX/100, -1), 1);
        requestAnimationFrame(animate);
    }
};
canvas.ontouchmove = canvas.onmousemove;

var gameOver = false;
function updateState() {
    let idx = stage > 0 ? 1 : 2;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", '/move?data=' + stats + ',' + year + ',' + idx, true); // true for asynchronous
    xmlHttp.send(null);
    if (gameOver) {
        gameOver = false;
        show[idx] = true;
        stats = [250, 250, 250];
        year = 1;
    } else {
        for (var i = 0; i < stats.length; i++) {
            stats[i] += currentCard[idx][1 + i];
            if (stats[i] <= 0) {
                gameOver = true;
                currentCard = [game_over[i], ["Start over", 0, 0, 0], ["Start over with environment info", 0, 0, 0]];
                return;
            }
        }
        if (year == 16) {
            show[2] = true;
        }
        if (year == 22) {
            if (idx == 1) {
                window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLScnW8aQZJfeSjLCsGHoK97TqshFx8GGdkfU535_7BrdspiEjA/viewform?usp=pp_url&entry.1285145035=' + sessionId;
            }
            gameOver = true;
            updateState();
            return;
        }
    }
    currentCard = getNextCard();
}

function drawStroked(text, x, y, alpha, centered=true) {
    ctx.fillStyle = `rgba(0, 0, 0, ${Math.abs(alpha)})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.abs(alpha)})`;
    ctx.font = "30px Sans-serif";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    function w(t) { return ctx.measureText(t).width; }
    function draw(t, yy) {
        width = w(t);
        var tx = x;
        if (centered) tx -= width / 2;
        ctx.strokeText(t, tx, yy);
        ctx.fillText(t, tx, yy);
    }

    let words = text.split(' ');
    var b = 0;
    for (var i = 1; i <= words.length; i++) {
        let tw = w(words.slice(b, i).join(' '));
        if (tw >= cvWidth - 20) {
            draw(words.slice(b, i - 1).join(' '), y);
            b = i - 1;
            y += 30;
        }
    }
    draw(words.slice(b).join(' '), y);
}

function symbolWithFill(symbol, x, y, fill) {
    charSize = cvHeight*0.1;
    ctx.fillStyle = "white";
    ctx.fillText(symbol, x, y);
    ctx.fillStyle = "brown";
    ctx.fillRect(x, y - charSize, charSize, charSize * fill);
    ctx.fillStyle = "rgba(255, 255, 255, 0.5";
    ctx.fillText(symbol, x, y);
}

function drawImage(image, x, y, w, h) {
    x -= w/2;
    y -= h/2;
    ctx.drawImage(image, x, y, w, h);
}

function fillRect(x, y, w, h) {
    x -= w/2;
    y -= h/2;
    ctx.fillRect(x, y, w, h);
}

function drawHeader(action) {
    ctx.save();

    function drawShapes() {
        for (var i = 0; i < images.length; i++) {
            if (show[i]) {
                var x = cvWidth * 0.25 * (i + 1);
                var y = cvHeight * 0.15;
                drawImage(images[i], x, y, symbolHeight, symbolHeight);
            }
        }
    }

    ctx.fillStyle = "brown";
    ctx.fillRect(0, 0, cvWidth, cvHeight * 0.2);

    drawShapes();

    for (var i = 0; i < images.length; i++) {
        if (show[i]) {
            var x = cvWidth * 0.25 * (i + 1);
            var y = cvHeight * 0.15;
            var w = symbolHeight;
            var h = symbolHeight * (1 - stats[i] / 500);
            y -= (symbolHeight - h) / 2;
            fillRect(x, y, w, h);
            let modifier = action[i + 1];
            w = h = Math.abs(modifier) * 1.5;
            y = cvHeight * 0.05;
            arrow = arrows[modifier < 0 ? 0 : 1];
            ctx.globalAlpha = Math.abs(stage);
            drawImage(arrow, x, y, w, h);
            ctx.globalAlpha = 1;
        }
    }

    ctx.globalAlpha = 0.5;
    drawShapes();

    ctx.restore();
}

function drawFooter() {
    ctx.fillStyle = "brown";
    ctx.fillRect(0, cvHeight * 0.9, cvWidth, cvHeight * 0.1);
    drawStroked(`Year: ${1800+year*10}s`, 10, cvHeight * 0.98, 1, false);
}

function animate() {
    ctx.clearRect(0, 0, cvWidth, cvHeight);
    let x = (cvWidth - currentCardImage.width)/2;
    let y = cvHeight - currentCardImage.height;
    var mod = 0;
    if (Math.abs(stage) >= 0.9) {
        mod = (Math.abs(stage) - 0.9) * 200;
    }
    ctx.drawImage(currentCardImage, x - stage * 40, y - mod);
    let tx = cvWidth / 2;
    let ty = 0.7 * cvHeight;
    let ti = stage > 0 ? 1 : 2;
    let action = currentCard[ti];
    drawStroked(action[0], tx, ty, stage);
    drawHeader(action);
    drawStroked(currentCard[0], tx, cvHeight * 0.3, 1);
    drawFooter();
}

// taken from https://stackoverflow.com/a/1349426/1348374
function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}