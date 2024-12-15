console.log("BBYC©2021-2023版权所有\n███████████████▒▒ ███████████████▒▒ ██▒▒         ██▒▒ ██████████████▒▒\n██▒▒          ██▒▒██▒▒          ██▒▒  ██▒▒     ██▒▒ ██▒▒              \n██▒▒          ██▒▒██▒▒          ██▒▒    ██▒▒ ██▒▒   ██▒▒              \n███████████████▒▒ ███████████████▒▒       ███▒▒     ██▒▒              \n██▒▒          ██▒▒██▒▒          ██▒▒      ███▒▒     ██▒▒              \n██▒▒          ██▒▒██▒▒          ██▒▒      ███▒▒     ██▒▒              \n███████████████▒▒ ███████████████▒▒       ███▒▒       ██████████████▒▒\n");

const websites = [
    // 搜索引擎
    { 
        category: '搜索引擎', 
        name: 'Bing', 
        url: 'https://www.bing.com', 
        icon: 'fas fa-search', 
        description: '全球领先的搜索引擎' 
    },
    { 
        category: '搜索引擎', 
        name: '百度', 
        url: 'https://www.baidu.com', 
        icon: 'fas fa-search', 
        description: '全球最大的中文搜索引擎' 
    },
    { 
        category: '搜索引擎', 
        name: 'Google', 
        url: 'https://www.google.com', 
        icon: 'fab fa-google', 
        description: '全球最大的搜索引擎' 
    },
    { 
        category: '搜索引擎', 
        name: 'Yandex', 
        url: 'https://yandex.com', 
        icon: 'fas fa-search', 
        description: '俄罗斯最大的搜索引擎' 
    },

    // 视频网站
    { 
        category: '视频网站', 
        name: '哔哩哔哩', 
        url: 'https://www.bilibili.com', 
        icon: 'fas fa-video', 
        description: '年轻人的弹幕视频网站' 
    },
    { 
        category: '视频网站', 
        name: 'YouTube', 
        url: 'https://www.youtube.com', 
        icon: 'fab fa-youtube', 
        description: '全球最大的视频分享平台' 
    },

    // 开发平台
    { 
        category: '开发平台', 
        name: 'GitHub', 
        url: 'https://github.com', 
        icon: 'fab fa-github', 
        description: '全球最大的开源代码托管平台' 
    },
    { 
        category: '开发平台', 
        name: 'Stack Overflow', 
        url: 'https://stackoverflow.com', 
        icon: 'fab fa-stack-overflow', 
        description: '全球最大的程序员问答社区' 
    },

    // 社交网络
    { 
        category: '社交网络', 
        name: 'LinkedIn', 
        url: 'https://www.linkedin.com', 
        icon: 'fab fa-linkedin', 
        description: '全球领先的职业社交平台' 
    },
    { 
        category: '社交网络', 
        name: 'Twitter', 
        url: 'https://twitter.com', 
        icon: 'fab fa-twitter', 
        description: '全球知名的社交媒体平台' 
    },
    { 
        category: '社交网络', 
        name: 'Facebook', 
        url: 'https://www.facebook.com', 
        icon: 'fab fa-facebook', 
        description: '全球最大的社交网络平台' 
    },

    // 设计网站
    { 
        category: '设计网站', 
        name: '花瓣网', 
        url: 'https://huaban.com', 
        icon: 'fas fa-palette', 
        description: '设计师的灵感收集平台' 
    },
    { 
        category: '设计网站', 
        name: 'Dribbble', 
        url: 'https://dribbble.com', 
        icon: 'fab fa-dribbble', 
        description: '全球顶尖的设计师社区' 
    },
    { 
        category: '设计网站', 
        name: 'Behance', 
        url: 'https://www.behance.net', 
        icon: 'fab fa-behance', 
        description: '创意设计师的作品展示平台' 
    },

    // IT技术
    { 
        category: 'IT技术', 
        name: 'CSDN', 
        url: 'https://www.csdn.net', 
        icon: 'fas fa-laptop-code', 
        description: '中国最大的IT社区和服务平台' 
    },
    { 
        category: 'IT技术', 
        name: '掘金', 
        url: 'https://juejin.cn', 
        icon: 'fas fa-book', 
        description: '一个帮助开发者成长的社区' 
    },

    // B2B贸易平台
    { 
        category: 'B2B贸易平台', 
        name: 'Alibaba', 
        url: 'https://www.alibaba.com', 
        icon: 'fas fa-shopping-cart', 
        description: '全球最大的在线B2B交易平台' 
    },
    { 
        category: 'B2B贸易平台', 
        name: 'Made-in-China', 
        url: 'https://www.made-in-china.com', 
        icon: 'fas fa-industry', 
        description: '中国制造业B2B交易平台' 
    },

    // 政府采购
    { 
        category: '政府采购', 
        name: '中国政府采购网', 
        url: 'http://www.ccgp.gov.cn', 
        icon: 'fas fa-landmark', 
        description: '中国政府采购信息发布平台' 
    },
    { 
        category: '政府采购', 
        name: 'DG Market', 
        url: 'https://www.dgmarket.com', 
        icon: 'fas fa-globe', 
        description: '发展机构和政府发布的采购招标资讯' 
    },

    // 家具协会
    { 
        category: '家具协会', 
        name: '美国家具联盟', 
        url: 'https://www.ahfa.us', 
        icon: 'fas fa-couch', 
        description: '美国家具制造商协会' 
    },
    { 
        category: '家具协会', 
        name: '英国家具生产商协会', 
        url: 'https://www.bfm.org.uk', 
        icon: 'fas fa-chair', 
        description: '英国家具生产商协会' 
    },
    { 
        category: '家具协会', 
        name: '新加坡家具工业理事会', 
        url: 'https://www.singaporefurniture.com', 
        icon: 'fas fa-couch', 
        description: '新加坡家具工业理事会' 
    },

    // 导航地图
    { 
        category: '导航地图', 
        name: '百度地图', 
        url: 'https://map.baidu.com', 
        icon: 'fas fa-map-marked-alt', 
        description: '中国领先的地图服务平台' 
    },
    { 
        category: '导航地图', 
        name: 'Google Maps', 
        url: 'https://www.google.com/maps', 
        icon: 'fas fa-map', 
        description: '全球最大的地图服务平台' 
    },
    { 
        category: '导航地图', 
        name: '高德地图', 
        url: 'https://www.amap.com', 
        icon: 'fas fa-location-arrow', 
        description: '专业的导航和位置服务平台' 
    },

    // 电商平台
    { 
        category: '电商平台', 
        name: '淘宝', 
        url: 'https://www.taobao.com', 
        icon: 'fas fa-shopping-bag', 
        description: '中国最大的在线购物平台' 
    },
    { 
        category: '电商平台', 
        name: '京东', 
        url: 'https://www.jd.com', 
        icon: 'fas fa-shopping-cart', 
        description: '中国领先的自营式电商平台' 
    },
    { 
        category: '电商平台', 
        name: 'Amazon', 
        url: 'https://www.amazon.com', 
        icon: 'fab fa-amazon', 
        description: '全球最大的电子商务平台' 
    },

    // 其他工具
    { 
        category: '其他工具', 
        name: '在线PS', 
        url: 'https://www.photopea.com', 
        icon: 'fas fa-image', 
        description: '免费在线图片编辑工具' 
    },
    { 
        category: '其他工具', 
        name: '文件转换器', 
        url: 'https://convertio.co/zh', 
        icon: 'fas fa-file-alt', 
        description: '在线文件格式转换工具' 
    },
    { 
        category: '其他工具', 
        name: '在线翻译', 
        url: 'https://translate.google.com', 
        icon: 'fas fa-language', 
        description: 'Google在线翻译工具' 
    }
];

