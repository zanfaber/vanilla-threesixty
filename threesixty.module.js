import './threesixty.module.scss'

export class Threesixty {
  constructor(el, objOverride) {
    this.el = (el instanceof HTMLElement)? el : document.querySelector(el);
    if(objOverride){
      Object.assign( this.defaultOptions, objOverride );
    }
    this.frames = [];
    this.init();
  }

  init() {
    if(this.el){
      this.loadImages();
      if(this.defaultOptions.disableSpin) {
		    this.defaultOptions.currentFrame = 1;
		    this.defaultOptions.endFrame = 1;
      }
      this.initProgress();
    }
  }


  /**
   * @method initProgress
   * @private
   * This function setup the progress indicator styles.
   * If you want to overreide the default styles of the progress indicator
   * you need to pass the css styles in the styles property in plugin options.
   */
  initProgress(){

    let appConfig = this.defaultOptions;
    let el = this.el;

    el.style.width = appConfig.width + 'px',
    el.style.height = appConfig.width + 'px',
    el.style.backgroundImage = 'none !important';

    if(appConfig.responsive) {
       el.style.width = '100%';
    }

    el.querySelector(appConfig.imgList).style.dispay = 'none';
  }


  /**
   * @method loadImages
   * @private
   * The function asynchronously loads images and inject into the slider.
   */
  loadImages() {

    let appConfig = this.defaultOptions;

    let li, image, baseIndex, imageName;

    li = document.createElement('li');

    baseIndex = appConfig.zeroBased ? 0 : 1;
    imageName = appConfig.domain + appConfig.imagePath + appConfig.filePrefix + this.zeroPad((appConfig.loadedImages + baseIndex)) + appConfig.ext;
    image = new Image;
    image.classList.add("previous-image");
    image.addEventListener('load', () =>{;
      this.imageLoaded();
    });
    image.src = imageName;

    this.frames.push(image);
    li.appendChild(image);
    this.el.querySelector(appConfig.imgList).appendChild(li);
  }

  /**
   * @method imageLoaded
   * @private
   * The function gets triggers once the image is loaded. We also update
   * the progress percentage in this function.
   */
  imageLoaded(){

    let appConfig = this.defaultOptions;
    let progress;
    appConfig.loadedImages += 1;
    if(appConfig.progress){
      progress = document.querySelector(appConfig.progress);
    }
    if( progress ){
      progress.querySelector('span').innerText = Math.floor(appConfig.loadedImages / appConfig.totalFrames * 100) + '%';
    }
    if (appConfig.loadedImages >= appConfig.totalFrames) {

      if(appConfig.disableSpin) {
        this.frames[0].classList.remove('previous-image')
        this.frames[0].classList.add('current-image');
      }

      if( progress ){
        progress.classList.add('fadingOut');
        progress.addEventListener('transitionend', () => {
          progress.style.display = 'none';
          this.showImages();
        });
      }
    } else {
      this.loadImages();
    }
  }

  /**
   * @method loadImages
   * @private
   * This function is called when all the images are loaded.
   */
  showImages() {

    let imgList = this.el.querySelector(this.defaultOptions.imgList)
    imgList.style.display = 'block';
    setTimeout(function(){
      imgList.classList.add('fadingIn');
    }, 0)

    this.defaultOptions.ready = true;

    this.initEvents();
    this.refresh();

  };



  /**
   * @method initEvents
   * @private
   * Function initilizes all the mouse and touch events for 360 slider movement.
   */
  initEvents() {

    let appConfig = this.defaultOptions;
    let el = this.el;

    let mouseDownHndler = (event) => {
      event.preventDefault();

      appConfig.pointerStartPosX = this.getPointerEvent(event).pageX;
      appConfig.dragging = true;
    }
    let mouseUpHandler = (event) => {
      event.preventDefault();
      appConfig.dragging = false;
    }

    el.addEventListener('pointerdown', mouseDownHndler);

    el.addEventListener('pointercancel', mouseUpHandler );

    el.addEventListener('pointerup', mouseUpHandler );

    el.addEventListener('pointermove', (event) =>{
      this.trackPointer(event);
    });
  };

