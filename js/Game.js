var TopDownGame = TopDownGame || {};

//title screen
TopDownGame.Game = function(){};

TopDownGame.Game.prototype = {
  create: function() {
    
    //swipe logic vars
    var swipeCoordX,
    swipeCoordY,
    swipeCoordX2,
    swipeCoordY2,
    swipeMinDistance = 50;

    //swipe logic check when tap starts
    this.game.input.onDown.add(function(pointer) {
        swipeCoordX = pointer.clientX;
        swipeCoordY = pointer.clientY;   
        console.log("pointer down"); 
    }, this);

    //swipe logic check when tap starts
    this.game.input.onTap.add(function(pointer) {
      console.log(pointer.clientX);   
    }, this);

    //swipe logic check when tap ends
    this.game.input.onUp.add(function(pointer) {
        swipeCoordX2 = pointer.clientX;
        swipeCoordY2 = pointer.clientY;

        console.log("pointer up"); 

        if(swipeCoordX2 < swipeCoordX - swipeMinDistance){
            console.log("left");
        }else if(swipeCoordX2 > swipeCoordX + swipeMinDistance){
            console.log("right");
        }else if(swipeCoordY2 < swipeCoordY - swipeMinDistance){
            console.log("up");
        }else if(swipeCoordY2 > swipeCoordY + swipeMinDistance){
            console.log("down");
        }
    })


    this.map = this.game.add.tilemap('level1');

    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map.addTilesetImage('tiles', 'gameTiles');

    //create layer
    this.backgroundlayer = this.map.createLayer('backgroundLayer');
    this.blockedLayer = this.map.createLayer('blockedLayer');

    //collision on blockedLayer
    this.map.setCollisionBetween(1, 2000, true, 'blockedLayer');

    //resizes the game world to match the layer dimensions
    this.backgroundlayer.resizeWorld();

    this.createItems();
    this.createEmitter();
    this.emitter.emit = true;
    this.createDoors();    

    //create player
    var result = this.findObjectsByType('playerStart', this.map, 'objectsLayer')
    this.player = this.game.add.sprite(result[0].x, result[0].y, 'player');
    this.game.physics.arcade.enable(this.player);

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //move player with cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();

  },

  createEmitter:function(){

    var emitterContainer = this.game.add.group();

    emitterContainer.update = function(){}
    emitterContainer.postUpdate = function(){}

    // Create a new emitter
    this.emitter = new cloudkid.Emitter(

      // The DisplayObjectContainer to put the emitter in
      // if using blend modes, it's important to put this
      // on top of a bitmap, and not use the PIXI.Stage
      emitterContainer,

      // The collection of particle images to use
      ["smokeparticle"],

        // Emitter configuration, edit this to change the look
        // of the emitter
       {
        "alpha": {
          "start": 0.4,
          "end": 0
        },
        "scale": {
          "start": 2,
          "end": 0.4,
          "minimumScaleMultiplier": 1
        },
        "color": {
          "start": "#6bff61",
          "end": "#d8ff4a"
        },
        "speed": {
          "start": 10,
          "end": 10
        },
        "acceleration": {
          "x": 0,
          "y": 0
        },
        "startRotation": {
          "min": 0,
          "max": 360
        },
        "rotationSpeed": {
          "min": 0,
          "max": 0
        },
        "lifetime": {
          "min": 2,
          "max": 1.8
        },
        "blendMode": "screen",
        "frequency": 0.01,
        "emitterLifetime": -1,
        "maxParticles": 1000,
        "pos": {
          "x": 0.5,
          "y": 0.5
        },
        "addAtBack": true,
        "spawnType": "circle",
        "spawnCircle": {
          "x": 0,
          "y": 0,
          "r": 150
        }
      },
      this.game
    );


    this.emitter.updateOwnerPos(11, 11);

  },
  createItems: function() {
    //create items
    this.items = this.game.add.group();
    this.items.enableBody = true;
    var item;    

    this.items.tag = "items";

    // console.log("items", this.items);

    result = this.findObjectsByType('item', this.map, 'objectsLayer');
    result.forEach(function(element){
      this.createFromTiledObject(element, this.items);
    }, this);
  },
  createDoors: function() {
    //create doors
    this.doors = this.game.add.group();
    this.doors.enableBody = true;
    result = this.findObjectsByType('door', this.map, 'objectsLayer');

    this.doors.tag = "doors";

    // console.log("doors", this.doors);

    result.forEach(function(element){
      this.createFromTiledObject(element, this.doors);
    }, this);
  },

  //find objects in a Tiled layer that containt a property called "type" equal to a certain value
  findObjectsByType: function(type, map, layer) {
    var result = new Array();
    map.objects[layer].forEach(function(element){
      if(element.properties.type === type) {
        //Phaser uses top left, Tiled bottom left so we have to adjust
        //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
        //so they might not be placed in the exact position as in Tiled
        element.y -= map.tileHeight;
        result.push(element);
      }      
    });
    return result;
  },
  //create a sprite from an object
  createFromTiledObject: function(element, group) {
    var sprite = group.create(element.x, element.y, element.properties.sprite);

      //copy all properties to the sprite
      Object.keys(element.properties).forEach(function(key){
        sprite[key] = element.properties[key];
      });
  },
  update: function() {

    this.emitter.update(this.game.time.elapsed)

    //collision
    this.game.physics.arcade.collide(this.player, this.blockedLayer);
    this.game.physics.arcade.overlap(this.player, this.items, this.collect, null, this);
    this.game.physics.arcade.overlap(this.player, this.doors, this.enterDoor, null, this);

    //player movement
    this.player.body.velocity.x = 0;

    if(this.cursors.up.isDown) {
      if(this.player.body.velocity.y == 0)
      this.player.body.velocity.y -= 50;
    }
    else if(this.cursors.down.isDown) {
      if(this.player.body.velocity.y == 0)
      this.player.body.velocity.y += 50;
    }
    else {
      this.player.body.velocity.y = 0;
    }
    if(this.cursors.left.isDown) {
      this.player.body.velocity.x -= 50;
    }
    else if(this.cursors.right.isDown) {
      this.player.body.velocity.x += 50;
    }

  },
  collect: function(player, collectable) {
    console.log('yummy!');

    //remove sprite
    collectable.destroy();
  },
  enterDoor: function(player, door) {
    console.log('entering door that will take you to '+door.targetTilemap+' on x:'+door.targetX+' and y:'+door.targetY);
  },
};
