// var timer = false;
// var minutes = 0;
// var seconds = 0;

// const TIMER = document.querySelector(".timer_counter");

// window.onload = main();

// function main() {
//     if(timer) {
//         return;
//     }

//     toggle(true);
// }

// function stopwatch() {
//     seconds++;

//     if(seconds == 60) {
//         seconds = 0;
//         minutes++;
//     }

//     if (seconds < 10 && minutes < 10) {
//         TIMER.innerHTML = `0${minutes} : 0${seconds}`;
//     } else if (minutes < 10) {
//         TIMER.innerHTML = `0${minutes} : ${seconds}`;
//     } else if (seconds < 10) {
//         TIMER.innerHTML = `${minutes} : 0${seconds}`;
//     } else {
//         TIMER.innerHTML = `${minutes} : ${seconds}`;
//     }
// }

// function reset() {
//     minutes = 0;
//     seconds = 0;
//     return;
// }

// export function toggle(lever) {
//     if(lever) {
//         timer = setInterval(stopwatch, 1000);
//         timer = true;
//         return;
//     }

//     timer = false;
//     return;
// }