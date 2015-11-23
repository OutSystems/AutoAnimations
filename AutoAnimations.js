/*

    AUTO ANIMATIONS

    Automatically animate all inserted and removed DOM elements with good defaults:
    - Slide down/up for elements with display=block & position=static
    - Fade in/out for all others
    - Elements with existing CSS transitions or animations will be left alone
    - Uses velocity.js to assure smooth 60fps animations

    USAGE: Just include this script and add an animation duration to your css, e.g.

        * {    animation-duration: .2s; }

    EXCEPTIONS: If you don't want some element to automatically animate (e.g. external libraries) just set its animation-duration to 0s, e.g. :
        .SomeCustomComponent, .SomCustomComponent * {animation-duration: 0s; }

*/

(function(){

        // Configuration needed by AutoAnimations. Put it in the CSS
        //document.styleSheets[0].insertRule("* {animation-duration: .5s}", 0);

        "use strict";
        //already loaded exit
        if (HTMLElement.prototype._insertBefore) {
                return;
        }
        
        // load Velocity.js if needed
        var velocityURL = "//cdn.rawgit.com/julianshapiro/velocity/1.2.3/velocity.min.js";
        
        if (window.Velocity) {
                AutoAnimations();
        } else if (window.require){
                require([velocityURL], function (Velocity) {
                        AutoAnimations();
                });
        } else {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open("GET", velocityURL);
                xmlhttp.onreadystatechange = function(){
                        if ((xmlhttp.status == 200) && (xmlhttp.readyState == 4)) {
                                eval(xmlhttp.responseText);
                                AutoAnimations();
                        }};
                xmlhttp.send();
        }
        
        function AutoAnimations() {

                // Override native methods (yup, this is hard core)
        
                HTMLElement.prototype._appendChild = HTMLElement.prototype.appendChild;
                HTMLElement.prototype.appendChild = function() {
                        var result = this._appendChild.apply( this, arguments );
                        showElement.apply( this, arguments );
                        return result;
                };
        
                HTMLElement.prototype._insertBefore = HTMLElement.prototype.insertBefore;
                HTMLElement.prototype.insertBefore = function() {
                        var result = this._insertBefore.apply( this, arguments );
                        showElement.apply( this, arguments );
                        return result;
                };
        
                HTMLElement.prototype._replaceChild = HTMLElement.prototype.replaceChild;
                HTMLElement.prototype.replaceChild = function() {
                        return swapElements.apply( this, arguments );
                };
        
                HTMLElement.prototype._removeChild = HTMLElement.prototype.removeChild;
                HTMLElement.prototype.removeChild = function() {
                        hideElement.apply( this, arguments );
                };
        
                function showElement(node) {
                        toggleElement(node, true);
                }
        
                function hideElement(node) {
                        if (isAnimating(node)) {
                                if (node.nextElementSibling) {
                                        do    {
                                                node = node.nextElementSibling;
                                        } while (node.nextElementSibling && isAnimating(node));
                                }
                                if (isAnimating(node)) {
                                        if (node.previousElementSibling) {
                                                do {
                                                        node = node.previousElementSibling;
                                                } while (node.previousElementSibling && isAnimating(node));
                                        }
                                        if (isAnimating(node)) {
                                                console.log("this should not be happening");
                                        }
                                }
                        }
                        toggleElement(node, false, function(){
                                 if (node.parentNode) {
                                        node.parentNode._removeChild(node);
                                 }
                        });
                }
                
                function isAnimating(node) {
                        var velocityData = Velocity.Utilities.data(node);
                        return velocityData && velocityData.velocity && velocityData.velocity.isAnimating;
                }
        
                function swapElements(newChild, oldChild) {
                        // REACT uses noscript often
                        if (oldChild.tagName == "NOSCRIPT") {
                                //treat this as a show
                                oldChild.parentNode._replaceChild(newChild, oldChild);
                                toggleElement(newChild, true);
                        } else if (newChild.tagName == "NOSCRIPT"){
                                //treat this as a hide
                                toggleElement(oldChild, false, function() {
                                        if(oldChild.parentNode)
                                                oldChild.parentNode._replaceChild(newChild, oldChild);
                                });
                        } else {
                                oldChild.parentNode._replaceChild(newChild, oldChild);
                        }
                }
        
                function toggleElement(node, show, onComplete) {
                        // Do not animate some elements
                        if (!node.parentNode || node.parentElement.dataset.reactid == ".0" 
                                || node.parentElement.tagName == "HEAD" || node.parentNode.parentNode == null
                                || !(node instanceof HTMLElement)) {
                                if (onComplete)
                                        onComplete();
                                return;
                        }
        
                        var style = window.getComputedStyle(node);
        
                        // Only animate elements with animation-duration that do not have any 
                        // other animations or transitions properties set
                        if (style.animationDuration == "0s" || style.transform != "none" 
                                || style.animationName != "none" || style.transitionDuration != "0s" ) {
                                if (onComplete)
                                        onComplete();
                                return;
                        }
                        var animationProperties = {
                                duration: parseFloat(style.animationDuration) * 1000, 
                                complete: onComplete, 
                                display: style.display //keep display value
                        };
        
                        //inline, inline-block fixed and absolute will fade instead of slide
                        if (style.position != "static" || style.float != "none" || style.display.indexOf("inline") != -1) {
                                if (show) {
                        node.style.display = 'none';
                        Velocity(node, {opacity:1}, animationProperties);
                                } else {
                                        Velocity.Redirects.fadeOut(node, animationProperties);
                                }
                        } else {
                                if (show) {
                        node.style.display = 'none';
                                        Velocity.Redirects.slideDown(node, animationProperties);
                                } else {
                                        Velocity.Redirects.slideUp(node, animationProperties);
                                }
                        }
                }
        }
})();
