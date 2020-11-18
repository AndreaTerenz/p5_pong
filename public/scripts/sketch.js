var p1 = undefined, p2 = undefined
var b = undefined
var score1 = 0, score2 = 0
var game_started = false
var score_limit = 20 // prompt("Enter score limit: ", 20);
var winner = 0  

var socket

function setup() {
    Ball.MAX_VEL_ANGLE = radians(Ball.MAX_VEL_ANGLE)

    let cnv = createCanvas(1000, 500)
    cnv.parent("sketch_container")

    p1 = new Paddle(Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2);
    p2 = new Paddle((width - Paddle.PADDLE_SIZE.x) - Paddle.PADDLE_H_OFFSET, (height - Paddle.PADDLE_SIZE.y)/2);
    b = new Ball()

    textFont("Roboto mono")
    textSize(30)

    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 10;
    drawingContext.shadowColor = "black";

    socket = io.connect("http://localhost:3000")
    socket.on("connection_data", (data) => {
        set_selection_info(data)
    })
}

function set_selection_info(data) {
    let id_label = select("#socket_id")
    let room_label = select("#room_id")

    id_label.html("Socket ID: " + data.id)
    room_label.html("Room: " + data.room)
}

function draw() {
    background(0)

    fill(100)
    rect(0, 0, Paddle.PADDLE_H_OFFSET, height)
    rect(width-Paddle.PADDLE_H_OFFSET, 0, Paddle.PADDLE_H_OFFSET, height)

    p1.update()
    p2.update()

    if (game_started) {
        b.update(p1, p2)

        draw_ingame_txt()

        if (check_score()) {
            b.reset()
            p1.reset()
            p2.reset()

            if (check_winner()) {
                game_started = false
                score1 = 0
                score2 = 0
            }
        }
    }
    else {
        draw_start_msg()
    }
}

function draw_ingame_txt() {
    fill(255, 255, 255, 180)
    textAlign(RIGHT, CENTER)
    text(str(score1), (width / 2 - Paddle.PADDLE_H_OFFSET) / 2 + Paddle.PADDLE_H_OFFSET, height / 2)
    textAlign(LEFT, CENTER)
    text(str(score2), width - ((width / 2 - Paddle.PADDLE_H_OFFSET) / 2 + Paddle.PADDLE_H_OFFSET), height / 2)

    fill(255, 255, 255, 130)
    textAlign(CENTER, CENTER)
    textSize(18)
    text("First player to " + str(score_limit) + " points wins", width / 2, height - 40)
    textSize(30)
}

function draw_start_msg() {
    fill(255)
    textAlign(CENTER, CENTER)

    var msg = "Press UP/DOWN or W/S to start"

    switch (winner) {
        case 1: msg = "Player 1 won!\n" + msg; break;
        case 2: msg = "Player 2 won!\n" + msg; break;
    }

    text(msg, width / 2, height / 2)
}

function check_score() {
    if (b.pos.x <= p1.pos.x) score2+=1
    if (b.pos.x >= p2.pos.x + Paddle.PADDLE_SIZE.x) score1+=1

    return (b.pos.x <= p1.pos.x || b.pos.x >= p2.pos.x + Paddle.PADDLE_SIZE.x)
}

function check_winner() {
    if (score1 >= score_limit)
        winner = 1
    else if (score2 >= score_limit)
        winner = 2

    return winner != 0    
}

function up_key_pressed() {
    return (keyCode == UP_ARROW || key == 'w')
}

function down_key_pressed() {
    return (keyCode == DOWN_ARROW || key == 's')
}

function keyPressed() {
    if (up_key_pressed() || down_key_pressed()) {
        game_started = true
        winner = 0  

        b.set_movable(true)

        if (up_key_pressed()) {
            p1.set_direction(-1)
            p2.set_direction(-1)
        }

        if (down_key_pressed()) {
            p1.set_direction(1)
            p2.set_direction(1)
        }
    }
}

function keyReleased() {
    if (up_key_pressed() || down_key_pressed()) {
        p1.set_direction(0)
        p2.set_direction(0)        
    }
}

function sign(val) {
    if (val == undefined || val == 0) return 0

    return abs(val) / val
}