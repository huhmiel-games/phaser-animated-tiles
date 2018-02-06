/**
* @author       Niklas Berg <nkholski@niklasberg.se>
* @copyright    2018 Niklas Berg
* @license      {@link https://github.com/nkholski/phaser3-animated-tiles/blob/master/LICENSE|MIT License}
*/

var AnimatedTiles = function (scene) {
    //  The Scene that owns this plugin
    this.scene = scene;

    this.systems = scene.sys;

    // TileMap the plugin belong to. 
    // TODO: Array or object for multiple tilemaps support
    // TODO: reference to layers too, and which is activated or not
    this.map = null;

    // Array with all tiles to animate
    this.animatedTiles = [];

    // Global playback rate
    this.rate = 1;
    // Playback rate per tile as multiple of the global rate.
    this.tileRate = {};

    // Should the animations play or not?
    this.active = false;

    if (!scene.sys.settings.isBooted) {
        scene.sys.events.once('boot', this.boot, this);
    }
};

//  Static function called by the PluginFile Loader.
AnimatedTiles.register = function (PluginManager) {
    //  Register this plugin with the PluginManager, so it can be added to Scenes.

    //  The first argument is the name this plugin will be known as in the PluginManager. It should not conflict with already registered plugins.
    //  The second argument is a reference to the plugin object, which will be instantiated by the PluginManager when the Scene boots.
    //  The third argument is the local mapping. This will make the plugin available under `this.sys.base` and also `this.base` from a Scene if
    //  it has an entry in the InjectionMap.
    PluginManager.register('AnimatedTiles', AnimatedTiles, 'animatedTiles');
};

