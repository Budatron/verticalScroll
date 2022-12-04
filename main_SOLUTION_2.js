import './style_SOLUTION_2.css'

gsap.registerPlugin(ScrollTrigger, Draggable, MotionPathPlugin)

gsap.set('.gallery', {autoAlpha: 1})

let iteration = 0;

// gsap.set('.cards li', {yPercent: 400, opacity: 0, scale: 0})
let yPer = 400
gsap.set('.cards-a li', {yPercent: yPer})
gsap.set('.cards-b li', {yPercent: yPer})
// gsap.set('.cards li', {xPercent: -50, yPercent: -50, transformOrigin: "50% 50%"})

const spacing = 0.16;
const snapTime = gsap.utils.snap(spacing);
const cardsA = gsap.utils.toArray('.cards-a li');
const cardsB = gsap.utils.toArray('.cards-b li');
const animateFunc = element => {
        const tl = gsap.timeline();
        tl
        // .fromTo(element, {scale: 0, opacity: 0}, {scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false})
        .fromTo(element, {yPercent: yPer}, {yPercent: -yPer, duration: 1
            ,motionPath:{
                path: "M1 1168V888C1.00001 804 74.6 612 433 596C791.4 580 761 436 761 320V0",
                autoRotate: 40
            }
      
        , ease: "none", immediateRender: false}, 0);
        return tl
    }
const seamlessLoop = buildSeamlessLoop(cardsA, cardsB, spacing, animateFunc)
const playhead = {offset: 0}
const wrapTime = gsap.utils.wrap(0, seamlessLoop.duration())
const scrub = gsap.to(playhead, {offset: 0, onUpdate() {seamlessLoop.time(wrapTime(playhead.offset))}, duration: 0.5, ease: "poser3", paused: true})
const trigger = ScrollTrigger.create({start: 0, onUpdate(self) {
    let scroll = self.scroll();
    if(scroll > self.end -1) {
        wrap(1, 1)
    } else if(scroll < 1 && self.direction < 0) {
        wrap(-1, self.end - 1);
    } else {
        scrub.vars.offset = (iteration + self.progress) * seamlessLoop.duration();
        scrub.invalidate().restart();
    }
}, end: "+=3000", pin: '.gallery'})
const progressToScroll = progress => gsap.utils.clamp(1, trigger.end -1, gsap.utils.wrap(0, 1, progress) * trigger.end)
const wrap = (iterationDelta, scrollTo) => {
    iteration += iterationDelta;
    trigger.scroll(scrollTo);
    trigger.update();
}

// ScrollTrigger.addEventListener('scrollEnd', () => scrollToOffset(scrub.vars.offset));

function scrollToOffset(offset) {
    let snappedTime = snapTime(offset)
    let progress = (snappedTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration()
    let scroll = progressToScroll(progress);
    if(progress >= 1 || progress < 0) {
        return wrap(Math.floor(progress), scroll)
    }
    trigger.scroll(scroll)
}

// document.querySelector('.next').addEventListener('click', () => scrollToOffset(scrub.vars.offset + spacing))
// document.querySelector('.prev').addEventListener('click', () => scrollToOffset(scrub.vars.offset - spacing))

function buildSeamlessLoop(itemsA, itemsB, spacing, animateFunc) {
    let rawSequence = gsap.timeline({paused: true})
    let seamlessLoop = gsap.timeline({paused: true, repeat: -1, onRepeat() {
        this.totalTime(this.rawTime() + this.duration() * 100)
    }})
    let cycleDuraion = spacing * itemsA.length;
    let dur;

    itemsA.concat(itemsA).concat(itemsA).forEach((item, i) => {
        let anim = animateFunc(itemsA[i % itemsA.length]);
        rawSequence.add(anim, i * spacing);
        dur || (dur = anim.duration());
    })

    itemsB.concat(itemsB).concat(itemsB).forEach((item, i) => {
        let anim = animateFunc(itemsB[i % itemsA.length]);
        rawSequence.add(anim, i * spacing);
        dur || (dur = anim.duration());
    })

    seamlessLoop.fromTo(rawSequence, {
        time: cycleDuraion + dur / 2
    }, {
        time: "+=" + cycleDuraion,
        duration: cycleDuraion,
        ease: "none"
    })
    return seamlessLoop
}

Draggable.create('.drag-proxy', {
    type: "y",
    trigger: ".cards-b",
    onPress() {
        this.startOffset = scrub.vars.offset
    },
    onDrag() {
        scrub.vars.offset = this.startOffset + (this.startY - this.y) * 0.001;
        scrub.invalidate().restart();
    },
    onDragEnd() {
        scrollToOffset(scrub.vars.offset)
    }
})


// function draw() {
//     const ctx = document.getElementById('canvas-text').getContext('2d');
//     var img = document.getElementById("rectangle");
//     ctx.drawImage(img, 100, 10);
//     ctx.font = '48px serif';
//     ctx.globalCompositeOperation = 'source-in';
//     ctx.fillText('This is some text to test', 10, 50);
//   }

//   draw();