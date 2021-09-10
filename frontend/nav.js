//not my code, works well
//source: https://codepen.io/thebabydino/pen/wybaGK/

const _C = document.querySelector('.container'), 
      N = _C.children.length;

let i = 0, x0 = null, locked = false, w;

function unify(e) {	return e.changedTouches ? e.changedTouches[0] : e };

function lock(e) {
  x0 = unify(e).clientX;
	_C.classList.toggle('smooth', !(locked = true))
};

function drag(e) {
	e.preventDefault();
	
	if(locked) 		
		_C.style.setProperty('--tx', `${Math.round(unify(e).clientX - x0)}px`)
};

function move(e) {
  if(locked) {
    let dx = unify(e).clientX - x0, s = Math.sign(dx), 
				f = +(s*dx/w).toFixed(2);

    if((i > 0 || s < 0) && (i < N - 1 || s > 0) && f > .2) {
			_C.style.setProperty('--i', i -= s);
			f = 1 - f
		}
		
    _C.style.setProperty('--tx', '0px');
		_C.style.setProperty('--f', f);
    _C.classList.toggle('smooth', !(locked = false));
    x0 = null
  }
};

function size() { w = window.innerWidth || screen.width };

size();
_C.style.setProperty('--n', N);

addEventListener('resize', size, true);

_C.addEventListener('mousedown', lock, false);
_C.addEventListener('touchstart', lock, true);

_C.addEventListener('mousemove', drag, false);
_C.addEventListener('touchmove', drag, true);

_C.addEventListener('mouseup', move, false);
_C.addEventListener('touchend', move, true);