AnimatedTiles.prototype = {

    //  Called when the Plugin is booted by the PluginManager.
    //  If you need to reference other systems in the Scene (like the Loader or DisplayList) then set-up those references now, not in the constructor.
    boot: function () {
        var eventEmitter = this.systems.events;

        //  Listening to the following events is entirely optional, although we would recommend cleanly shutting down and destroying at least.
        //  If you don't need any of these events then remove the listeners and the relevant methods too.

        //eventEmitter.on('start', this.start, this);

        //eventEmitter.on('preupdate', this.preUpdate, this);
        //eventEmitter.on('update', this.update, this);
        eventEmitter.on('postupdate', this.postUpdate, this);

        //eventEmitter.on('pause', this.pause, this);
        //eventEmitter.on('resume', this.resume, this);

        //eventEmitter.on('sleep', this.sleep, this);
        //eventEmitter.on('wake', this.wake, this);

        eventEmitter.on('shutdown', this.shutdown, this);
        eventEmitter.on('destroy', this.destroy, this);
    },

    // Initilize support for animated tiles on given map
    init: function (map) {
        this.map = map;
        // TODO: Allow to specify tileset?
        this.map.tilesets.forEach((tileset) => {
            this.animatedTiles = this.getAnimatedTiles(tileset.tileData);
        }
        )
        this.start(); // Start the animations by default
    },

    setRate(rate, tile = null) {
        if (!index) {
            this.rate = rate;
        }
        // if tile is number (gid) --> set rate for that tile
        // if tile is object -> check properties matching object and set rate
    },

    //  Start (or resume) animations
    start: function () {
        this.active = true;
    },

    // Stop (or pause) animations
    stop: function () {
        this.active = false;
    },

    //  Called every Scene step - phase 3
    postUpdate: function (time, delta) {
        if (!this.active) {
            return;
        }

        // Checking Mario culled tiles 100 000 times take 100ms

        console.log("NEW");
        let date1 = new Date();
        //console.log(new Date().getSeconds()+" "+new Date().getMilliseconds());
        let apa = { hej: 1, svej: 1 }
        //for(i=0;i<100000;i++){
        this.map.layers[0].tilemapLayer.culledTiles.forEach(tile => {
            if (tile.index === apa.hej && tile.index == apa.svej) {

            }
        });
        //}
        let date2 = new Date();
        console.log(date2.getTime() - date1.getTime());
        //        console.log(new Date().getSeconds()+" "+new Date().getMilliseconds());


        //      debugger;


        this.animatedTiles.forEach(
            (animatedTile) => {
                //let animatedTile = this.animatedTiles[tilkey];
                animatedTile.next -= delta * this.rate;
                if (animatedTile.next < 0) {
                    let currentIndex = animatedTile.currentFrame;
                    let newIndex = currentIndex + 1;
                    if (newIndex > (animatedTile.frames.length - 1)) {
                        newIndex = 0;
                    }
                    animatedTile.next = animatedTile.frames[newIndex].duration;
                    animatedTile.currentFrame = newIndex;
                    /**
                     * 
                     * TODO: 1. Gå på AnimationIndex, 
                     * 2. ändra bara inom vyn: MEN då måste räkna ut nya tiles som inte syntes nyss. Kom ihåg förra området!
                     * 
                     */
                    this.map.replaceByIndex(animatedTile.frames[currentIndex].tileid, animatedTile.frames[newIndex].tileid);
                }
                else {
                    // TODO: Uppdatera sådana som inte synts i förra uppdateringen

                }
            }
        );
    },

    resetRate: function (globalOnly = false) {
        this.rate = 1;
        if (!globalOnly) {
            Object.keys(this.tileRates).forEach(
                (key) => {
                    this.tileRates[key] = 1;
                }
            )
        }
    },

    //  Called when a Scene shuts down, it may then come back again later (which will invoke the 'start' event) but should be considered dormant.
    shutdown: function () {
    },


    //  Called when a Scene is destroyed by the Scene Manager. There is no coming back from a destroyed Scene, so clear up all resources here.
    destroy: function () {
        this.shutdown();

        this.scene = undefined;
    },
    getAnimatedTiles: function (tileData) {
        // Buildning the array with tiles that should be animated
        let animatedTiles = [];
        Object.keys(tileData).forEach(
            (index) => {
                console.log(gid);
                index=parseInt(index);
                if (tileData[index].hasOwnProperty("animation")) {
                    let tile = {
                        index,
                        frames: [],
                        currentFrame: 0
                    };
                    tileData[index].animation.forEach((frame) => { frame.tileid++; tile.frames.push(frame) });
                    tile.next = tile.frames[0].duration;
                    animatedTiles.push(tile);
                    this.tileRate[index] = 1;
                }
            }
        );
        // Add animIndex to all tiles which is the original index set by Tiled
        // animIndex is constant while the rendered index is in flux 
        animatedTiles.forEach(
            (animatedTile) => {
                this.map.layers[0].data.forEach(
                    (tileCol) => {
                        tileCol.forEach(
                            (tile) => {
                                if (tile.index === animatedTile.index) {
                                    tile.animIndex = animatedTile.index;
                                }
                            }
                        );
                    }
                )
            }
        );
        return animatedTiles;
    },


    getAnimatedTilesOLD: function (tileData) {
        // Buildning the array with tiles that should be animated
        let animatedTiles = [];
        Object.keys(tileData).forEach(
            (key) => {
                console.log(key);
                if (tileData[key].hasOwnProperty("animation")) {
                    let tile = {
                        key,
                        frames: [],
                        currentFrame: 0
                    };
                    tileData[key].animation.forEach((frame) => { frame.tileid++; tile.frames.push(frame) });
                    tile.next = tile.frames[0].duration;
                    animatedTiles.push(tile);
                    this.tileRate[key] = 1;
                    /**
                     * 
                     *  TODO: Add animationIndex to all
                     * 
                     */

                }
            }
        )
        return animatedTiles;
    }

};

AnimatedTiles.prototype.constructor = AnimatedTiles;

//  Make sure you export the plugin for webpack to expose

module.exports = AnimatedTiles;


/***
let width = 20;        debugger;

let height = 15;
let rect1 = {
  x: 5,
  y: 2,
};
let rect2 = {
  x: 0,
  y: 0,
};
if(rect2.x>rect1.x){
  // Update tiles in rectangle to the right
  for(let x=rect1.x+width; x<rect2.x+width; x++){
    for(let y=rect2.y; y<rect2.y+height; y++){
      console.log(x,y);
    }
  }
}
else if(rect2.x<rect1.x){
  // Update tiles in rectangle to the left
  for(let x=rect2.x; x<rect1.x; x++){
    for(let y=rect2.y; y<rect2.y+height; y++){
      console.log(x,y);
    }
  }
}
// This updates tiles below or above previously updated screen,
// except whats already been taken care off by left/right check
/*if(rect2.y>rect1.y){
  // Update tiles in rectangle below
  for(let x=rect2.x; x<rect1.x+width; x++){
    for(let y=rect1.y+height; y<rect2.y+height; y++){
      console.log("below",x,y);
    }
  }
}
else if(rect2.y<rect1.y){
  // Update tiles in rectangle above
  for(let x=rect2.x; x<rect1.x+width; x++){
    for(let y=rect2.y; y<rect1.y; y++){
      console.log("above",x,y);
    }
  }
}*/



