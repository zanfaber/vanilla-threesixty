# Vanilla threesixty (module)

This is a ES class that recreates the functionality of the [Threesixty Image Slider jquery plugin](https://github.com/creativeaura/threesixty-slider).
More specifically, I've based my loosy port on [this fork by vml-webdev](https://github.com/vml-webdev/threesixty-slider).

A good percentage of features is preserved, but not 100% because I've manly ported the parts I needed (did I write it's loosy?)

## Example

Just copy the files and modify as you prefer; in my case I set up the code as a JS module that also imports the css (Scss) file.

### Html Snippet

    <div class="threesixty">
      <div class="spinner">
        <span>0%</span>
      </div>
      <ol class="threesixty_images"></ol>
    </div>

### Js snippet
    const threesixty = new Threesixty('.threesixty', {
      totalFrames: 60, // Total no. of image you have for 360 slider
	    endFrame: 60, // End frame for the auto spin animation
	    currentFrame: 8, // This the start frame for auto spin
	    imgList: '.threesixty_images', // selector for image list
	    progress: '.spinner', // selector to show the loading progress
	    imagePath: '/images/folder/with/images/', // path of the image assets
	    filePrefix: '', // file prefix if any
	    ext: '.jpg', // extention for the assets
	    height: 800,
	    width: 1280,
	    responsive: true,
	    onReady: function(){ }
    });


## To do
  - [ x ] "onReady" callback
  - [ ] Cleaner code
  - [ ] More options like the original plugin?