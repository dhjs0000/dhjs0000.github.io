// 设置倒计时时间
var countDownDate = new Date().getTime() + 5 * 1000;

// 每秒更新倒计时
var countdownFunction = setInterval(function() {

  // 获取当前时间
  var now = new Date().getTime();

  // 计算距离结束时间的时间差
  var timeLeft = countDownDate - now;

  // 计算剩余的秒数
  var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  // 在页面上显示倒计时
  document.getElementById("countdown").innerHTML = seconds + "秒 ";

  // 如果倒计时结束，显示一条消息
  if (timeLeft < 0) {
    clearInterval(countdownFunction);
    document.getElementById("countdown").innerHTML = "倒计时结束！";
  }
}, 1000);
