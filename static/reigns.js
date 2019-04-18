/* jshint esversion:6 */

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
var cvWidth = canvas.width;
var cvHeight = canvas.height;

var currentCardImage = new Image();
currentCardImage.onload = () => requestAnimationFrame(animate);

let cards_data = [
    ["adviser", ["Swipe left or right", ["Ok...", 0, 0, 0], ["Wait...", 0, 0, 0]]],
    ["adviser", ["You'll lose if gold or popularity is 0", ["Ok...", 0, 0, 0], ["Wait...", 0, 0, 0]]],
    ["economic", ["Some guy is saying he can double our textile production and halve the cost", ["We don't need more textiles or money", -100, 25, 0], ["Invest in the guy's workshop", 50, -25, -50]]],
    ["economic", ["Should we use steam engines to transport goods", ["No, keep having horses pull wagons", -25, 25, 0], ["Yes, let's move some merchandise", 50, -25, -50]]],
    ["economic", ["All the trains going around are scaring the townsfolk", ["Keep the number of trains in check", -25, 25, 0], ["Build walls around tracks", 0, 25, -50]]],
    ["economic", ["Moths seem to be turning black...", ["Maybe we should cut down on coal usage a little", -50, -50, 100], ["So?", 0, 0, 0]]],
    ["economic", ["Should we regulate the number of steam boats?", ["Yes, they might be bad for the fish", -50, -25, 0], ["No, I want to see the rivers filled with them!", 25, 25, -50]]],
    ["economic", ["They found some weird oil while digging for brine in America", ["I don't care unless you can cook with it", 0, -25, 0], ["Invest in oil", 100, 25, -50]]],
    ["economic", ["Guy named Gesner says he invented something called Kerosene", ["We shall turn night into day with it!", 100, 50, -50], ["Ignore him and keep using more expensive whale oil and alcohol", -25, -50, 0]]],
    ["economic", ["People are drinking petrol as medicine, and it seems to be working...", ["That's crazy talk! Have them stop!", 0, -50, 25], ["Bring me a pint too!", 25, 50, -50]]],
    ["economic", ["Oil spills in lakes and rivers are killing fish", ["Regulate oil companies", -50, -50, 100], ["Plenty of fish in the sea", 0, 0, -100]]],
    ["economic", ["Someone figured out how to use gasoline to power cars, should we prefer them over horses?", ["Finally we can stop having horse manure in the streets!", 50, 50, -50], ["But I like horses", -25, -25, 50]]]
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
    // return [currentCardImage, ['buy more blankets', [-50, -50, 50]], ['invest in coal mines', [-25, 50, -50]]];
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
canvas.onmouseup = function(e) {
    dragOriginX = null;
    if (Math.abs(stage) >= 0.9) {
        updateState();
    }
    dragDeltaX = 0;
    stage = 0;
    requestAnimationFrame(animate);
};
canvas.onmousemove = function(e) {
    if (dragOriginX != null) {
        dragDeltaX = dragOriginX - e.screenX;
        stage = Math.min(Math.max(dragDeltaX/100, -1), 1);
        requestAnimationFrame(animate);
    }
};

var gameOver = false;
function updateState() {
    let idx = stage < 0 ? 1 : 2;
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
    let ti = stage < 0 ? 1 : 2;
    let action = currentCard[ti];
    drawStroked(action[0], tx, ty, stage);
    drawHeader(action);
    drawStroked(currentCard[0], tx, cvHeight * 0.3, 1);
    drawFooter();
}
