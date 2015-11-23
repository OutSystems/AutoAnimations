# AutoAnimations

Automatically animate all inserted and removed DOM elements with good defaults:
- Slide down/up for elements with display=block & position=static
- Fade in/out for all others
- Elements with existing CSS transitions or animations will be left alone
- Uses velocity.js to assure smooth 60fps animations even in mobile

##USAGE
Just include this script, and an animation-duration to your css, e.g. 

<pre>* { 
    animation-duration: .2s; 
}</pre>

##EXCEPTIONS
If you don't want some element to automatically animate (e.g. external libraries) just set its animation-duration to 0s, e.g. :
<pre>.SomeCustomComponent, .SomCustomComponent * {animation-duration: 0s; }  </pre>