  /**
   * @method getPointerEvent
   * @private
   * Function returns touch pointer events
   *
   * @params {Object} [event]
   */
    getPointerEvent(event) {
      return event?.originalEvent?.targetTouches ? event.originalEvent.targetTouches[0] : event;
    };

  /**
   * @method trackPointer
   * @private
   * Function track touch pointer event
   *
   * @params {Object} [event]
   */
  trackPointer(event){
    let appConfig = this.defaultOptions;
    if (appConfig.ready && appConfig.dragging) {
      appConfig.pointerEndPosX = this.getPointerEvent(event).pageX;
      if (appConfig.monitorStartTime < new Date().getTime() - appConfig.monitorInt) {
        appConfig.pointerDistance = appConfig.pointerEndPosX - appConfig.pointerStartPosX;
        appConfig.endFrame = appConfig.currentFrame + Math.ceil((appConfig.totalFrames - 1) * appConfig.speedMultiplier * (appConfig.pointerDistance / this.el.getBoundingClientRect().width));

        if( appConfig.disableWrap ) {
          appConfig.endFrame = Math.min(appConfig.totalFrames - (appConfig.zeroBased ? 1 : 0), appConfig.endFrame);
          appConfig.endFrame = Math.max((appConfig.zeroBased ? 0 : 1), appConfig.endFrame);
        }
        this.refresh();
        appConfig.monitorStartTime = new Date().getTime();
        appConfig.pointerStartPosX = this.getPointerEvent(event).pageX;
      }
    }
  }

  /**
     * @method refresh
     * @public
     * Function refeshes the timer and set interval for render cycle.
     *
     */

    refresh() {
      if (this.defaultOptions.ticker === 0) {
        this.defaultOptions.ticker = setInterval(() => {this.render()}, Math.round(1000 / this.defaultOptions.framerate));
      }
    };

    /**
     * @method refresh
     * @private
     * Function render the animation frames on the screen with easing effect.
     */

    render() {
      let appConfig = this.defaultOptions;
      let frameEasing;
      if (appConfig.currentFrame !== appConfig.endFrame) {
        frameEasing = appConfig.endFrame < appConfig.currentFrame ? Math.floor((appConfig.endFrame - appConfig.currentFrame) * 0.1) : Math.ceil((appConfig.endFrame - appConfig.currentFrame) * 0.1);
        this.hidePreviousFrame();
        appConfig.currentFrame += frameEasing;
        this.showCurrentFrame();
      } else {
        window.clearInterval(appConfig.ticker);
        appConfig.ticker = 0;
      }
    };
    /**
     * @method hidePreviousFrame
     * @private
     * Function hide the previous frame in the animation loop.
     */

    hidePreviousFrame() {
      this.frames[this.getNormalizedCurrentFrame()].classList.remove('current-image')
      this.frames[this.getNormalizedCurrentFrame()].classList.add('previous-image');
    };

    /**
     * @method showCurrentFrame
     * @private
     * Function shows the current frame in the animation loop.
     */
    showCurrentFrame() {

      this.frames[this.getNormalizedCurrentFrame()].classList.remove('previous-image')
      this.frames[this.getNormalizedCurrentFrame()].classList.add('current-image');
    };

    /**
     * @method getNormalizedCurrentFrame
     * @private
     * Function normalize and calculate the current frame once the user release the mouse and release touch event.
     */

    getNormalizedCurrentFrame() {
      let appConfig = this.defaultOptions;
      let c, e;

      if ( !appConfig.disableWrap ) {
        c = Math.ceil(appConfig.currentFrame % appConfig.totalFrames);
        if (c < 0) {
          c += (appConfig.totalFrames - 1);
        }
      } else {
        c = Math.min(appConfig.currentFrame, appConfig.totalFrames - (appConfig.zeroBased ? 1 : 0));
        e = Math.min(appConfig.endFrame, appConfig.totalFrames - (appConfig.zeroBased ? 1 : 0));
        c = Math.max(c, (appConfig.zeroBased ? 0 : 1));
        e = Math.max(e, (appConfig.zeroBased ? 0 : 1));
        appConfig.currentFrame = c;
        appConfig.endFrame = e;
      }

      return c;
    };

