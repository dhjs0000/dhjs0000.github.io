var navbar = document.querySelector('.navbar');
var line = document.querySelector('.nav-line');
var items = Array.from(document.querySelectorAll('.nav-item'));

items.forEach(function(item, index) {
  item.addEventListener('mouseover', function() {
    line.style.width = item.offsetWidth + 'px';
    line.style.left = item.offsetLeft + 'px';
    line.style.transition = 'all 0.5s ease';
  });

  item.addEventListener('mouseout', function() {
    var activeItem = document.querySelector('.nav-item.current');
    line.style.width = activeItem.offsetWidth + 'px';
    line.style.left = activeItem.offsetLeft + 'px';
    line.style.transition = 'all 0.5s ease';
  });
});

// 初始化线段位置
var activeItem = document.querySelector('.nav-item.current');
line.style.width = activeItem.offsetWidth + 'px';
line.style.left = activeItem.offsetLeft + 'px';