// 添加滚动到分类的函数
function scrollToCategory(category) {
    // 找到对应分类的元素
    const categoryElements = document.querySelectorAll('.categoryTitle');
    for (let element of categoryElements) {
        if (element.textContent.trim() === category) {
            // 平滑滚动到该元素
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // 添加高亮效果
            element.style.transition = 'color 0.3s ease';
            element.style.color = '#7881ff';
            
            // 3秒后恢复原色
            setTimeout(() => {
                element.style.color = '';
            }, 3000);
            
            break;
        }
    }
}

$(document).ready(function() {
    displayWebsites();
    
    // 视图切换功能
    $('.view-btn').click(function() {
        const viewType = $(this).hasClass('grid-view') ? 'grid-view' : 'list-view';
        
        // 更新按钮状态
        $('.view-btn').removeClass('active');
        $(this).addClass('active');
        
        // 更新所有网站列表的视图
        $('.websiteButtons')
            .removeClass('grid-view list-view')
            .addClass(viewType);
        
        // 保存用户偏好
        localStorage.setItem('preferred-view', viewType);
    });
    
    // 恢复用户偏好的视图
    const preferredView = localStorage.getItem('preferred-view') || 'grid-view';
    $(`.view-btn.${preferredView}`).click();
    
    // 原有的法术按钮功能
    $('#newSpellButton').click(function() {
        alert('"法术"已生效');
        document.body.contentEditable='true'; 
        document.designMode='on'; 
        void 0
    });
});

function displayWebsites() {
    const websiteList = $('#websiteList');
    websiteList.empty();

    const categories = [...new Set(websites.map(website => website.category))];
    categories.forEach((category, index) => {
        const categoryWebsites = websites.filter(website => website.category === category);
        const categorySection = $('<div>').addClass('categorySection').addClass('category' + (index + 1));
        
        const categoryTitle = $('<h2>').addClass('categoryTitle').text(category);
        categorySection.append(categoryTitle);

        // 默认使用网格视图
        const websiteButtons = $('<div>').addClass('websiteButtons grid-view');

        categoryWebsites.forEach(website => {
            const button = $('<a>').addClass('button')
                .attr('href', website.url)
                .attr('target', '_blank');

            const icon = $('<i>').addClass(website.icon);
            const name = $('<p>').addClass('name').text(website.name);
            const desc = $('<p>').addClass('desc').text(website.description);

            button.append(icon, name, desc);
            websiteButtons.append(button);
        });

        categorySection.append(websiteButtons);
        websiteList.append(categorySection);
    });
}