  /**
   * Function to return with zero padding.
   */
  zeroPad(num){

    const pad = (number, length) => {
      let str = number.toString();
      if(this.defaultOptions.zeroPadding) {
        while (str.length < length) {
          str = '0' + str;
        }
      }
      return str;
    }

    let approximateLog = Math.log(this.defaultOptions.totalFrames) / Math.LN10;
    let roundTo = 1e3;
    let roundedLog = Math.round(approximateLog * roundTo) / roundTo;
    let numChars = Math.floor(roundedLog) + 1;

    return pad(num, numChars);

  };


  defaultOptions = {
    /**
     * @cfg {Boolean} dragging [dragging=false]
     * @private
     * Private propery contains a flags if users is in dragging mode.
     */
    dragging: false,
    /**
     * @cfg {Boolean} ready [ready=false]
     * @private
     * Private propery is set to true is all assets are loading and application is
     * ready to render 360 slider.
     */
    ready: false,
    /**
     * @cfg {Number} pointerStartPosX
     * @private
     * private property mouse pointer start x position when user starts dragging slider.
     */
    pointerStartPosX: 0,
    /**
     * @cfg {Number} pointerEndPosX
     * @private
     * private property mouse pointer start x position when user end dragging slider.
     */
    pointerEndPosX: 0,
    /**
     * @cfg {Number} pointerDistance
     * @private
     * private property contains the distance between the pointerStartPosX and pointerEndPosX
     */
    pointerDistance: 0,
    /**
     * @cfg {Number} monitorStartTime
     * @private
     * private property contains time user took in dragging mouse from pointerStartPosX and pointerEndPosX
     */
    monitorStartTime: 0,
    monitorInt: 10,
    /**
     * @cfg {Number} ticker
     * @private
     * Timer event that renders the 360
     */
    ticker: 0,
    /**
     * @cfg {Number} speedMultiplier
     * This property controls the sensitivity for the 360 slider
     */
    speedMultiplier: 7,
    /**
     * @cfg {Number} totalFrames
     * Set total number for frames used in the 360 rotation
     */
    totalFrames: 180,
    /**
     * @cfg {Number} currentFrame
     * Current frame of the slider.
     */
    currentFrame: 0,
    /**
     * @cfg {Array} endFrame
     * Private perperty contains information about the end frame when user slides the slider.
     */
    endFrame: 0,
    /**
     * @cfg {Number} loadedImages
     * Private property contains count of loaded images.
     */
    loadedImages: 0,
    /**
     * @cfg {Array} framerate
     * Set framerate for the slider animation
     */
    framerate: 60,
    /**
     * @cfg {String} domain
     * Domain from where assets needs to be loaded. Use this propery is you want to load all assets from
     * single domain.
     */
    domain: '',
    /**
     * @cfg {String} filePrefix
     * Prefix for the image file name before the numeric value.
     */
    filePrefix: '',
    /**
     * @cfg {String} ext [ext=.png]
     * Slider image extension.
     */
    ext: 'png',
    /**
     * @cfg {Object} height [300]
     * Height of the slider
     */
    height: 300,
    /**
     * @cfg {Number} width [300]
     * Width of the slider
     */
    width: 300,
    /**
     * Property to disable auto spin
     * @type {Boolean}
     */
    disableSpin: false,
    /**
     * Property to disable infinite wrap
     * @type {Boolean}
     */
    disableWrap: false,
    /**
     * Responsive width
     * @type {Boolean}
     */
    responsive: false,
    /**
     * Zero Padding for filenames
     * @type {Boolean}
     */
    zeroPadding: false,
    /**
     * Zero based for image filenames starting at 0
     * @type {Boolean}
     */
     zeroBased: false


  };


}