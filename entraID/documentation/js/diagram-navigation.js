const animationDuration = 800;
let diagram = null;
let overview = null;
const svgObject = document.getElementById("diagram");

svgObject.addEventListener("load", function () {

    const svgDocument = svgObject.contentDocument;

    diagram = svgDocument.documentElement;
    overview = diagram
        .getAttribute("viewBox")
        .split(/[\s,]+/)
        .map(Number); 

    // We can now manipulate the SVG's viewBox.
});

const steps = [
    {
        name: "Browser",
        viewBox: [0, 0, 500, 300]
    },
    {
        name: "Node.js",
        viewBox: [500, 0, 500, 300]
    },
    {
        name: "CodeStep1",
        viewBox: [800, 0, 500, 300]
    }
];
let currentStep = 0;
function showStep(index) {

    const step = steps[index];

    animateViewBox(step.viewBox);
}
function showAll() {
      animateViewBox(overview);
}
const nextButton = document.getElementById("next-btn");
nextButton.addEventListener("click", function () {

    if (currentStep == steps.length -1 ) {

        currentStep = 0;
    } else {
        currentStep+=1;
    }
  showStep(currentStep);
});
const prevButton = document.getElementById("previous-btn");
prevButton.addEventListener("click", function () {
  if (currentStep == 0 ) {
    currentStep = steps.length - 1;
  } else {
    currentStep-=1;
  }
  showStep(currentStep);
});
const showAllButton = document.getElementById("show-all-btn");
showAllButton.addEventListener("click", function () {
  showAll();
});


function easeInOut(t) {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}


function animateViewBox(targetViewBox) {

    // Cancel an animation that is already running.
    //if (animationFrameId !== null) {
    //    cancelAnimationFrame(animationFrameId);
    //}

    // Read the current camera position.
    const startViewBox = diagram
        .getAttribute("viewBox")
        .trim()
        .split(/[\s,]+/)
        .map(Number);

    // Record when the animation begins.
    const startTime = performance.now();

    function animate(currentTime) {

        // Calculate how much time has elapsed.
        const elapsed = currentTime - startTime;

        // Calculate progress between 0 and 1.
        const progress = Math.min(
            elapsed / animationDuration,
            1
        );

        // Apply easing.
        const easedProgress = easeInOut(progress);

        // Calculate the intermediate camera position.
        const currentViewBox = startViewBox.map(
            (startValue, index) => {

                const targetValue = targetViewBox[index];

                return startValue +
                    (targetValue - startValue) * easedProgress;
            }
        );

        // Update the SVG camera.
        diagram.setAttribute(
            "viewBox",
            currentViewBox.join(" ")
        );

        // Continue until the animation finishes.
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            animationFrameId = null;
        }
    }

    animationFrameId = requestAnimationFrame(animate);
}
