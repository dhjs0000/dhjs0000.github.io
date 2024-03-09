// 设置倒计时时间（5秒）
var countDownDate = new Date().getTime() + 5 * 1000;
var countdownFunction;

// 每秒更新倒计时
function startCountdown() {
  countdownFunction = setInterval(function() {

    // 获取当前时间
    var now = new Date().getTime();

    // 计算距离结束时间的时间差
    var timeLeft = countDownDate - now;

    // 计算剩余的秒数
    var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // 在页面上显示倒计时
    document.getElementById("countdown").innerHTML = "<h1>" + (seconds + 2) + "秒 </h1>";

    // 如果倒计时结束，跳转到zy.html
    if (timeLeft < 0) {
      clearInterval(countdownFunction);
      window.location.href = ".\\newBBYCweb\\index.html";
    }
  }, 1000);
}

// 取消倒计时和跳转
function cancelCountdown() {
  clearInterval(countdownFunction);
  document.getElementById("countdown").innerHTML = "倒计时已取消";
}

// 在页面加载时开始倒计时
window.onload = startCountdown;
