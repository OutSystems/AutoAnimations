(function(){

// Configuration needed by AutoAnimations
// document.styleSheets[0].insertRule("* {animation-duration: .2s}", 0);

// Load Velocity.js if needed

if (window.Velocity) {
	AutoAnimations();
} else {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", "//cdn.rawgit.com/julianshapiro/velocity/1.2.3/velocity.min.js");
	xmlhttp.onreadystatechange = function(){
		if ((xmlhttp.status == 200) && (xmlhttp.readyState == 4)) {
			eval(xmlhttp.responseText);
			AutoAnimations();
		}};
	xmlhttp.send();
}

// AUTO ANIMATIONS

function AutoAnimations() {
    /*

        AUTO ANIMATIONS

        Automatically animate all inserted and removed DOM elements with good defaults:
         - Slide down/up for elements with display=block & position=static
         - Fade in/out for all others
         - Elements with existing CSS transitions or animations will be left alone
         - Uses velocity.js to assure smooth 60fps animations

        USAGE: Just add an animation duration to your css, e.g. 

            * { 
                animation-duration: .2s; 
            }

        EXCEPTIONS: If you don't want some element to automatically animate (e.g. external libraries) just set its animation-duration to 0s, e.g. :
                .SomeCutomComponent, .SomCustomComponent * {animation-duration: 0s; }  
    */

    if (HTMLElement.prototype._insertBefore)
        return;

    // Override native methods (yup, this is hard core)

    HTMLElement.prototype._appendChild = HTMLElement.prototype.appendChild;
    HTMLElement.prototype.appendChild = function() {
        var result = this._appendChild.apply( this, arguments );
        showElement.apply( this, arguments )
        return result;
    };

    HTMLElement.prototype._insertBefore = HTMLElement.prototype.insertBefore;
    HTMLElement.prototype.insertBefore = function() {
        var result = this._insertBefore.apply( this, arguments );
        showElement.apply( this, arguments )
        return result;
    };

    HTMLElement.prototype._replaceChild = HTMLElement.prototype.replaceChild;
    HTMLElement.prototype.replaceChild = function() {
        return swapElements.apply( this, arguments );
    }

    HTMLElement.prototype._removeChild = HTMLElement.prototype.removeChild;
    HTMLElement.prototype.removeChild = function() {
        hideElement.apply( this, arguments );
    }

    function storeDisplayAndHide(node) {
        node.dataset.initialDisplay = node.style.display;
        node.style.display = 'none';
    }

    function restoreDisplay(node) {
        if(node.dataset.initialDisplay != null){
            node.display = node.dataset.initialDisplay;
            delete node.dataset.initialDisplay;
        }
    }


    function showElement(node) {
        toggleElement(node, true);
    }

    function hideElement(node) {
        toggleElement(node, false, function(){
             if (node.parentNode)
                node.parentNode._removeChild(node);
        });
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
                storeDisplayAndHide(node);
                Velocity(node, {opacity:1}, animationProperties);
            } else {
                Velocity.Redirects.fadeOut(node, animationProperties);
            }
        } else {
            if (show) {
                storeDisplayAndHide(node);
                Velocity.Redirects.slideDown(node, animationProperties);
            } else {
                Velocity.Redirects.slideUp(node, animationProperties);
            }
        }
    }
}


})();
