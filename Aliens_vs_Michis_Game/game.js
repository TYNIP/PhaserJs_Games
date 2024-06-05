/* Aliens vs Michis | The Game */

function preload() {
    this.load.image('alien', 'https://cdn.pixabay.com/photo/2016/09/27/14/46/ufo-1698553_960_720.png');
    this.load.image('platform', 'https://cdn.pixabay.com/photo/2014/04/02/17/07/full-moon-308007_1280.png');
    this.load.image('michi', 'https://cdn.pixabay.com/photo/2023/01/15/11/38/cat-7719975_1280.png');
    this.load.image('AlienPellet', 'https://cdn.pixabay.com/photo/2012/05/02/16/00/laser-45734_960_720.png');
    this.load.image('AlienRepellent', 'https://cdn.pixabay.com/photo/2018/02/25/12/06/cookie-3180329_1280.png');
  }
  
  /* HELPERS */
  function sortedEnemies(){
    const orderedByXCoord = gameState.enemies.getChildren().sort((a, b) => a.x - b.x);
    return orderedByXCoord;
  }

  function numOfTotalEnemies() {
      const totalEnemies = gameState.enemies.getChildren().length;
    return totalEnemies;
  }
  
  const gameState = {
    enemyVelocity: 1
  };
  
  /* CREATE GAME */
  function create() {
      // Game status 
      gameState.active = true;
  
      // Restart Game
      this.input.on('pointerup', () => {
          if (gameState.active === false) {
              this.scene.restart();
          }
      })
  
      //Static platforms
      const platforms = this.physics.add.staticGroup();
      platforms.create(225, 660, 'platform').setScale(1, .3).refreshBody();
      gameState.scoreText = this.add.text(175, 482, 'Bugs Left: 24', { fontSize: '15px', fill: '#FFFFFF' });
      gameState.player = this.physics.add.sprite(225, 450, 'michi').setScale(.03);
      gameState.player.setCollideWorldBounds(true);
      this.physics.add.collider(gameState.player, platforms);
      gameState.cursors = this.input.keyboard.createCursorKeys();
  
      /* ENEMIES */
    gameState.enemies = this.physics.add.group();
    for(yVal = 1; yVal<4; yVal++){
      for(xVal = 1; xVal < 9; xVal++){
        gameState.enemies.create(50*xVal, 50*yVal, 'alien').setScale(.03).setGravityY(-200)
      }
    }
  
    const pellets = this.physics.add.group()
    const genPellet = ()=>{
      let randomBug = Phaser.Utils.Array.GetRandom(gameState.enemies.getChildren());
  
      pellets.create(randomBug.x, randomBug.y, 'AlienPellet').setScale(.015).setRotation(-90);
    }
  
    gameState.pelletsLoop = this.time.addEvent({
      delay: 300,
      callback: genPellet,
      callbackScope: this,
      loop: true
    })
  
    /* COLLIDERS */
    //GROUND
    this.physics.add.collider(pellets, platforms, (pellet)=>{
      pellet.destroy()
    })
    //Player
    this.physics.add.collider(pellets, gameState.player, ()=>{
      gameState.active =  false;
      gameState.pelletsLoop.destroy()
      this.physics.pause()
      gameState.enemyVelocity = 1
      this.add.text(150, 250, 'Game Over \nThe aliens took you home \nand your cookies \n\nRestart?', {fontSize: '15px', fill:'#FFFFFF'})
    })
  
    /* PLAYER */
    gameState.bugRepellent = this.physics.add.group()
    this.physics.add.collider(gameState.enemies, gameState.bugRepellent, (bug, repellent)=>{
      bug.destroy()
      repellent.destroy()
      gameState.scoreText.setText(`Aliens Left ${numOfTotalEnemies()}`)
    });
  
    this.physics.add.collider(gameState.enemies, gameState.player, ()=>{
      gameState.active = false;
      gameState.enemyVelocity = 1;
      this.physics.pause();
      this.add.text(210, 250, 'Game Over \n The aliens took you home and your cookies \nRestart?', {fontSize: '15px', fill:'#FFFFFF'})
    });
      
  }
  
  /* GAME DYNAMICS */
  function update() {
      if (gameState.active) {
          if (gameState.cursors.left.isDown) {
              gameState.player.setVelocityX(-160);
          } else if (gameState.cursors.right.isDown) {
              gameState.player.setVelocityX(160);
          } else {
              gameState.player.setVelocityX(0);
          }
  
          if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space)) {
        gameState.bugRepellent.create(gameState.player.x, gameState.player.y, 'AlienRepellent').setGravityY(-400).setScale(.015);
          }

      // ENEMIES STATUS    
      if(numOfTotalEnemies() === 0){
        gameState.active = false;
        this.physics.pause();
        gameState.enemyVelocity = 1
        this.add.text(100, 250, 'You Won. \n You protected you home and your cookies', {fontSize: '15px', fill: '#FFFFFF'})
      } else {
        gameState.enemies.getChildren().forEach(bug =>{
          bug.x += gameState.enemyVelocity;
        });
        gameState.leftMostBug = sortedEnemies()[0];
        gameState.rightMostBug = sortedEnemies()[sortedEnemies().length - 1]
  
        if(gameState.leftMostBug.x < 10 || gameState.rightMostBug.x > 440){
        gameState.enemyVelocity *= -1;
        gameState.enemies.getChildren().forEach((enemy)=>{
          enemy.y += 10;
        });
      }
  
      }   
    }
  }
  
  /* GAME CONFIG */
  const config = {
      type: Phaser.AUTO,
      width: 450,
      height: 500,
      backgroundColor: "2b293e",
      physics: {
          default: 'arcade',
          arcade: {
              gravity: { y: 200 },
              enableBody: true,
          }
      },
      scene: {
          preload,
          create,
          update
      }
  };
  
  /* START GAME */
  const game = new Phaser.Game(config);