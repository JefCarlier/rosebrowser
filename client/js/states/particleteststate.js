'use strict';

var particleEmitters = [];

function ParticleTestState() {
  this.DM = new DataManager();
  this.world = null;
}

ParticleTestState.prototype.prepare = function(callback) {
  this.DM.register('canim_intro', Animation, '3DDATA/TITLEIROSE/CAMERA01_INTRO01.ZMO');
  this.DM.register('canim_inselect', Animation, '3DDATA/TITLEIROSE/CAMERA01_INSELECT01.ZMO');
  this.DM.register('canim_ingame', Animation, '3DDATA/TITLEIROSE/CAMERA01_INGAME01.ZMO');
  this.DM.register('canim_create', Animation, '3DDATA/TITLEIROSE/CAMERA01_CREATE01.ZMO');
  this.DM.register('canim_outcreate', Animation, '3DDATA/TITLEIROSE/CAMERA01_OUTCREATE01.ZMO');

  var self = this;
  this.DM.get('canim_intro', function() {
    callback();

    // Continue by preloading the rest for now.
    self.DM.get('canim_inselect');
    self.DM.get('canim_ingame');
    self.DM.get('canim_create');
    self.DM.get('canim_outcreate');

  });

  this.activeCamAnim = null;
};

ParticleTestState.prototype.playCamAnim = function(name, loopCount) {
  var self = this;
  this.DM.get(name, function(zmoData) {
    if (self.activeCamAnim) {
      self.activeCamAnim.stop();
      self.activeCamAnim = null;
    }

    self.activeCamAnim =
      new CameraAnimator(camera, zmoData, new THREE.Vector3(5200, 5200, 0));
    self.activeCamAnim.play(loopCount);
  });
};

ParticleTestState.prototype.spawnParticles = function() {
  Effect.load('3Ddata\\EFFECT\\BONFIRE_01.EFT', function(effect){
    console.log(effect);

    var rootObj = new THREE.Object3D();

    for (var j = 0; j < effect.particles.length; ++j) {
      var particle = effect.particles[j];

      ParticleSystem.load(particle.particlePath, function (particleSystem)
      {
        console.log(particleSystem);

        for (var i = 0; i < particleSystem.emitters.length; ++i) {
          var data = particleSystem.emitters[i];
          var emitter = new ParticleEmitter(data);
          emitter.rootObj.position.copy(particle.position);
          emitter.rootObj.quaternion.copy(particle.rotation);
          particleEmitters.push(emitter);

          rootObj.add(emitter.rootObj);
        }
      });
    }

    rootObj.position.set(5200, 5280, 0);
    scene.add(rootObj);
  });
};

ParticleTestState.prototype.enter = function() {
  var self = this;

  debugGui.add(this, 'spawnParticles');

  //this.playCamAnim('canim_intro');

  var container = document.createElement( 'div' );
  document.body.appendChild( container );

  var controls = new THREE.FreeFlyControls(camera);
  controls.movementSpeed = 100;
  controls.domElement = container;
  controls.rollSpeed = Math.PI / 24;
  controls.autoForward = false;
  controls.dragToLook = false;
  self.controls = controls;

  camera.position.x = 5150;
  camera.position.y = 5333;
  camera.position.z = 39;

  if (1) {
    var wm = new WorldManager();
    wm.rootObj.position.set(5200, 5200, 0);
    wm.setMap(5, function ()
    {
      console.log('Map Ready');
    });
    this.world = wm;
    scene.add(wm.rootObj);

    var charObj = new CharPawn();
    charObj.setGender(0, function ()
    {
      charObj.setModelPart(3, 1);
      charObj.setModelPart(4, 1);
      charObj.setModelPart(5, 1);
      charObj.setModelPart(7, 202);
      charObj.setModelPart(8, 2);

      var animPath = '3DData/Motion/Avatar/EMPTY_STOP1_M1.ZMO';
      Animation.load(animPath, function (zmoData)
      {
        var anim = zmoData.createForSkeleton('test', charObj.rootObj, charObj.skel);
        anim.play();
      });
    });
    charObj.rootObj.position.set(5200, 5280, -5);
    charObj.rootObj.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI);
    charObj.rootObj.scale.set(1.2, 1.2, 1.2);
    scene.add(charObj.rootObj);
  }
};

ParticleTestState.prototype.leave = function() {

};

ParticleTestState.prototype.update = function(delta) {
  this.controls.update( delta );

  for (var i = 0; i < particleEmitters.length; ++i) {
    particleEmitters[i].update(delta);
  }

  if (this.world && this.world.isLoaded) {
    this.world.setViewerInfo(camera.position);
    this.world.update(delta);
  }
};

var gsParticleTest = new ParticleTestState();
