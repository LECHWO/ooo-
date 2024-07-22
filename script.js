// script.js

// 캔버스 설정
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// 다시하기 버튼 설정
const restartButton = document.getElementById('restartButton');
restartButton.addEventListener('click', restartGame);

// 게임 상태
let isGameOver = false;
let score = 0;

// 플레이어 설정 (쫄라맨 캐릭터)
const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 80,
  width: 50,
  height: 80,
  speed: 5,
  color: 'transparent'
};

// 키보드 입력 설정
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// OK 텍스트 및 적 레이저 설정
const okTexts = [];
const enemyLasers = [];
const explosions = [];

// 적 설정
const enemies = [];
function spawnEnemy() {
  const x = Math.random() * (canvas.width - 60);

  let enemy = {
    x,
    y: -50,
    width: Math.random() * 40 + 20, // 20~60 픽셀
    height: Math.random() * 40 + 20, // 20~60 픽셀
    speed: Math.random() * 2 + 1, // 1~3 픽셀/프레임
    color: getRandomColor(),
    type: getRandomEnemyType(),
    shape: getRandomShape(),
    shootInterval: 0, // 레이저 발사 간격
    timeSinceLastShot: 0 // 마지막 레이저 발사 후 경과 시간
  };

  if (enemy.type === 'shooter') {
    enemy.shootInterval = Math.random() * 2000 + 1000; // 1초에서 3초 사이의 레이저 발사 간격
  }

  enemies.push(enemy);
}

// 적의 랜덤 타입 생성
function getRandomEnemyType() {
  const types = ['normal', 'fast', 'strong', 'shooter', 'star', '이옥희', '최수용', '류경숙'];
  return types[Math.floor(Math.random() * types.length)];
}

// 적의 랜덤 모양 생성
function getRandomShape() {
  const shapes = ['rectangle', 'circle', 'star'];
  return shapes[Math.floor(Math.random() * shapes.length)];
}

// 랜덤 색상 생성
function getRandomColor() {
  const colors = ['red', 'green', 'purple', 'orange', 'cyan', 'yellow'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 별 모양 그리기
function drawStar(x, y, radius, color) {
  const spikes = 5;
  const step = Math.PI / spikes;
  let rotation = (Math.PI / 2) * 3;
  let cx = x;
  let cy = y;
  let path = new Path2D();
  path.moveTo(cx, cy - radius);
  for (let i = 0; i < spikes; i++) {
    cx = x + Math.cos(rotation) * radius;
    cy = y + Math.sin(rotation) * radius;
    path.lineTo(cx, cy);
    rotation += step;
    cx = x + Math.cos(rotation) * (radius / 2);
    cy = y + Math.sin(rotation) * (radius / 2);
    path.lineTo(cx, cy);
    rotation += step;
  }
  path.lineTo(x, y - radius);
  path.closePath();
  ctx.fillStyle = color;
  ctx.fill(path);
}

// 폭발 효과
function createExplosion(x, y) {
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const speed = Math.random() * 3 + 1;
    explosions.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      lifetime: Math.random() * 30 + 20
    });
  }
}

// 무지개 색상 생성
function getRainbowColor(index) {
  const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#8B00FF'];
  return colors[index % colors.length];
}

// 충돌 감지 함수
function detectCollision(obj1, obj2) {
  if (obj2.shape === 'circle') {
    const dx = obj1.x + obj1.width / 2 - (obj2.x + obj2.width / 2);
    const dy = obj1.y + obj1.height / 2 - (obj2.y + obj2.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (obj1.width / 2 + obj2.width / 2);
  } else {
    return obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y;
  }
}

// 지면 색상 설정
let groundColor = 'black';
const groundColors = ['black', 'darkblue', 'darkgreen', 'darkred'];
const colorChangeInterval = 5000; // 5초마다 색상 변경
let lastColorChangeTime = 0;

// 배경 텍스트 설정
const backgroundText1 = "류경숙헤어샵";
const backgroundText2 = "이명선샤인";
const backgroundText3 = "옥희 국밥";

// 쫄라맨 그리기
function drawJjolaman(x, y) {
  // 몸통
  ctx.fillStyle = 'blue';
  ctx.fillRect(x + 15, y, 20, 40);

  // 다리
  ctx.fillRect(x + 10, y + 40, 10, 20);
  ctx.fillRect(x + 30, y + 40, 10, 20);

  // 팔
  ctx.fillRect(x, y + 10, 10, 20);
  ctx.fillRect(x + 40, y + 10, 10, 20);

  // 머리
  ctx.beginPath();
  ctx.arc(x + 25, y - 10, 15, 0, 2 * Math.PI);
  ctx.fillStyle = 'red';
  ctx.fill();
}

// 적 그리기
function drawEnemy(enemy) {
  ctx.fillStyle = enemy.color;
  if (enemy.shape === 'rectangle') {
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  } else if (enemy.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, 0, 2 * Math.PI);
    ctx.fill();
  } else if (enemy.shape === 'star') {
    drawStar(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width / 2, enemy.color);
  }

  // 적의 텍스트 표시
  ctx.font = '16px serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(enemy.type, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
}

// 게임 루프
function gameLoop(timestamp) {
  if (isGameOver) {
    ctx.font = '48px serif';
    ctx.fillStyle = 'white';
    ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
    ctx.font = '24px serif';
    ctx.fillText('Score: ' + score, canvas.width / 2 - 60, canvas.height / 2 + 50);
    restartButton.style.display = 'block';
    return;
  }

  // 지면 색상 변경
  if (timestamp - lastColorChangeTime > colorChangeInterval) {
    groundColor = groundColors[Math.floor(Math.random() * groundColors.length)];
    lastColorChangeTime = timestamp;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 배경 색상과 텍스트 그리기
  ctx.fillStyle = groundColor;
  ctx.fillRect(0, canvas.height - player.height, canvas.width, player.height); // 지면 그리기

  ctx.font = '48px serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText(backgroundText1, canvas.width / 2, canvas.height / 2 - 150); // 류경숙헤어샵 텍스트

  ctx.font = '36px serif';
  ctx.fillStyle = 'yellow';
  ctx.fillText(backgroundText2, canvas.width / 2, canvas.height / 2); // 이명선샤인 텍스트

  ctx.font = '24px serif';
  ctx.fillStyle = 'lightblue';
  ctx.fillText(backgroundText3, canvas.width / 2, canvas.height / 2 + 100); // 옥희 국밥 텍스트

  // 플레이어 이동
  if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
  if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
  if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;

  // OK 텍스트 발사
  if (keys[' ']) {
    okTexts.push({
      x: player.x + player.width / 2 - 30,
      y: player.y,
      width: 60,
      height: 30,
      speed: 7,
      color: getRainbowColor(okTexts.length % 7), // 무지개 색상
      text: 'OK'
    });
    keys[' '] = false; // 한번 누르면 발사하게 설정
  }

  // OK 텍스트 이동
  okTexts.forEach((okText, index) => {
    okText.y -= okText.speed;
    if (okText.y + okText.height < 0) okTexts.splice(index, 1);
  });

  // 적 이동 및 충돌 검사
  enemies.forEach((enemy, index) => {
    enemy.y += enemy.speed;
    if (enemy.y > canvas.height) enemies.splice(index, 1); // 적이 화면을 벗어나면 제거

    // 레이저 발사
    if (enemy.type === 'shooter') {
      enemy.timeSinceLastShot += timestamp - (enemy.lastShotTime || timestamp);
      if (enemy.timeSinceLastShot > enemy.shootInterval) {
        enemyLasers.push({ x: enemy.x + enemy.width / 2 - 5, y: enemy.y + enemy.height, width: 10, height: 20, speed: 5, color: 'red' });
        enemy.lastShotTime = timestamp;
        enemy.timeSinceLastShot = 0;
      }
    }

    // OK 텍스트와 적의 충돌 검사
    okTexts.forEach((okText, oIndex) => {
      if (detectCollision(okText, enemy)) {
        createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2); // 폭발 효과 생성
        enemies.splice(index, 1);
        okTexts.splice(oIndex, 1);
        score += enemy.type === 'strong' ? 20 : 10; // 강한 적은 더 많은 점수
      }
    });

    // 플레이어와 적의 충돌 검사
    if (detectCollision(player, enemy)) {
      isGameOver = true;
    }
  });

  // 레이저 이동 및 충돌 검사
  enemyLasers.forEach((laser, index) => {
    laser.y += laser.speed;
    if (laser.y > canvas.height) enemyLasers.splice(index, 1); // 레이저가 화면을 벗어나면 제거

    // 레이저와 플레이어의 충돌 검사
    if (detectCollision(laser, player)) {
      isGameOver = true;
    }
  });

  // 별 모양의 적 생성
  if (Math.random() < 0.02) spawnEnemy();

  // 폭발 효과 이동
  explosions.forEach((explosion, index) => {
    explosion.x += explosion.vx;
    explosion.y += explosion.vy;
    explosion.lifetime--;
    if (explosion.lifetime <= 0) explosions.splice(index, 1);
  });

  // 플레이어 그리기 (쫄라맨)
  drawJjolaman(player.x, player.y);

  // OK 텍스트 그리기
  okTexts.forEach(okText => {
    ctx.fillStyle = okText.color;
    ctx.font = '24px serif';
    ctx.fillText(okText.text, okText.x, okText.y + okText.height / 2); // 텍스트를 중앙에 배치
  });

  // 적 그리기
  enemies.forEach(enemy => {
    drawEnemy(enemy);
  });

  // 레이저 그리기
  enemyLasers.forEach(laser => {
    ctx.fillStyle = laser.color;
    ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
  });

  // 폭발 효과 그리기
  explosions.forEach(explosion => {
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(explosion.x, explosion.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  });

  // 점수판 그리기
  ctx.font = '24px serif';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 10, 30);

  requestAnimationFrame(gameLoop);
}

// 게임 재시작 함수
function restartGame() {
  isGameOver = false;
  score = 0;
  player.x = canvas.width / 2 - 25;
  player.y = canvas.height - 80;
  okTexts.length = 0;
  enemies.length = 0;
  enemyLasers.length = 0;
  explosions.length = 0;
  restartButton.style.display = 'none';
  lastColorChangeTime = 0; // 색상 변경 시간 초기화
  gameLoop();
}

// 게임 시작
gameLoop();



